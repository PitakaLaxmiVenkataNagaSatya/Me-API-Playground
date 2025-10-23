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
    const { name, email, education, work, github, linkedin, portfolio } = req.body;

    const profile = await Profile.create({
      name,
      email,
      education,
      work,
      github,
      linkedin,
      portfolio
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


sequelize.sync()
  .then(() => console.log('Database & tables synced'))
  .catch(err => console.error('Sync error:', err));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
