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

sequelize.sync()
  .then(() => console.log('Database & tables synced'))
  .catch(err => console.error('Sync error:', err));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
