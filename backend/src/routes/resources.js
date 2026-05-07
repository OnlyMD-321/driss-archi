const router = require('express').Router();
const c = require('../controllers/resourceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getOne);
router.post('/', authenticate, authorize('responsable'), c.create);
router.put('/:id', authenticate, authorize('responsable'), c.update);
router.delete('/:id', authenticate, authorize('responsable'), c.remove);
router.post('/:id/assign', authenticate, authorize('responsable'), c.assign);

module.exports = router;
