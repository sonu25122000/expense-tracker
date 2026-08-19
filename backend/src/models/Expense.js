const mongoose = require('mongoose');

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    paymentMethod: { type: String, required: true, enum: PAYMENT_METHODS },
    description: { type: String, trim: true, default: '' },
    receiptUrl: { type: String, default: null },
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ paymentMethod: 1 });
expenseSchema.index({ description: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
