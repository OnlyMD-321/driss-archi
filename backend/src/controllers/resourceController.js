const pool = require('../config/database');

const getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT r.*,
                    a.id as assignment_id, a.assigned_date,
                    d.name as department_name,
                    u.name as assigned_user_name
             FROM resources r
             LEFT JOIN assignments a ON a.resource_id = r.id AND a.is_active = TRUE
             LEFT JOIN departments d ON d.id = a.department_id
             LEFT JOIN users u ON u.id = a.assigned_user_id
             ORDER BY r.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT r.*, s.company_name as supplier_name FROM resources r
             LEFT JOIN suppliers s ON s.id = r.supplier_id
             WHERE r.id = $1`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Resource not found' });

        const assignments = await pool.query(
            `SELECT a.*, d.name as department_name, u.name as user_name
             FROM assignments a
             LEFT JOIN departments d ON d.id = a.department_id
             LEFT JOIN users u ON u.id = a.assigned_user_id
             WHERE a.resource_id = $1 ORDER BY a.assigned_date DESC`, [req.params.id]
        );
        const breakdowns = await pool.query(
            `SELECT b.*, u.name as reported_by_name FROM breakdowns b
             LEFT JOIN users u ON u.id = b.reported_by
             WHERE b.resource_id = $1 ORDER BY b.reported_at DESC`, [req.params.id]
        );
        res.json({ ...rows[0], assignments: assignments.rows, breakdowns: breakdowns.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    const { inventory_number, resource_type, brand, offer_id, supplier_id, warranty_end, specs } = req.body;
    try {
        const { rows } = await pool.query(
            `INSERT INTO resources (inventory_number, resource_type, brand, offer_id, supplier_id, warranty_end, specs)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [inventory_number, resource_type, brand, offer_id, supplier_id, warranty_end, JSON.stringify(specs || {})]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    const { inventory_number, brand, status, warranty_end, specs } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE resources SET inventory_number=$1, brand=$2, status=$3, warranty_end=$4, specs=$5
             WHERE id=$6 RETURNING *`,
            [inventory_number, brand, status, warranty_end, JSON.stringify(specs || {}), req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Resource not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { rowCount } = await pool.query(`DELETE FROM resources WHERE id=$1`, [req.params.id]);
        if (!rowCount) return res.status(404).json({ error: 'Resource not found' });
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const assign = async (req, res) => {
    const { department_id, assigned_user_id } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Deactivate previous assignment
        await client.query(
            `UPDATE assignments SET is_active=FALSE, returned_date=NOW() WHERE resource_id=$1 AND is_active=TRUE`,
            [req.params.id]
        );
        const { rows } = await client.query(
            `INSERT INTO assignments (resource_id, department_id, assigned_user_id)
             VALUES ($1,$2,$3) RETURNING *`,
            [req.params.id, department_id, assigned_user_id || null]
        );
        await client.query(
            `UPDATE resources SET status='assigned' WHERE id=$1`, [req.params.id]
        );
        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports = { getAll, getOne, create, update, remove, assign };
