const Expense = require('../models/Expense');
const buildExpenseFilter = require('../utils/buildExpenseFilter');
const { uploadReceiptBuffer, deleteReceipt } = require('../utils/cloudinary');

exports.createExpense = async (req, res) => {
  try {
    const { date, amount, category, paymentMethod, description } = req.body;
    if (!date || !amount || !category || !paymentMethod) {
      return res.status(400).json({ message: 'date, amount, category and paymentMethod are required' });
    }

    let receiptUrl = null;
    let receiptPublicId = null;
    if (req.file) {
      const uploaded = await uploadReceiptBuffer(req.file.buffer);
      receiptUrl = uploaded.url;
      receiptPublicId = uploaded.publicId;
    }

    const expense = await Expense.create({
      owner: req.userId,
      date: new Date(date),
      amount: Number(amount),
      category,
      paymentMethod,
      description: description || '',
      receiptUrl,
      receiptPublicId,
    });

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
    }
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (description !== undefined) expense.description = description;

    if (req.file) {
      await deleteReceipt(expense.receiptPublicId);
      const uploaded = await uploadReceiptBuffer(req.file.buffer);
      expense.receiptUrl = uploaded.url;
      expense.receiptPublicId = uploaded.publicId;
    } else if (removeReceipt === 'true' || removeReceipt === true) {
      await deleteReceipt(expense.receiptPublicId);
      expense.receiptUrl = null;
      expense.receiptPublicId = null;
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
    await deleteReceipt(expense.receiptPublicId);
    res.json({ message: 'Expense deleted', id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
