// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOTPEmail } = require('../config/emailService');
const { generateOTP, getOTPExpiryTime, isOTPValid, isOTPExpired } = require('../utils/otpHelper');

// ===== SIGNUP - Send OTP =====
router.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // const email = req.body.email.toLowerCase();

    // Check if user exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing && existing.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or username already in use' 
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = getOTPExpiryTime(10);

    // Create or update user
    let user = existing || new User({ name, username, email, password: hashed });
    
    user.password = hashed;
    user.otp = { code: otp, expiresAt: expiryTime };
    user.isEmailVerified = false;

    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification email. Please try again.' 
      });
    }

    return res.status(201).json({ 
      success: true, 
      message: 'User registered. Check your email for OTP.',
      userId: user._id
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== VERIFY OTP =====
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;

    const email = req.body.email.toLowerCase();
    console.log("DEBUG: email for OTP verification:", email);
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      console.log("DEBUG: No user found for email:", email);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    // Validate OTP
    if (!isOTPValid(user.otp.code, otp, user.otp.expiresAt)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '7d' }
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    });

  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== RESEND OTP =====
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    // Rate limiting: Allow resend only if OTP expired or after 1 hour
    if (user.otp?.expiresAt) {
      const timeSinceOTPCreated = (new Date() - new Date(user.otp.expiresAt)) / (1000 * 60);
      if (timeSinceOTPCreated < 50) {
        return res.status(429).json({ 
          success: false, 
          message: 'Please wait before requesting a new OTP' 
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiryTime = getOTPExpiryTime(10);

    user.otp = { code: otp, expiresAt: expiryTime };
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to resend OTP:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please try again.' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'OTP resent successfully' 
    });

  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== LOGIN - Check Email Verified =====
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validation
    if (!emailOrUsername || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email/Username and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ 
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }] 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // ===== NEW: Check if email is verified =====
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email first',
        userId: user._id
      });
    }
    // ===== END NEW =====

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '7d' }
    );

    return res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }, 
      token 
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== GET CURRENT USER =====
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
