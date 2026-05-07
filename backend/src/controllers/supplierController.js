const pool = require('../config/database');

const getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT s.*, u.name, u.email FROM suppliers s
             JOIN users u ON u.id = s.user_id
             ORDER BY s.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT s.*, u.name, u.email FROM suppliers s
             JOIN users u ON u.id = s.user_id WHERE s.id=$1`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });

        const offers = await pool.query(
            `SELECT o.*, t.title as tender_title FROM offers o
             JOIN tenders t ON t.id = o.tender_id
             WHERE o.supplier_id=$1 ORDER BY o.submitted_at DESC`, [req.params.id]
        );
        res.json({ ...rows[0], offers: offers.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const blacklist = async (req, res) => {
    const { reason } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE suppliers SET is_blacklisted=TRUE, blacklist_reason=$1 WHERE id=$2 RETURNING *`,
            [reason, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const unblacklist = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `UPDATE suppliers SET is_blacklisted=FALSE, blacklist_reason=NULL WHERE id=$1 RETURNING *`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, getOne, blacklist, unblacklist };
