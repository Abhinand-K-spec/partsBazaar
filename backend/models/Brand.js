import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    image: { type: String, default: '' },  // URL from Cloudinary or local /uploads/
    count: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
