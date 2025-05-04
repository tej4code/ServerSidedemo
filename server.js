require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/index.js');
const router = require('./router');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', router);


sequelize.sync()
  .then(() => {
    console.log('Database connected and models synced.');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('DB connection error:', err));
