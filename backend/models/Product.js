import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    brandName: { type: String, required: true },  // denormalized for fast queries
    model: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    categoryName: { type: String, required: true },  // denormalized for fast queries
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },
    isRare: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    image: { type: String, required: true },
    images: [{ type: String }],
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    warranty: { type: String, default: '3 months' },
    description: { type: String, default: '' },
    specifications: { type: Map, of: String },
    compatibleModels: [{ type: String }],
    shippingDays: { type: Number, default: 2 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Full text search index
productSchema.index({ name: 'text', model: 'text', brandName: 'text', categoryName: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
