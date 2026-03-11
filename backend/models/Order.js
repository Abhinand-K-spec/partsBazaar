import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
});

const timelineSchema = new mongoose.Schema({
    step: { type: String, required: true },
    label: { type: String, required: true },
    date: { type: Date },
    done: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'card', 'netbanking', 'cod'],
        required: true,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    gstPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['ordered', 'packed', 'shipped', 'delivered', 'cancelled'],
        default: 'ordered',
    },
    timeline: [timelineSchema],
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
