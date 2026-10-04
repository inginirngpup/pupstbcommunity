const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
    getUserGroups,
    getGroupById,
    createGroup,
    joinGroup,
    leaveGroup,
    getGroupMembers
} = require('../controllers/groupController');

router.use(authMiddleware);

router.get('/mine', getUserGroups);
router.post('/', createGroup);
router.get('/:groupId', getGroupById);
router.get('/:groupId/members', getGroupMembers);
router.post('/:groupId/join', joinGroup);
router.delete('/:groupId/leave', leaveGroup);

module.exports = router;
