const pool = require('../config/database');

const getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT t.*, u.name as created_by_name,
                    COUNT(DISTINCT o.id) as offer_count
             FROM tenders t
             LEFT JOIN users u ON u.id = t.created_by
             LEFT JOIN offers o ON o.tender_id = t.id
             GROUP BY t.id, u.name
             ORDER BY t.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT t.*, u.name as created_by_name FROM tenders t
             LEFT JOIN users u ON u.id = t.created_by
             WHERE t.id = $1`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Tender not found' });

        const needs = await pool.query(
            `SELECT tn.*, d.name as department_name FROM tender_needs tn
             LEFT JOIN departments d ON d.id = tn.department_id
             WHERE tn.tender_id = $1`, [req.params.id]
        );
        res.json({ ...rows[0], needs: needs.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    const { title, description, start_date, end_date, needs } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const tRes = await client.query(
            `INSERT INTO tenders (title, description, start_date, end_date, status, created_by)
             VALUES ($1,$2,$3,$4,'open',$5) RETURNING *`,
            [title, description, start_date, end_date, req.user.id]
        );
        const tender = tRes.rows[0];
        if (needs && needs.length) {
            for (const need of needs) {
                await client.query(
                    `INSERT INTO tender_needs (tender_id, department_id, resource_type, quantity, specs)
                     VALUES ($1,$2,$3,$4,$5)`,
                    [tender.id, need.department_id, need.resource_type, need.quantity, JSON.stringify(need.specs || {})]
                );
            }
        }
        await client.query('COMMIT');
        res.status(201).json(tender);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const update = async (req, res) => {
    const { title, description, start_date, end_date, status } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE tenders SET title=$1, description=$2, start_date=$3, end_date=$4, status=$5
             WHERE id=$6 RETURNING *`,
            [title, description, start_date, end_date, status, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Tender not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const close = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `UPDATE tenders SET status='closed' WHERE id=$1 RETURNING *`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Tender not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, getOne, create, update, close };
