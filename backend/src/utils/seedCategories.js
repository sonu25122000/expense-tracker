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

async function seedDefaultCategoriesForUser(userId) {
  for (const name of DEFAULT_CATEGORIES) {
    await Category.updateOne(
      { owner: userId, name },
      { $setOnInsert: { owner: userId, name, isDefault: true } },
      { upsert: true }
    );
  }
}

module.exports = seedDefaultCategoriesForUser;
module.exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
