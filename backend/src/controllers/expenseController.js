const fs = require('fs');
const path = require('path');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const buildExpenseFilter = require('../utils/buildExpenseFilter');

function receiptUrlFor(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

// Category is a free-text field on expenses; auto-register anything new so it
// shows up consistently in the Categories screen and filter suggestions.
async function ensureCategoryExists(ownerId, name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return;
  await Category.updateOne(
    { owner: ownerId, name: trimmed },
    { $setOnInsert: { owner: ownerId, name: trimmed, isDefault: false } },
    { upsert: true }
  );
}

exports.createExpense = async (req, res) => {
  try {
    const { date, amount, category, paymentMethod, description } = req.body;
    if (!date || !amount || !category || !paymentMethod) {
      return res.status(400).json({ message: 'date, amount, category and paymentMethod are required' });
    }

    const expense = await Expense.create({
      owner: req.userId,
      date: new Date(date),
      amount: Number(amount),
      category,
      paymentMethod,
      description: description || '',
      receiptUrl: req.file ? receiptUrlFor(req, req.file.filename) : null,
    });
    await ensureCategoryExists(req.userId, category);

    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listExpenses = async (req, res) => {
  try {
    const filter = { owner: req.userId, ...buildExpenseFilter(req.query) };
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ expenses, total, count: expenses.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, owner: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, owner: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const { date, amount, category, paymentMethod, description, removeReceipt } = req.body;
    if (date) expense.date = new Date(date);
    if (amount !== undefined) expense.amount = Number(amount);
    if (category) {
      expense.category = category;
      await ensureCategoryExists(req.userId, category);
    }
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (description !== undefined) expense.description = description;

    if (req.file) {
      deleteReceiptFile(expense.receiptUrl);
      expense.receiptUrl = receiptUrlFor(req, req.file.filename);
    } else if (removeReceipt === 'true' || removeReceipt === true) {
      deleteReceiptFile(expense.receiptUrl);
      expense.receiptUrl = null;
    }

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    deleteReceiptFile(expense.receiptUrl);
    res.json({ message: 'Expense deleted', id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

function deleteReceiptFile(receiptUrl) {
  if (!receiptUrl) return;
  const filename = receiptUrl.split('/uploads/')[1];
  if (!filename) return;
  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
  fs.unlink(filePath, () => {});
}
