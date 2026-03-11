import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, phone, shopName, accountType } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email, and password');
    }

    const exists = await User.findOne({ email });
    if (exists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const user = await User.create({ name, email, password, phone, shopName, accountType });
    const token = user.getSignedJwtToken();

    res.status(201).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountType: user.accountType,
            phone: user.phone,
            shopName: user.shopName,
        },
    });
}));

// @route POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const token = user.getSignedJwtToken();

    res.json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountType: user.accountType,
            phone: user.phone,
            shopName: user.shopName,
        },
    });
}));

// @route GET /api/auth/me
router.get('/me', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
}));

// @route PUT /api/auth/profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.shopName = req.body.shopName || user.shopName;
    user.accountType = req.body.accountType || user.accountType;

    if (req.body.password) {
        user.password = req.body.password;
    }

    const updated = await user.save();
    res.json({
        success: true,
        user: {
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            phone: updated.phone,
            shopName: updated.shopName,
            accountType: updated.accountType,
        },
    });
}));

export default router;
