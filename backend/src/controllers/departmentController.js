const pool = require('../config/database');

const getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT d.*, COUNT(u.id) as member_count FROM departments d
             LEFT JOIN users u ON u.department_id = d.id
             GROUP BY d.id ORDER BY d.name`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMembers = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, name, email, role FROM users WHERE department_id=$1 ORDER BY role, name`,
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    const { name } = req.body;
    try {
        const { rows } = await pool.query(
            `INSERT INTO departments (name) VALUES ($1) RETURNING *`, [name]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, getMembers, create };
