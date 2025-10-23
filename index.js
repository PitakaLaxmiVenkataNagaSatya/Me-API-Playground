const express = require('express');
const app = express();
const PORT = 3000;

const sequelize = require('./config/db');
const Profile = require('./models/Profile');

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', message: 'Server and DB are running!' });
  } catch (error) {
    console.error('DB connection error:', error);
    res.status(500).json({ status: 'Error', message: 'Database not reachable' });
  }
});

app.post('/profile', async (req, res) => {
  try {
    const { name, email, education, work, github, linkedin, skills, projects } = req.body;

    const profile = await Profile.create({
      name,
      email,
      education,
      work,
      github,
      linkedin,
      skills,
      projects
    });

    res.status(201).json({ message: 'Profile created successfully', data: profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Failed to create profile', error: error.message });
  }
});


app.get('/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const profile = await Profile.findOne({ where: { email } });
      if (!profile) return res.status(404).json({ message: 'Profile not found' });
      return res.json({ data: profile });
    }
    const profiles = await Profile.findAll();
    res.json({ data: profiles });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/profile/:id', async (req, res) => {
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

app.get('/projects', async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) return res.status(400).json({ message: 'Please provide a skill to filter by' });

    const profiles = await Profile.findAll();
    const filteredProjects = [];

    profiles.forEach(profile => {
      if (profile.skills && profile.skills.includes(skill)) {
        if (profile.projects) {
          profile.projects.forEach(project => {
            filteredProjects.push({ profileName: profile.name, ...project });
          });
        }
      }
    });

    res.json({ data: filteredProjects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/skills/top', async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    const skillCount = {};

    profiles.forEach(profile => {
      if (profile.skills) {
        profile.skills.forEach(skill => {
          skillCount[skill] = (skillCount[skill] || 0) + 1;
        });
      }
    });

    const sortedSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .map(([skill, count]) => ({ skill, count }));

    res.json({ data: sortedSkills });
  } catch (err) {
    console.error('Error fetching top skills:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Please provide a search query' });

    const profiles = await Profile.findAll();
    const results = [];

    profiles.forEach(profile => {
      const inName = profile.name.toLowerCase().includes(q.toLowerCase());
      const inSkills = profile.skills && profile.skills.some(skill => skill.toLowerCase().includes(q.toLowerCase()));
      const inProjects = profile.projects && profile.projects.some(proj => proj.title.toLowerCase().includes(q.toLowerCase()));

      if (inName || inSkills || inProjects) {
        results.push(profile);
      }
    });

    res.json({ data: results });
  } catch (err) {
    console.error('Error searching profiles:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



sequelize.sync()
  .then(() => console.log('Database & tables synced'))
  .catch(err => console.error('Sync error:', err));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
