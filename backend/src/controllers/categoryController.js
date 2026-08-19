const Category = require('../models/Category');
const Expense = require('../models/Expense');

exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ isDefault: -1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Category already exists' });
    }
    const category = await Category.create({ name: name.trim(), isDefault: false });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    if (category.isDefault) {
      return res.status(400).json({ message: 'Default categories cannot be deleted' });
    }
    const inUse = await Expense.exists({ category: category.name });
    if (inUse) {
      return res.status(400).json({ message: 'Category is used by existing expenses and cannot be deleted' });
    }
    await category.deleteOne();
    res.json({ message: 'Category deleted', id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
