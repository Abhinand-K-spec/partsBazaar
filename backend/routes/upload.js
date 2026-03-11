import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

let upload;

if (hasCloudinary) {
    // ---------- Cloudinary storage ----------
    const { v2: cloudinary } = await import('cloudinary');
    const { CloudinaryStorage } = await import('multer-storage-cloudinary');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'partsbazaar/products',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
        },
    });

    upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter(req, file, cb) {
            if (/image\/(jpeg|jpg|png|webp)/.test(file.mimetype)) cb(null, true);
            else cb(new Error('Only jpg, jpeg, png, and webp images are allowed'));
        },
    });

    console.log('📷  Upload: Cloudinary storage enabled'.green);
} else {
    // ---------- Local disk storage fallback ----------
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const storage = multer.diskStorage({
        destination(req, file, cb) { cb(null, uploadDir); },
        filename(req, file, cb) {
            cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
        },
    });

    upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter(req, file, cb) {
            const ok = /jpg|jpeg|png|webp/.test(path.extname(file.originalname).toLowerCase()) &&
                       /image/.test(file.mimetype);
            ok ? cb(null, true) : cb(new Error('Images only!'));
        },
    });

    console.log('📷  Upload: Local disk storage (set Cloudinary env vars to enable cloud uploads)'.yellow);
}

// @route POST /api/upload
router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No image file provided');
    }

    // Cloudinary returns the full URL in req.file.path
    // Local disk returns the relative path, prefix with /
    const imagePath = req.file.path.startsWith('http')
        ? req.file.path
        : `/${req.file.path}`.replace(/\\/g, '/');

    res.json({
        success: true,
        imagePath,
        publicId: req.file.filename || req.file.public_id || null,
    });
});

export default router;
