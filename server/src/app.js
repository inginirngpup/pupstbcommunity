const express = require('express');
const app = express();

const cors = require('cors');

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const groupRoutes = require('./routes/groupRoute');
const contentRoutes = require('./routes/contentRoute');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api', contentRoutes);

module.exports = app;