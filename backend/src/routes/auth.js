const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

router.get('/status', ctrl.getStatus);
router.post('/setup', ctrl.setup);
router.post('/login', ctrl.login);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
