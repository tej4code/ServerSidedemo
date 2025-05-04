const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const sendVerificationEmail = require('../config/transopoter');

// Helper
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  
  if (!["admin", "customer"].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const exit = await User.findOne({ where: { email } });
    if (exit) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      verificationCode,
      isVerified: false,
    });

    await sendVerificationEmail(email, verificationCode);
    res.status(201).json({ message: 'User registered, verification email sent' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.verifyUser = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.otp = "";
    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not allowed to login from here' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your account first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });

  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};


exports.customerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("here")
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'customer') {
      return res.status(403).json({ message: 'You are not allowed to login from here' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your account first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });

  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};
