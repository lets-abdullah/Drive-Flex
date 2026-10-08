const express = require('express');
const router = express.Router();
const UserModel = require('../models/user.model');
const { hashPassword, verifyPassword } = require('../utils/auth-crypto');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'renter',
      phone = '',
      city = '',
      businessName = '',
      cnic = '',
      ownerType = 'Individual',
      description = '',
      profileImage = '',
    } = req.body;

    const normalizedRole = role === 'host' ? 'host' : 'renter';
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await UserModel.findOne({
      email: normalizedEmail,
      role: normalizedRole,
    }).lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'USER_EXISTS',
        message: `An account with this email already exists as a ${
          normalizedRole === 'host' ? 'Host/Lister' : 'Renter'
        }. Please sign in instead.`,
      });
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr-${normalizedRole}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUser = new UserModel({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hash,
      salt,
      role: normalizedRole,
      phone,
      city,
      businessName: businessName || name,
      cnic,
      ownerType,
      description,
      profileImage,
    });

    await newUser.save();

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      city: newUser.city,
      businessName: newUser.businessName,
      ownerId: normalizedRole === 'host' ? newUser.id : undefined,
    };

    return res.json({
      success: true,
      message: `Account created successfully as ${normalizedRole === 'host' ? 'Host' : 'Renter'}`,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, expectedRole = 'renter' } = req.body;
    const normalizedRole = expectedRole === 'host' ? 'host' : 'renter';
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await UserModel.findOne({
      email: normalizedEmail,
      role: normalizedRole,
    }).lean();

    if (!user) {
      const otherRole = normalizedRole === 'host' ? 'renter' : 'host';
      const userOtherRole = await UserModel.findOne({
        email: normalizedEmail,
        role: otherRole,
      }).lean();

      if (userOtherRole) {
        return res.status(403).json({
          success: false,
          code: 'ROLE_MISMATCH',
          message: `Cross-Role Login Blocked: This email is registered as a ${
            otherRole === 'host' ? 'Host/Lister' : 'Renter'
          }. You cannot sign in to the ${
            normalizedRole === 'host' ? 'Host' : 'Renter'
          } portal with this account. Please use the ${
            otherRole === 'host' ? 'Host portal' : 'Renter portal'
          }.`,
        });
      }

      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      businessName: user.businessName,
      ownerId: user.role === 'host' ? user.id : undefined,
    };

    return res.json({
      success: true,
      message: `Signed in as ${user.role === 'host' ? 'Host' : 'Renter'}`,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
