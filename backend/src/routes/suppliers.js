const router = require('express').Router();
const c = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getOne);
router.patch('/:id/blacklist', authenticate, authorize('responsable'), c.blacklist);
router.patch('/:id/unblacklist', authenticate, authorize('responsable'), c.unblacklist);

module.exports = router;
