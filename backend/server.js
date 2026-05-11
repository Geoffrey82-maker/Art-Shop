const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');
const corsOptions = require('./config/corsOptions');
const {logger} = require('./middleware/logEvents');
require('dotenv').config();
const { logEvents } = require('./middleware/logEvents')
const cookieParser = require('cookie-parser');
const errLog = require('./middleware/errLog');
const credentials = require('./middleware/credentials');

// Middleware
app.use(cookieParser());

app.use(errLog);

app.use(logger);

app.use(cors(corsOptions));

app.use(credentials);

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(express.json());

// Routes

app.use('/api/register', require('./routes/register'));
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});