import express from 'express';
import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// @route GET /api/categories
router.get('/', asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
}));

// @route POST /api/categories — Admin
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
}));

// @route PUT /api/categories/:id — Admin
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) { res.status(404); throw new Error('Category not found'); }
    res.json({ success: true, category });
}));

// @route DELETE /api/categories/:id — Admin
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) { res.status(404); throw new Error('Category not found'); }
    category.isActive = false;
    await category.save();
    res.json({ success: true, message: 'Category removed' });
}));

export default router;
