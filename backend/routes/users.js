import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// @route GET /api/users — Admin: all users
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const total = await User.countDocuments();
    const users = await User.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    // Attach order count
    const usersWithStats = await Promise.all(users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        const spentResult = await Order.aggregate([
            { $match: { user: u._id } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        return {
            ...u.toObject(),
            orderCount,
            totalSpent: spentResult[0]?.total || 0,
        };
    }));

    res.json({ success: true, total, users: usersWithStats });
}));

// @route GET /api/users/:id — Admin: single user
router.get('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json({ success: true, user });
}));

// @route PUT /api/users/:id — Admin: update user (role etc.)
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json({ success: true, user });
}));

// @route DELETE /api/users/:id — Admin: delete user
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin user'); }
    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
}));

export default router;
