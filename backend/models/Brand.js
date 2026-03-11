import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    logo: { type: String, default: '🔵' },
    color: { type: String, default: 'from-blue-600 to-blue-800' },
    count: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
