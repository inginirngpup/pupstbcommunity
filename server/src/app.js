const express = require('express');
const app = express();

const cors = require('cors');

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoute');
app.use('/api/auth', authRoutes);

module.exports = app;