const router = require('express').Router();
const c = require('../controllers/breakdownController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getOne);
router.post('/', authenticate, authorize('enseignant', 'chef_departement'), c.report);
router.post('/:id/maintenance-report', authenticate, authorize('technicien'), c.submitReport);
router.patch('/:id/return-to-supplier', authenticate, authorize('responsable'), c.returnToSupplier);
router.patch('/:id/resolve', authenticate, authorize('responsable', 'technicien'), c.resolve);

module.exports = router;
