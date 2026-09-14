const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const registerUser = async (req, res) => {
    const { username, student_number, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (username, student_number, password)
            VALUES ($1, $2, $3)
            RETURNING user_id, username, student_number
        `;

        const values = [username, student_number, hashedPassword];

        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);

    } catch (error) {

        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Student number already exists'
            });
        }

        res.status(500).json({
            error: 'Internal server error'
        });
    }
};


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = `
            SELECT user_id, username, student_number, password
            FROM users
            WHERE username = $1
        `;
        const result = await pool.query(query, [username]);

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                error: 'Invalid username or password'
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};



module.exports = {
    registerUser,
    loginUser
};
