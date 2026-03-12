import express from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// @route GET /api/products
// Supports: ?q=search&brand=Apple&partType=display&rare=true&minPrice=0&maxPrice=5000&inStock=true&page=1&limit=12&sort=popular
router.get('/', asyncHandler(async (req, res) => {
    const {
        q, brand, category, rare, inStock,
        minPrice, maxPrice, page = 1, limit = 20, sort = 'popular',
    } = req.query;

    const filter = { isActive: true };

    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { model: { $regex: q, $options: 'i' } },
            { brandName: { $regex: q, $options: 'i' } },
            { categoryName: { $regex: q, $options: 'i' } },
            { compatibleModels: { $elemMatch: { $regex: q, $options: 'i' } } },
        ];
    }

    if (brand) filter.brandName = brand;
    if (category) filter.categoryName = category;
    if (rare === 'true') filter.isRare = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortObj = {};
    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else sortObj = { isTrending: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit));

    res.json({
        success: true,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        products,
    });
}));

// @route GET /api/products/trending
router.get('/trending', asyncHandler(async (req, res) => {
    const products = await Product.find({ isTrending: true, isActive: true })
        .limit(8);
    res.json({ success: true, products });
}));

// @route GET /api/products/rare
router.get('/rare', asyncHandler(async (req, res) => {
    const products = await Product.find({ isRare: true, isActive: true })
        .limit(8);
    res.json({ success: true, products });
}));

// @route GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ success: true, product });
}));

// @route POST /api/products — Admin
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
}));

// @route POST /api/products/validate-cart — Validate cart stock
router.post('/validate-cart', asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!items || !items.length) {
        return res.json({ success: true, valid: true });
    }

    const invalidItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
            invalidItems.push({
                product: item.product,
                name: item.name || (product ? product.name : 'Unknown Product'),
                requested: item.quantity,
                available: product ? product.stock : 0
            });
        }
    }

    if (invalidItems.length > 0) {
        return res.json({ success: true, valid: false, invalidItems });
    }

    res.json({ success: true, valid: true });
}));

// @route PUT /api/products/:id — Admin
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true,
    });
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ success: true, product });
}));

// @route DELETE /api/products/:id — Admin (soft delete)
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: 'Product removed' });
}));

export default router;
