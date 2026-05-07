const router = require('express').Router();
const c = require('../controllers/offerController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/tender/:tenderId', authenticate, c.getByTender);
router.post('/tender/:tenderId', authenticate, authorize('fournisseur'), c.submit);
router.patch('/:id/accept', authenticate, authorize('responsable'), c.accept);
router.patch('/:id/reject', authenticate, authorize('responsable'), c.reject);

module.exports = router;
