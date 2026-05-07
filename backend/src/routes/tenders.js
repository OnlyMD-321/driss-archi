const router = require('express').Router();
const c = require('../controllers/tenderController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getOne);
router.post('/', authenticate, authorize('responsable', 'chef_departement'), c.create);
router.put('/:id', authenticate, authorize('responsable'), c.update);
router.patch('/:id/close', authenticate, authorize('responsable'), c.close);

module.exports = router;
