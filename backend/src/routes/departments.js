const router = require('express').Router();
const c = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, c.getAll);
router.get('/:id/members', authenticate, c.getMembers);
router.post('/', authenticate, authorize('responsable'), c.create);

module.exports = router;
