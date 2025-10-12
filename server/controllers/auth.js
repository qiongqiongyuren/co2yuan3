const Account = require('../models/Account');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body; // <--- 改为 email

  // Validate input
  if (!email || !password) { // <--- 改为 email
    return res.status(400).json({ success: false, error: '请输入邮箱和密码' });
  }

  try {
    // 特殊处理 root 用户
    if (email === 'root@root.com' && password === 'root1234') {
      console.log('Attempting root user login...');
      let rootUser = await Account.findOne({ email: 'root@root.com' }).select('+password'); // Select password for matching
      
      if (!rootUser) {
        console.log('Root user not found, creating new root user...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('root1234', salt);

        rootUser = await Account.create({
          email: 'root@root.com',
          password: hashedPassword,
          unitName: 'Root',
          region: 'Root',
          role: 'admin',
          account: '00000000'
        });
        console.log('New root user created:', rootUser.email);
      } else {
        console.log('Root user found, attempting password match...');
      }

      const isRootPasswordMatch = await rootUser.matchPassword(password);
      if (!isRootPasswordMatch) {
        console.log('Root password mismatch.');
        return res.status(401).json({ success: false, error: '密码错误' });
      }
      console.log('Root user authenticated successfully.');
      return sendTokenResponse(rootUser, 200, res);
    }

    // Check for user by email
    const user = await Account.findOne({ email }).select('+password'); // <--- 改为 email

    if (!user) {
      return res.status(401).json({ success: false, error: '该邮箱未注册' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: '密码错误' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login Error:', error); // Add detailed logging
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { email, password, unitName, region, role } = req.body;

  try {
    // 检查邮箱是否已被注册
    const existingEmail = await Account.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, error: '该邮箱已被注册' });
    }

    // 安全检查：防止用户自己注册为管理员
    const allowedRoles = ['editor', 'viewer'];
    if (role && !allowedRoles.includes(role)) {
        return res.status(400).json({ message: '喵？不可以选择这个角色哦！' });
    }

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
      account,
      role // 如果前端没传 role，模型中的 default 值会生效
    });

    // 为了安全，注册成功后不直接返回token，引导用户去登录
    res.status(201).json({ success: true, message: '欢迎加入！你已经成功注册啦，喵~' });
  } catch (error) {
    // 更友好的错误提示
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: '该邮箱或账户已存在' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const secret = process.env.JWT_SECRET || 'dev_fallback_secret_change_me';
  const token = jwt.sign({ id: user._id }, secret, {
    expiresIn: '1d'
  });

    res
    .status(statusCode)
    .json({
      success: true,
      token,
      user: { // For frontend to easily access user info
        id: user._id,
        email: user.email,
        role: user.role,
        region: user.region // Add region to the user object
      }
    });
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Root only)
exports.getAllUsers = async (req, res, next) => {
  try {
    if (req.user.email !== 'root@root.com') {
      return res.status(403).json({ success: false, error: 'Not authorized to access this route' });
    }
    const users = await Account.find({ email: { $ne: 'root@root.com' } }); // Exclude root user
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private (Root only)
exports.updateUserRole = async (req, res, next) => {
  try {
    if (req.user.email !== 'root@root.com') {
      return res.status(403).json({ success: false, error: 'Not authorized to access this route' });
    }
    const { role } = req.body;
    const user = await Account.findByIdAndUpdate(req.params.id, { role }, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Root only)
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.email !== 'root@root.com') {
      return res.status(403).json({ success: false, error: 'Not authorized to access this route' });
    }
    await Account.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
