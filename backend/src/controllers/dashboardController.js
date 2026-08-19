const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
} = require('../utils/dateRanges');

async function sumInRange(owner, start, end) {
  const result = await Expense.aggregate([
    { $match: { owner, date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result.length ? result[0].total : 0;
}

exports.getSummary = async (req, res) => {
  try {
    const owner = new mongoose.Types.ObjectId(req.userId);
    const now = new Date();

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [totalToday, totalThisWeek, totalThisMonth, totalTransactions, highest] = await Promise.all([
      sumInRange(owner, todayStart, todayEnd),
      sumInRange(owner, weekStart, weekEnd),
      sumInRange(owner, monthStart, monthEnd),
      Expense.countDocuments({ owner }),
      Expense.findOne({ owner }).sort({ amount: -1 }),
    ]);

    const daysElapsedThisMonth = Math.floor((todayStart - monthStart) / 86400000) + 1;
    const averageDailyExpense = totalThisMonth / daysElapsedThisMonth;

    const categoryBreakdown = await Expense.aggregate([
      { $match: { owner, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $project: { _id: 0, category: '$_id', total: 1, count: 1 } },
    ]);

    const paymentMethodBreakdown = await Expense.aggregate([
      { $match: { owner, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $project: { _id: 0, paymentMethod: '$_id', total: 1, count: 1 } },
    ]);

    const trendStart = startOfDay(addDays(now, -29));
    const dailyTrendRaw = await Expense.aggregate([
      { $match: { owner, date: { $gte: trendStart, $lte: todayEnd } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const trendMap = new Map(dailyTrendRaw.map((d) => [d._id, d.total]));
    const dailyTrend = [];
    for (let i = 0; i < 30; i++) {
      const d = addDays(trendStart, i);
      const key = d.toISOString().slice(0, 10);
      dailyTrend.push({ date: key, total: trendMap.get(key) || 0 });
    }

    res.json({
      totalToday,
      totalThisWeek,
      totalThisMonth,
      totalTransactions,
      highestExpense: highest,
      averageDailyExpense,
      categoryBreakdown,
      paymentMethodBreakdown,
      dailyTrend,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
