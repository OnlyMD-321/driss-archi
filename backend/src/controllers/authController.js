const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await pool.query(
            `SELECT u.*, s.id as supplier_id, s.company_name
             FROM users u LEFT JOIN suppliers s ON s.user_id = u.id
             WHERE u.email = $1`, [email]
        );
        if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role, department_id: user.department_id, supplier_id: user.supplier_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department_id: user.department_id, supplier_id: user.supplier_id, company_name: user.company_name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const registerSupplier = async (req, res) => {
    const { name, email, password, company_name, location, address, website, manager_name } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const userRes = await client.query(
                `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'fournisseur') RETURNING id`,
                [name, email, hash]
            );
            const userId = userRes.rows[0].id;
            await client.query(
                `INSERT INTO suppliers (user_id, company_name, location, address, website, manager_name)
                 VALUES ($1,$2,$3,$4,$5,$6)`,
                [userId, company_name, location, address, website, manager_name]
            );
            await client.query('COMMIT');
            res.status(201).json({ message: 'Supplier registered successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT u.id, u.name, u.email, u.role, u.department_id, d.name as department_name
             FROM users u LEFT JOIN departments d ON d.id = u.department_id
             WHERE u.id = $1`, [req.user.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { login, registerSupplier, getProfile };
