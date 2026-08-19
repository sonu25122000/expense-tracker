const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Expense = require('../models/Expense');
const buildExpenseFilter = require('../utils/buildExpenseFilter');

function formatDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function rangeLabel(query) {
  if (query.startDate && query.endDate) return `${query.startDate} to ${query.endDate}`;
  if (query.startDate) return `From ${query.startDate}`;
  if (query.endDate) return `Until ${query.endDate}`;
  return 'All time';
}

exports.exportPdf = async (req, res) => {
  try {
    const filter = buildExpenseFilter(req.query);
    const expenses = await Expense.find(filter).sort({ date: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.pdf"');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(18).text('Expense Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text(`Period: ${rangeLabel(req.query)}`, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);
    doc.fillColor('#000');

    doc.fontSize(12).text(`Total transactions: ${expenses.length}`);
    doc.text(`Total expense: ${total.toFixed(2)}`);
    doc.moveDown(1);

    const colX = { date: 40, category: 110, amount: 210, method: 280, desc: 370 };
    const rowTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', colX.date, rowTop);
    doc.text('Category', colX.category, rowTop);
    doc.text('Amount', colX.amount, rowTop);
    doc.text('Method', colX.method, rowTop);
    doc.text('Description', colX.desc, rowTop);
    doc.moveDown(0.5);
    doc.font('Helvetica');
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(0.3);

    for (const e of expenses) {
      if (doc.y > 760) {
        doc.addPage();
      }
      const y = doc.y;
      doc.fontSize(9);
      doc.text(formatDate(e.date), colX.date, y, { width: 65 });
      doc.text(e.category, colX.category, y, { width: 95 });
      doc.text(e.amount.toFixed(2), colX.amount, y, { width: 65 });
      doc.text(e.paymentMethod, colX.method, y, { width: 85 });
      doc.text(e.description || '-', colX.desc, y, { width: 145 });
      doc.moveDown(0.6);
    }

    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text(`Grand Total: ${total.toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const filter = buildExpenseFilter(req.query);
    const expenses = await Expense.find(filter).sort({ date: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Expense Tracker';
    const sheet = workbook.addWorksheet('Expenses');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Payment Method', key: 'paymentMethod', width: 18 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Receipt URL', key: 'receiptUrl', width: 40 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const e of expenses) {
      sheet.addRow({
        date: formatDate(e.date),
        category: e.category,
        amount: e.amount,
        paymentMethod: e.paymentMethod,
        description: e.description || '',
        receiptUrl: e.receiptUrl || '',
      });
    }

    sheet.addRow({});
    const totalRow = sheet.addRow({ category: 'TOTAL', amount: total });
    totalRow.font = { bold: true };

    sheet.addRow({});
    sheet.addRow({ date: 'Period:', category: rangeLabel(req.query) });
    sheet.addRow({ date: 'Transactions:', category: String(expenses.length) });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
