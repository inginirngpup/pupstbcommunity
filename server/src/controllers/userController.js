const bcrypt = require('bcrypt');
const pool = require('../db');

const getUser = async (req, res) => {
    const userId = req.params?.id || req.user?.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const query = `
            SELECT user_id, username, student_number, is_account_verified, is_sys_admin, joined_at, created_at
            FROM users
            WHERE user_id = $1
        `;

        const result = await pool.query(query, [userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const updateUserProfile = async (req, res) => {
    const userId = req.user.userId;
    const { username, student_number } = req.body;

    if (!username && !student_number) {
        return res.status(400).json({
            error: 'Provide at least one field to update: username or student_number'
        });
    }

    try {
        const query = `
            UPDATE users
            SET username = COALESCE($1, username),
                student_number = COALESCE($2, student_number)
            WHERE user_id = $3
            RETURNING user_id, username, student_number, is_account_verified, is_sys_admin, joined_at, created_at
        `;

        const result = await pool.query(query, [username || null, student_number || null, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Student number already exists'
            });
        }

        res.status(500).json({
            error: error.message
        });
    }
};

const updateUserPassword = async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            error: 'currentPassword and newPassword are required'
        });
    }

    try {
        const userQuery = `
            SELECT password
            FROM users
            WHERE user_id = $1
        `;

        const userResult = await pool.query(userQuery, [userId]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateQuery = `
            UPDATE users
            SET password = $1
            WHERE user_id = $2
            RETURNING user_id, username, student_number
        `;

        const result = await pool.query(updateQuery, [hashedPassword, userId]);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const verifyUser = async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            UPDATE users
            SET is_account_verified = TRUE
            WHERE user_id = $1
            RETURNING user_id, username, student_number, is_account_verified
        `;

        const result = await pool.query(query, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    getUser,
    updateUserProfile,
    updateUserPassword,
    verifyUser
};