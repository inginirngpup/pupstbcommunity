const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
    getGroupPosts,
    createPost,
    getCommentsByPost,
    createComment,
    getRepliesByComment,
    createReply,
    likePost,
    unlikePost,
    likeComment,
    unlikeComment,
    likeReply,
    unlikeReply
} = require('../controllers/contentController');

router.use(authMiddleware);

router.get('/groups/:groupId/posts', getGroupPosts);
router.post('/groups/:groupId/posts', createPost);

router.get('/posts/:postId/comments', getCommentsByPost);
router.post('/posts/:postId/comments', createComment);

router.get('/comments/:commentId/replies', getRepliesByComment);
router.post('/comments/:commentId/replies', createReply);

router.post('/posts/:postId/like', likePost);
router.delete('/posts/:postId/like', unlikePost);

router.post('/comments/:commentId/like', likeComment);
router.delete('/comments/:commentId/like', unlikeComment);

router.post('/replies/:replyId/like', likeReply);
router.delete('/replies/:replyId/like', unlikeReply);

module.exports = router;
