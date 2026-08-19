const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const seedDefaultCategoriesForUser = require('../utils/seedCategories');

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '90d' });
}

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim() || !password || password.length < 4) {
      return res.status(400).json({
        message: 'Username is required and password must be at least 4 characters.',
      });
    }
    const trimmedUsername = username.trim();
    const existing = await User.findOne({ username: trimmedUsername });
    if (existing) {
      return res.status(409).json({ message: 'That username is already taken.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: trimmedUsername, passwordHash });
    await seedDefaultCategoriesForUser(user._id);
    const token = issueToken(user);
    res.status(201).json({ token, username: user.username });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const token = issueToken(user);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ username: user.username });
};
