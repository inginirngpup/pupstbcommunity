const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
    getUser,
    updateUserProfile,
    updateUserPassword,
    verifyUser
} = require('../controllers/userController');

router.use(authMiddleware);

router.get('/me', getUser);
router.get('/:id', getUser);
router.patch('/me', updateUserProfile);
router.patch('/me/password', updateUserPassword);
router.patch('/me/verify', verifyUser);

module.exports = router;
