const Account = require('../models/Account');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { account, password } = req.body;

  // Validate input
  if (!account || !password) {
    return res.status(400).json({ success: false, error: 'Please provide an account and password' });
  }

  try {
    // Check for user
    const user = await Account.findOne({ account }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { email, password, unitName, region } = req.body;

  try {
    // Generate a unique 8-digit account number
    let account;
    let isUnique = false;
    while (!isUnique) {
      account = Math.floor(10000000 + Math.random() * 90000000).toString();
      const existingUser = await Account.findOne({ account });
      if (!existingUser) {
        isUnique = true;
      }
    }

    const user = await Account.create({
      email,
      password,
      unitName,
      region,
      account
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  res
    .status(statusCode)
    .json({
      success: true,
      token
    });
};
