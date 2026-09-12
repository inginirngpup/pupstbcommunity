const pool = require('../db');

const getUser = async (req, res) => {
    try {
        const query = `
            SELECT user_id, username, student_number
            FROM users
            WHERE user_id = $1
        `;

        const result = await pool.query(query, [req.user.userId]);

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

module.exports = {
    getUser
};