// One-off migration: the Category/Expense schemas gained a required `owner`
// field when the app moved from a single shared account to multi-user
// accounts. This removes now-orphaned pre-migration documents (which have no
// owner and are invisible to every owner-scoped query anyway) and reseeds
// default categories for each existing user.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Expense = require('../src/models/Expense');
const seedDefaultCategoriesForUser = require('../src/utils/seedCategories');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const orphanCategories = await Category.deleteMany({ owner: { $exists: false } });
  console.log(`Removed ${orphanCategories.deletedCount} pre-migration category document(s).`);

  const orphanExpenses = await Expense.deleteMany({ owner: { $exists: false } });
  console.log(`Removed ${orphanExpenses.deletedCount} pre-migration expense document(s) (should be 0).`);

  const users = await User.find();
  for (const user of users) {
    await seedDefaultCategoriesForUser(user._id);
    console.log(`Seeded default categories for user "${user.username}".`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
