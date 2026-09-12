const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser
} = require('../controllers/authController');

const { getUser } = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.get('/profile', authMiddleware, getUser);

module.exports = router;