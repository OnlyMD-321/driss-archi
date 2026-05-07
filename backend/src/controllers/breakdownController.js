const pool = require('../config/database');

const getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT b.*, r.inventory_number, r.resource_type, r.brand,
                    u.name as reported_by_name,
                    mr.id as report_id, mr.can_repair, mr.order_type, mr.frequency
             FROM breakdowns b
             JOIN resources r ON r.id = b.resource_id
             JOIN users u ON u.id = b.reported_by
             LEFT JOIN maintenance_reports mr ON mr.breakdown_id = b.id
             ORDER BY b.reported_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT b.*, r.inventory_number, r.resource_type, r.brand, r.warranty_end,
                    u.name as reported_by_name
             FROM breakdowns b
             JOIN resources r ON r.id = b.resource_id
             JOIN users u ON u.id = b.reported_by
             WHERE b.id=$1`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Breakdown not found' });

        const reports = await pool.query(
            `SELECT mr.*, u.name as technician_name FROM maintenance_reports mr
             JOIN users u ON u.id = mr.technician_id
             WHERE mr.breakdown_id=$1`, [req.params.id]
        );
        res.json({ ...rows[0], reports: reports.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const report = async (req, res) => {
    const { resource_id, description } = req.body;
    try {
        const { rows } = await pool.query(
            `INSERT INTO breakdowns (resource_id, reported_by, description)
             VALUES ($1,$2,$3) RETURNING *`,
            [resource_id, req.user.id, description]
        );
        await pool.query(`UPDATE resources SET status='maintenance' WHERE id=$1`, [resource_id]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const submitReport = async (req, res) => {
    const { breakdown_explanation, appearance_date, frequency, order_type, can_repair } = req.body;
    try {
        const { rows } = await pool.query(
            `INSERT INTO maintenance_reports (breakdown_id, technician_id, breakdown_explanation, appearance_date, frequency, order_type, can_repair)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [req.params.id, req.user.id, breakdown_explanation, appearance_date, frequency, order_type, can_repair]
        );
        await pool.query(
            `UPDATE breakdowns SET status='in_progress' WHERE id=$1`, [req.params.id]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const returnToSupplier = async (req, res) => {
    try {
        await pool.query(`UPDATE breakdowns SET status='returned_to_supplier' WHERE id=$1`, [req.params.id]);
        const breakdown = await pool.query(`SELECT resource_id FROM breakdowns WHERE id=$1`, [req.params.id]);
        await pool.query(`UPDATE resources SET status='returned' WHERE id=$1`, [breakdown.rows[0].resource_id]);
        res.json({ message: 'Resource returned to supplier' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const resolve = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `UPDATE breakdowns SET status='resolved' WHERE id=$1 RETURNING resource_id`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Breakdown not found' });
        await pool.query(`UPDATE resources SET status='available' WHERE id=$1`, [rows[0].resource_id]);
        res.json({ message: 'Breakdown resolved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, getOne, report, submitReport, returnToSupplier, resolve };
