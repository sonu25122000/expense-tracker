const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/exportController');

router.get('/pdf', ctrl.exportPdf);
router.get('/excel', ctrl.exportExcel);

module.exports = router;
