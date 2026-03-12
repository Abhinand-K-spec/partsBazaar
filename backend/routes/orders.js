import express from 'express';
import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

const razorpay = new Razorpay({
    key_id: 'rzp_test_SQBYHPfcX7L5jl',
    key_secret: '6Rf0On0p0JtL97lD2jX4H3Q3',
});

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
        date: i <= currentIndex ? new Date() : null,
    }));
};

// @route POST /api/orders — Create order
router.post('/', protect, asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    console.log('Payment method:', paymentMethod);
    console.log('Items:', items);
    console.log('Shipping address:', shippingAddress);

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
        await Product.updateOne(
            { _id: product._id },
            { $inc: { stock: -item.quantity } }
        );
    }

    const shippingPrice = itemsPrice > 2000 ? 0 : 99;
    const gstPrice = Math.round(itemsPrice * 0.18);
    const totalPrice = itemsPrice + shippingPrice + gstPrice;

    // For Razorpay
    let razorpayOrderId = null;
    if (paymentMethod === 'razorpay') {
        console.log('Razorpay keys:', process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
        if (process.env.RAZORPAY_KEY_ID === 'dummy_key_id' || !process.env.RAZORPAY_KEY_ID) {
            res.status(500);
            throw new Error('Razorpay keys are not configured in backend .env');
        }
        let razorpayOrder;
        try {
            console.log("Creating Razorpay order for amount:", Math.round(totalPrice * 100));
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalPrice * 100),
                currency: 'INR',
                receipt: `rcpt_${Date.now()}`,
            });
        } catch (rzpErr) {
            console.error("Razorpay Error:", rzpErr);
            res.status(400);
            throw new Error(`Razorpay failed to create order: ${rzpErr.error?.description || rzpErr.message}`);
        }
        razorpayOrderId = razorpayOrder.id;
    }

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
        razorpayOrderId,
        isPaid: paymentMethod === 'cod', // COD is technically not paid until it's delivered, but old code had it as true? Wait, old code said isPaid is false if cod. We'll set it to false.
    });

    if (paymentMethod === 'cod') {
        // Assume COD isn't paid until delivery, or if they want it true we can do that. Setting to false.
        order.isPaid = false;
        await order.save();
    }

    if (paymentMethod === 'razorpay') {
        res.status(201).json({
            success: true,
            orderId: order._id,
            razorpayOrderId,
            amount: Math.round(totalPrice * 100),
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } else {
        res.status(201).json({ success: true, orderId: order._id });
    }
}));

// @route POST 
// /verify — Verify Razorpay Payment
router.post('/verify', protect, asyncHandler(async (req, res) => {
    console.log('Verifying Razorpay payment...');
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpaySignature) {
        res.status(400);
        throw new Error('Payment verification failed — invalid signature');
    }

    const order = await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paidAt: new Date(),
        razorpayPaymentId,
        razorpaySignature,
    }, { new: true });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.json({ success: true, order });
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
