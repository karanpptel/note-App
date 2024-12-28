import express from "express"
import multer from "multer"
import { addNote, listNote, removeNote, updateNote } from "../controllers/noteController.js";
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const noteRouter = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Cloudinary upload stream
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'notes-app',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// Middleware to handle file upload to Cloudinary
const handleFileUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const result = await uploadToCloudinary(req.file.buffer);
        req.fileUrl = result.secure_url;
        next();
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image'
        });
    }
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size is too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Error uploading file'
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

noteRouter.post("/add", upload.single("image"), handleMulterError, handleFileUpload, addNote);
noteRouter.get("/list", listNote);
noteRouter.post("/remove", removeNote);
noteRouter.post("/update", upload.single("image"), handleMulterError, handleFileUpload, updateNote);

export default noteRouter;
