const Expense = require('../models/Expense');
const {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} = require('../utils/dateRanges');

function getRange(period, dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  switch (period) {
    case 'daily':
      return { start: startOfDay(date), end: endOfDay(date) };
    case 'weekly':
      return { start: startOfWeek(date), end: endOfWeek(date) };
    case 'yearly':
      return { start: startOfYear(date), end: endOfYear(date) };
    case 'monthly':
    default:
      return { start: startOfMonth(date), end: endOfMonth(date) };
  }
}

exports.getReport = async (req, res) => {
  try {
    const period = ['daily', 'weekly', 'monthly', 'yearly'].includes(req.query.period)
      ? req.query.period
      : 'monthly';
    const { start, end } = getRange(period, req.query.date);

    const match = { date: { $gte: start, $lte: end } };

    const [totalsResult, categoryBreakdown, paymentMethodBreakdown] = await Promise.all([
      Expense.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $project: { _id: 0, category: '$_id', total: 1, count: 1 } },
      ]),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $project: { _id: 0, paymentMethod: '$_id', total: 1, count: 1 } },
      ]),
    ]);

    const total = totalsResult.length ? totalsResult[0].total : 0;
    const count = totalsResult.length ? totalsResult[0].count : 0;

    const bucketFormat = period === 'yearly' ? '%Y-%m' : '%Y-%m-%d';
    const bucketBreakdownRaw = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: bucketFormat, date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, bucket: '$_id', total: 1, count: 1 } },
    ]);

    let highestSpendingBucket = null;
    for (const b of bucketBreakdownRaw) {
      if (!highestSpendingBucket || b.total > highestSpendingBucket.total) {
        highestSpendingBucket = b;
      }
    }

    const bucketCount = period === 'yearly' ? 12 : Math.max(1, Math.round((end - start) / 86400000) + 1);
    const averagePerBucket = total / bucketCount;

    res.json({
      period,
      startDate: start,
      endDate: end,
      total,
      transactionCount: count,
      categoryBreakdown,
      paymentMethodBreakdown,
      breakdown: bucketBreakdownRaw,
      highestSpendingBucket,
      averagePerBucket,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
