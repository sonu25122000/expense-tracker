const { startOfDay, endOfDay } = require('./dateRanges');

// Builds a Mongoose filter object from shared query params used by
// GET /api/expenses, GET /api/export/pdf and GET /api/export/excel.
function buildExpenseFilter(query) {
  const filter = {};
  const { startDate, endDate, category, paymentMethod, minAmount, maxAmount, search } = query;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = startOfDay(new Date(startDate));
    if (endDate) filter.date.$lte = endOfDay(new Date(endDate));
  }

  if (category) filter.category = category;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }

  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
}

module.exports = buildExpenseFilter;
