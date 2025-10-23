const express = require('express');
const app = express();
const PORT = 3000;

const sequelize = require('./config/db');

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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
