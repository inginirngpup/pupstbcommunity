const pool = require('../db');

const getUserGroups = async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT
                g.group_id,
                g.group_name,
                g.description,
                g.verification_status,
                g.created_at,
                gm.member_id,
                gm.role,
                gm.joined_at
            FROM groups g
            LEFT JOIN groupmembers gm
                ON gm.group_id = g.group_id
                AND gm.user_id = $1
            WHERE g.user_id = $1
               OR g.group_id IN (
                    SELECT group_id
                    FROM groupmembers
                    WHERE user_id = $1
               )
            ORDER BY g.created_at DESC
        `;

        const result = await pool.query(query, [req.user.userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGroupById = async (req, res) => {
    const { groupId } = req.params;

    try {
        const query = `
            SELECT group_id, user_id, group_name, description, reviewed_by, verification_status, created_at, reviewed_at
            FROM groups
            WHERE group_id = $1
        `;

        const result = await pool.query(query, [groupId]);
        const group = result.rows[0];

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createGroup = async (req, res) => {
    const { group_name, description } = req.body;

    if (!group_name) {
        return res.status(400).json({ error: 'group_name is required' });
    }

    try {
        const query = `
            INSERT INTO groups (user_id, group_name, description)
            VALUES ($1, $2, $3)
            RETURNING group_id, user_id, group_name, description, verification_status, created_at
        `;

        const result = await pool.query(query, [req.user.userId, group_name, description || '']);
        const group = result.rows[0];

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const joinGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.userId;

    try {
        const checkGroupQuery = `
            SELECT group_id
            FROM groups
            WHERE group_id = $1
        `;

        const groupResult = await pool.query(checkGroupQuery, [groupId]);

        if (groupResult.rowCount === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const existingQuery = `
            SELECT member_id
            FROM groupmembers
            WHERE user_id = $1 AND group_id = $2
        `;

        const existingResult = await pool.query(existingQuery, [userId, groupId]);

        if (existingResult.rowCount > 0) {
            return res.status(409).json({ error: 'User is already a member of this group' });
        }

        const query = `
            INSERT INTO groupmembers (user_id, group_id, role)
            VALUES ($1, $2, 'member')
            RETURNING member_id, user_id, group_id, role, joined_at
        `;

        const result = await pool.query(query, [userId, groupId]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const leaveGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.userId;

    try {
        const query = `
            DELETE FROM groupmembers
            WHERE user_id = $1 AND group_id = $2
        `;

        const result = await pool.query(query, [userId, groupId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Membership not found' });
        }

        res.status(200).json({ message: 'Left group successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGroupMembers = async (req, res) => {
    const { groupId } = req.params;

    try {
        const query = `
            SELECT
                u.user_id,
                u.username,
                u.student_number,
                gm.member_id,
                gm.role,
                gm.joined_at
            FROM groupmembers gm
            JOIN users u ON u.user_id = gm.user_id
            WHERE gm.group_id = $1
            ORDER BY gm.joined_at ASC
        `;

        const result = await pool.query(query, [groupId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserGroups,
    getGroupById,
    createGroup,
    joinGroup,
    leaveGroup,
    getGroupMembers
};
