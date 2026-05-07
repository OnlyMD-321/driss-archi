const router = require('express').Router();
const { login, registerSupplier, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.post('/register-supplier', registerSupplier);
router.get('/profile', authenticate, getProfile);

module.exports = router;
