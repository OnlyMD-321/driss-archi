const pool = require('../config/database');

const getByTender = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT o.*, s.company_name, s.is_blacklisted,
                    json_agg(json_build_object('resource_type', oi.resource_type, 'brand', oi.brand, 'unit_price', oi.unit_price, 'quantity', oi.quantity)) as items
             FROM offers o
             JOIN suppliers s ON s.id = o.supplier_id
             LEFT JOIN offer_items oi ON oi.offer_id = o.id
             WHERE o.tender_id = $1
             GROUP BY o.id, s.company_name, s.is_blacklisted
             ORDER BY o.total_price ASC`,
            [req.params.tenderId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const submit = async (req, res) => {
    const { delivery_date, warranty_months, total_price, items } = req.body;
    const supplierId = req.user.supplier_id;
    if (!supplierId) return res.status(403).json({ error: 'Not a supplier' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const blackCheck = await client.query(
            `SELECT is_blacklisted FROM suppliers WHERE id=$1`, [supplierId]
        );
        if (blackCheck.rows[0]?.is_blacklisted)
            return res.status(403).json({ error: 'Supplier is blacklisted' });

        const offerRes = await client.query(
            `INSERT INTO offers (tender_id, supplier_id, delivery_date, warranty_months, total_price)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [req.params.tenderId, supplierId, delivery_date, warranty_months, total_price]
        );
        const offer = offerRes.rows[0];

        for (const item of (items || [])) {
            await client.query(
                `INSERT INTO offer_items (offer_id, resource_type, brand, unit_price, quantity)
                 VALUES ($1,$2,$3,$4,$5)`,
                [offer.id, item.resource_type, item.brand, item.unit_price, item.quantity]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(offer);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const accept = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `UPDATE offers SET status='accepted' WHERE id=$1 RETURNING *`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Offer not found' });

        // Reject all other offers for same tender
        await client.query(
            `UPDATE offers SET status='rejected' WHERE tender_id=$1 AND id != $2`,
            [rows[0].tender_id, req.params.id]
        );
        // Mark tender as awarded
        await client.query(
            `UPDATE tenders SET status='awarded' WHERE id=$1`, [rows[0].tender_id]
        );

        await client.query('COMMIT');
        res.json(rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const reject = async (req, res) => {
    const { reason } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE offers SET status='rejected', rejection_reason=$1 WHERE id=$2 RETURNING *`,
            [reason, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Offer not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getByTender, submit, accept, reject };
