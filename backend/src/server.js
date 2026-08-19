require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedCategories = require('./utils/seedCategories');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seedCategories();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Expense Tracker API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
