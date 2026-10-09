const pool = require('../db');

const getGroupPosts = async (req, res) => {
    const { groupId } = req.params;

    try {
        const query = `
            SELECT
                p.post_id,
                p.user_id,
                u.username,
                p.group_id,
                p.content_body,
                p.is_deleted,
                p.created_at,
                p.time_deleted
            FROM posts p
            JOIN users u ON u.user_id = p.user_id
            WHERE p.group_id = $1
              AND p.is_deleted = FALSE
            ORDER BY p.created_at DESC
        `;

        const result = await pool.query(query, [groupId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPost = async (req, res) => {
    const { groupId } = req.params;
    const { content_body } = req.body;

    if (!content_body) {
        return res.status(400).json({ error: 'content_body is required' });
    }

    try {
        const query = `
            INSERT INTO posts (user_id, group_id, content_body)
            VALUES ($1, $2, $3)
            RETURNING post_id, user_id, group_id, content_body, created_at
        `;

        const result = await pool.query(query, [req.user.userId, groupId, content_body]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCommentsByPost = async (req, res) => {
    const { postId } = req.params;

    try {
        const query = `
            SELECT
                c.comment_id,
                c.post_id,
                c.user_id,
                u.username,
                c.comment_body,
                c.commented_at,
                c.is_deleted
            FROM comments c
            JOIN users u ON u.user_id = c.user_id
            WHERE c.post_id = $1
              AND c.is_deleted = FALSE
            ORDER BY c.commented_at ASC
        `;

        const result = await pool.query(query, [postId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createComment = async (req, res) => {
    const { postId } = req.params;
    const { comment_body } = req.body;

    if (!comment_body) {
        return res.status(400).json({ error: 'comment_body is required' });
    }

    try {
        const query = `
            INSERT INTO comments (post_id, user_id, comment_body)
            VALUES ($1, $2, $3)
            RETURNING comment_id, post_id, user_id, comment_body, commented_at
        `;

        const result = await pool.query(query, [postId, req.user.userId, comment_body]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRepliesByComment = async (req, res) => {
    const { commentId } = req.params;

    try {
        const query = `
            SELECT
                r.reply_id,
                r.comment_id,
                r.user_id,
                u.username,
                r.reply_body,
                r.replied_at,
                r.is_deleted
            FROM replies r
            JOIN users u ON u.user_id = r.user_id
            WHERE r.comment_id = $1
              AND r.is_deleted = FALSE
            ORDER BY r.replied_at ASC
        `;

        const result = await pool.query(query, [commentId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createReply = async (req, res) => {
    const { commentId } = req.params;
    const { reply_body } = req.body;

    if (!reply_body) {
        return res.status(400).json({ error: 'reply_body is required' });
    }

    try {
        const query = `
            INSERT INTO replies (comment_id, user_id, reply_body)
            VALUES ($1, $2, $3)
            RETURNING reply_id, comment_id, user_id, reply_body, replied_at
        `;

        const result = await pool.query(query, [commentId, req.user.userId, reply_body]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likePost = async (req, res) => {
    const { postId } = req.params;

    try {
        const checkQuery = `
            SELECT post_like_id
            FROM postlikes
            WHERE post_id = $1 AND user_id = $2
        `;

        const existing = await pool.query(checkQuery, [postId, req.user.userId]);

        if (existing.rowCount > 0) {
            return res.status(409).json({ error: 'Post already liked by this user' });
        }

        const insertQuery = `
            INSERT INTO postlikes (post_id, user_id)
            VALUES ($1, $2)
            RETURNING post_like_id, post_id, user_id, liked_post_at
        `;

        const result = await pool.query(insertQuery, [postId, req.user.userId]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const unlikePost = async (req, res) => {
    const { postId } = req.params;

    try {
        const query = `
            DELETE FROM postlikes
            WHERE post_id = $1 AND user_id = $2
        `;

        const result = await pool.query(query, [postId, req.user.userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }

        res.status(200).json({ message: 'Post like removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likeComment = async (req, res) => {
    const { commentId } = req.params;

    try {
        const checkQuery = `
            SELECT comment_like_id
            FROM commentlikes
            WHERE comment_id = $1 AND user_id = $2
        `;

        const existing = await pool.query(checkQuery, [commentId, req.user.userId]);

        if (existing.rowCount > 0) {
            return res.status(409).json({ error: 'Comment already liked by this user' });
        }

        const insertQuery = `
            INSERT INTO commentlikes (comment_id, user_id)
            VALUES ($1, $2)
            RETURNING comment_like_id, comment_id, user_id, liked_comment_at
        `;

        const result = await pool.query(insertQuery, [commentId, req.user.userId]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const unlikeComment = async (req, res) => {
    const { commentId } = req.params;

    try {
        const query = `
            DELETE FROM commentlikes
            WHERE comment_id = $1 AND user_id = $2
        `;

        const result = await pool.query(query, [commentId, req.user.userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }

        res.status(200).json({ message: 'Comment like removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likeReply = async (req, res) => {
    const { replyId } = req.params;

    try {
        const checkQuery = `
            SELECT reply_like_id
            FROM replylikes
            WHERE reply_id = $1 AND user_id = $2
        `;

        const existing = await pool.query(checkQuery, [replyId, req.user.userId]);

        if (existing.rowCount > 0) {
            return res.status(409).json({ error: 'Reply already liked by this user' });
        }

        const insertQuery = `
            INSERT INTO replylikes (reply_id, user_id)
            VALUES ($1, $2)
            RETURNING reply_like_id, reply_id, user_id, liked_reply_at
        `;

        const result = await pool.query(insertQuery, [replyId, req.user.userId]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const unlikeReply = async (req, res) => {
    const { replyId } = req.params;

    try {
        const query = `
            DELETE FROM replylikes
            WHERE reply_id = $1 AND user_id = $2
        `;

        const result = await pool.query(query, [replyId, req.user.userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }

        res.status(200).json({ message: 'Reply like removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
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
};
