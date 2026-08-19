const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Rent',
  'Groceries',
  'Other',
];

async function seedCategories() {
  for (const name of DEFAULT_CATEGORIES) {
    await Category.updateOne(
      { name },
      { $setOnInsert: { name, isDefault: true } },
      { upsert: true }
    );
  }
}

module.exports = seedCategories;
module.exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
