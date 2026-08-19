const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');
const exportRoutes = require('./routes/export');
const requireAuth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

app.use('/api/expenses', requireAuth, expenseRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/reports', requireAuth, reportRoutes);
app.use('/api/export', requireAuth, exportRoutes);

// Serve the built frontend (frontend/npm run build) so opening this server's
// own address in a browser is a complete, zero-config app — no separate dev
// server or backend-address setup needed.
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ message: 'Not found' });
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;
