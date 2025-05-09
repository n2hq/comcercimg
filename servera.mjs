import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { pool } from './db.js';

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));

// Storage config
const userProfilePics = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'user_profile_pics/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const businessProfilePics = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'business_profile_pics/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const businessGalleryPics = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'business_gallery_pics/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const userProfilePicUpload = multer({ storage: userProfilePics });
const businessProfilePicUpload = multer({ storage: businessProfilePics });
const businessGalleryPicUpload = multer({ storage: businessGalleryPics });

// Upload route with DB save
app.post('/user_profile_pic_upload', userProfilePicUpload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `https://upload.yoursite.com/uploads/${req.file.filename}`;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    try {
        const [result] = await pool.query(
            `INSERT INTO uploads (filename, url, mimetype, created_at)
       VALUES (?, ?, ?, NOW())`,
            [originalName, fileUrl, mimeType]
        );

        res.status(200).json({
            message: 'File uploaded and saved to database successfully',
            fileUrl,
            insertId: (result).insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database save failed' });
    }
});

app.post('/business_profile_pic_upload', businessProfilePicUpload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `https://upload.yoursite.com/uploads/${req.file.filename}`;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    try {
        const [result] = await pool.query(
            `INSERT INTO uploads (filename, url, mimetype, created_at)
       VALUES (?, ?, ?, NOW())`,
            [originalName, fileUrl, mimeType]
        );

        res.status(200).json({
            message: 'File uploaded and saved to database successfully',
            fileUrl,
            insertId: (result).insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database save failed' });
    }
});

app.post('/business_gallery_pic_upload', businessGalleryPicUpload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `https://upload.yoursite.com/uploads/${req.file.filename}`;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    try {
        const [result] = await pool.query(
            `INSERT INTO uploads (filename, url, mimetype, created_at)
       VALUES (?, ?, ?, NOW())`,
            [originalName, fileUrl, mimeType]
        );

        res.status(200).json({
            message: 'File uploaded and saved to database successfully',
            fileUrl,
            insertId: (result).insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database save failed' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Upload server running on port ${PORT}`);
});
