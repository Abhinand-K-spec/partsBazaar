import express from 'express';
import asyncHandler from 'express-async-handler';
import Brand from '../models/Brand.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// @route GET /api/brands
router.get('/', asyncHandler(async (req, res) => {
    const brands = await Brand.find({ isActive: true }).sort({ count: -1 });
    res.json({ success: true, brands });
}));

// @route POST /api/brands — Admin
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, brand });
}));

// @route PUT /api/brands/:id — Admin
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) { res.status(404); throw new Error('Brand not found'); }
    res.json({ success: true, brand });
}));

// @route DELETE /api/brands/:id — Admin
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) { res.status(404); throw new Error('Brand not found'); }
    brand.isActive = false;
    await brand.save();
    res.json({ success: true, message: 'Brand removed' });
}));

export default router;
