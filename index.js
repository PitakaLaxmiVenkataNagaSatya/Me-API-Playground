const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const sequelize = require('./config/db');
const Profile = require('./models/Profile');

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Serve the minimal frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', message: 'Server and DB are running!' });
  } catch (error) {
    console.error('DB connection error:', error);
    res.status(500).json({ status: 'Error', message: 'Database not reachable' });
  }
});

// API routes
const api = express.Router();

// Helpers to format plain text responses
function wantsText(req) {
  const fmt = (req.query.format || '').toLowerCase();
  return fmt === 'txt' || fmt === 'text' || req.get('accept')?.includes('text/plain');
}

function profileToText(profile) {
  if (!profile) return 'No profile found';
  const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : '';
  const links = profile.links || {};
  const work = Array.isArray(profile.work)
    ? profile.work.map(w => [
        `${w.role} at ${w.company} (${w.period})`,
        '',
        (w.summary || '').trim()
      ].join('\n')).join('\n\n')
    : '';
  const projects = Array.isArray(profile.projects)
    ? profile.projects.map(p => {
        const when = p.when ? ` – ${p.when}` : '';
        const ptitle = `${p.title}${when}`;
        const pdesc = (p.description || '').trim();
        const plinks = p.links && p.links.github ? `GitHub: ${p.links.github}` : '';
        return [ptitle, '', pdesc, plinks].filter(Boolean).join('\n');
      }).join('\n\n')
    : '';

  return [
    `Name: ${profile.name}`,
    `Email: ${profile.email}`,
    '',
    `Education: ${profile.education || ''}`,
    `Skills: ${skills}`,
    '',
    'Work:',
    '',
    work,
    '',
    'Projects:',
    '',
    projects,
    '',
    'Links:',
    '',
    links.github ? `GitHub: ${links.github}` : '',
    links.linkedin ? `LinkedIn: ${links.linkedin}` : '',
    links.portfolio ? `Portfolio: ${links.portfolio}` : ''
  ].filter(line => line !== undefined).join('\n');
}

function projectsToText(items) {
  if (!items || items.length === 0) return 'No projects found';
  return items.map(it => `Profile: ${it.profileName}\n- ${it.project.title}\n  ${it.project.description || ''}`).join('\n\n');
}

function skillsToText(items) {
  if (!items || items.length === 0) return 'No skills found';
  return items.map(it => `${it.skill}: ${it.count}`).join('\n');
}

function searchToText(items) {
  if (!items || items.length === 0) return 'No results';
  return items.map(p => profileToText(p)).join('\n\n---\n\n');
}

// Create or update (upsert) profile
api.post('/profile', async (req, res) => {
  try {
    const { name, email, education, work, links, skills, projects } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const [profile, created] = await Profile.findOrCreate({
      where: { email },
      defaults: { name, education, work, links, skills, projects },
    });

    if (!created) {
      await profile.update({ name, education, work, links, skills, projects });
    }

    if (wantsText(req)) {
      res.type('text/plain').status(created ? 201 : 200).send(profileToText(profile));
    } else {
      res.status(created ? 201 : 200).json({
        message: created ? 'Profile created successfully' : 'Profile updated successfully',
        data: profile,
      });
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ message: 'Failed to upsert profile', error: error.message });
  }
});

// Read profile(s)
api.get('/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const profile = await Profile.findOne({ where: { email } });
      if (!profile) return res.status(404).json({ message: 'Profile not found' });
      if (wantsText(req)) return res.type('text/plain').send(profileToText(profile));
      return res.json({ data: profile });
    }
    // Default: return the most recently updated profile (single owner use-case)
    const profile = await Profile.findOne({ order: [['updatedAt', 'DESC']] });
    if (!profile) {
      if (wantsText(req)) return res.type('text/plain').send('No profile found');
      return res.json({ data: null });
    }
    if (wantsText(req)) return res.type('text/plain').send(profileToText(profile));
    res.json({ data: profile });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Read by id
api.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    if (wantsText(req)) return res.type('text/plain').send(profileToText(profile));
    res.json({ data: profile });
  } catch (err) {
    console.error('Error fetching profile by ID:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update by id
api.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const profile = await Profile.findByPk(id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    await profile.update(updates);
    res.json({ message: 'Profile updated', data: profile });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- Projects by skill -----------------
api.get('/projects', async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) return res.status(400).json({ message: 'Please provide a skill to filter by' });

    const profiles = await Profile.findAll();
    const q = (skill || '').toLowerCase();
    const filteredProjects = [];

    profiles.forEach((profile) => {
      const projects = Array.isArray(profile.projects) ? profile.projects : [];
      projects.forEach((p) => {
        const projectSkills = (p.skills || []).map((s) => String(s).toLowerCase());
        if (projectSkills.includes(q)) {
          filteredProjects.push({ profileName: profile.name, project: p });
        }
      });
    });

    if (wantsText(req)) return res.type('text/plain').send(projectsToText(filteredProjects));
    res.json({ data: filteredProjects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- Top skills -----------------
api.get('/skills/top', async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    const skillCount = {};

    profiles.forEach((profile) => {
      const skills = Array.isArray(profile.skills) ? profile.skills : [];
      skills.forEach((s) => {
        const key = String(s).trim();
        if (!key) return;
        skillCount[key] = (skillCount[key] || 0) + 1;
      });
    });

    const sortedSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .map(([skill, count]) => ({ skill, count }));

    if (wantsText(req)) return res.type('text/plain').send(skillsToText(sortedSkills));
    res.json({ data: sortedSkills });
  } catch (err) {
    console.error('Error fetching top skills:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- Search -----------------
api.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Please provide a search query' });
    const needle = String(q).toLowerCase();

    const profiles = await Profile.findAll();
    const results = [];

    profiles.forEach((profile) => {
      const skills = Array.isArray(profile.skills) ? profile.skills.map((s) => String(s).toLowerCase()) : [];
      const projects = Array.isArray(profile.projects) ? profile.projects : [];

      const inName = String(profile.name || '').toLowerCase().includes(needle);
      const inSkills = skills.some((s) => s.includes(needle));
      const inProjects = projects.some((p) =>
        String(p.title || '').toLowerCase().includes(needle) ||
        String(p.description || '').toLowerCase().includes(needle)
      );

      if (inName || inSkills || inProjects) {
        results.push(profile);
      }
    });

    if (wantsText(req)) return res.type('text/plain').send(searchToText(results));
    res.json({ data: results });
  } catch (err) {
    console.error('Error searching profiles:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.use('/api', api);

// DB init and server start
sequelize
  .sync()
  // .sync({ force: true })
  .then(() => console.log('Database & tables synced'))
  .catch((err) => console.error('Sync error:', err));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
