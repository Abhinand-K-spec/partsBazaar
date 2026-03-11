import express from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

const buildTimeline = (status) => {
    const steps = [
        { step: 'ordered', label: 'Order Placed' },
        { step: 'packed', label: 'Packed' },
        { step: 'shipped', label: 'Shipped' },
        { step: 'delivered', label: 'Delivered' },
    ];
    const statusOrder = ['ordered', 'packed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return steps.map((s, i) => ({
        ...s,
        done: i <= currentIndex,
        date: i <= currentIndex ? new Date().toLocaleDateString('en-IN') : null,
    }));
};

// @route POST /api/orders — Create order
router.post('/', protect, asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // Validate products and build order items
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.product}`);
        }
        if (product.stock < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product.name}`);
        }
        orderItems.push({
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: item.quantity,
        });
        itemsPrice += product.price * item.quantity;

        // Deduct stock
        product.stock -= item.quantity;
        await product.save();
    }

    const shippingPrice = itemsPrice > 2000 ? 0 : 99;
    const gstPrice = Math.round(itemsPrice * 0.18);
    const totalPrice = itemsPrice + shippingPrice + gstPrice;

    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        gstPrice,
        totalPrice,
        status: 'ordered',
        timeline: buildTimeline('ordered'),
        isPaid: paymentMethod !== 'cod',
        paidAt: paymentMethod !== 'cod' ? new Date() : null,
    });

    res.status(201).json({ success: true, order });
}));

// @route GET /api/orders/mine — My orders
router.get('/mine', protect, asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('items.product', 'name image brand');
    res.json({ success: true, orders });
}));

// @route GET /api/orders — Admin: all orders
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('user', 'name email');
    res.json({ success: true, total, orders });
}));

// @route GET /api/orders/stats — Admin: revenue stats for charts
router.get('/stats', protect, adminOnly, asyncHandler(async (req, res) => {
    const monthly = await Order.aggregate([
        {
            $group: {
                _id: { $month: '$createdAt' },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
            }
        },
        { $sort: { _id: 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = monthly.map(m => ({
        month: months[m._id - 1],
        revenue: m.revenue,
        orders: m.orders,
    }));

    const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    ]);

    res.json({
        success: true,
        salesData,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders: totalRevenue[0]?.count || 0,
    });
}));

// @route GET /api/orders/:id — Get single order
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('items.product', 'name image');

    if (!order) { res.status(404); throw new Error('Order not found'); }

    // Only owner or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.json({ success: true, order });
}));

// @route PUT /api/orders/:id/status — Admin: update status
router.put('/:id/status', protect, adminOnly, asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['ordered', 'packed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }

    order.status = status;
    order.timeline = buildTimeline(status);

    if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
    }

    await order.save();
    res.json({ success: true, order });
}));

export default router;
