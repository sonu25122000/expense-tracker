const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ctrl = require('../controllers/expenseController');

router.get('/', ctrl.listExpenses);
router.post('/', upload.single('receipt'), ctrl.createExpense);
router.get('/:id', ctrl.getExpense);
router.put('/:id', upload.single('receipt'), ctrl.updateExpense);
router.delete('/:id', ctrl.deleteExpense);

module.exports = router;
