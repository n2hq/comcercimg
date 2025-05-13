import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
//import { pool } from './db.js';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';


const app = express();
//const port = 3555;
const port = process.env.PORT || 3555;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, envFile) });

const DATABASE_HOST = process.env.DATABASE_HOST
const DATABASE_PORT = process.env.DATABASE_PORT
const DATABASE_NAME = process.env.DATABASE_NAME
const DATABASE_PASS = process.env.DATABASE_PASS
const DATABASE_USER = process.env.DATABASE_USER

export const pool = mysql.createPool({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASS,
    port: Number(DATABASE_PORT) || 3306,
    database: DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

console.log('PORT:', process.env.DATABASE_PORT);
console.log('DATABASE_USER:', process.env.DATABASE_USER);



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
        const uuidname = crypto.randomUUID()
        //const uniqueName = `${Date.now()}-${file.originalname}`;
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}_${uuidname}${ext}`;
        cb(null, uniqueName);
    },
});

const businessProfilePics = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'business_profile_pics/');
    },
    filename: (req, file, cb) => {
        const uuidname = crypto.randomUUID()
        //const uniqueName = `${Date.now()}-${file.originalname}`;
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}_${uuidname}${ext}`;
        cb(null, uniqueName);
    },
});

const businessGalleryPics = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'business_gallery_pics/');
    },
    filename: (req, file, cb) => {
        const uuidname = crypto.randomUUID()
        //const uniqueName = `${Date.now()}-${file.originalname}`;
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}_${uuidname}${ext}`;
        cb(null, uniqueName);
    },
});

const userProfilePicUpload = multer({ storage: userProfilePics });
const businessProfilePicUpload = multer({ storage: businessProfilePics });
const businessGalleryPicUpload = multer({ storage: businessGalleryPics });


app.use('/user_profile_pics', express.static(path.join(__dirname, 'user_profile_pics')));
app.use('/business_profile_pics', express.static(path.join(__dirname, 'business_profile_pics')));
app.use('/business_gallery_pics', express.static(path.join(__dirname, 'business_gallery_pics')));
app.use(express.json());


// Upload route with DB save
app.post('/user_profile_pic_upload', userProfilePicUpload.single('file'), async (req, res) => {

    const guid = req.body.guid;
    const file = req.file;

    if (!file) {
        return res.status(405).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${process.env.SITE_BASE_URL}/user_profile_pics/${req.file.filename}`;
    const originalName = req.file.filename;
    const mimeType = req.file.mimetype;
    const userGuid = guid
    const imageGuid = crypto.randomUUID()

    try {

        const [exists] = await pool.query(`SELECT * from tbl_user_profile_image
            WHERE
            user_guid = ?`, [userGuid])


        if ((exists).length <= 0) {
            {/** do an insert */ }
            const [result] = await pool.query(
                `INSERT INTO tbl_user_profile_image
            (image_filename, user_guid, image_guid,
            image_url, mimetype)
            VALUES
            (?, ?, ?, ?, ?)`,
                [
                    originalName,
                    userGuid,
                    imageGuid,
                    fileUrl,
                    mimeType
                ]
            )

            res.status(200).json({
                message: 'File uploaded and saved to database successfully',
                fileUrl,
                insertId: (result).insertId
            });
        } else {
            {/**unlink the existing file first */ }
            const existingImageUrl = `user_profile_pics/${exists[0].image_filename}`
            if (existingImageUrl) {
                const existingPath = path.join(__dirname, existingImageUrl)
                try {
                    await fs.unlink(existingPath);
                    console.log(`Deleted old file: ${existingPath}`);
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.log('Error deleting old file:', err)
                    }
                }
            }

            {/** do an update */ }
            const [update] = await pool.query(`UPDATE tbl_user_profile_image 
                SET
                image_filename = ?,
                image_guid = ?,
                image_url = ?,
                mimetype = ?
                WHERE
                user_guid = ?`,
                [
                    originalName,
                    imageGuid,
                    fileUrl,
                    mimeType,
                    userGuid
                ])

            res.status(200).json({
                message: 'File uploaded and saved to database successfully',
                fileUrl,
                insertId: (exists[0]).id
            });
        }




    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database save failed' });
    }
});

app.post('/business_profile_pic_upload', businessProfilePicUpload.single('file'), async (req, res) => {
    const guid = req.body.guid;
    const file = req.file;
    const bid = req.body.bid

    if (!file) {
        return res.status(405).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${process.env.SITE_BASE_URL}/business_profile_pics/${req.file.filename}`;
    const originalName = req.file.filename;
    const mimeType = req.file.mimetype;
    const userGuid = guid
    const imageGuid = crypto.randomUUID()
    const businessGuid = bid

    try {

        const [exists] = await pool.query(`SELECT * from tbl_business_profile_image
            WHERE
            user_guid = ?
            AND
            business_guid = ?`, [userGuid, businessGuid])


        if ((exists).length <= 0) {
            {/** do an insert */ }
            const [result] = await pool.query(
                `INSERT INTO tbl_business_profile_image
            (image_filename, user_guid, image_guid,
            business_guid, image_url, mimetype)
            VALUES
            (?, ?, ?, ?, ?, ?)`,
                [
                    originalName,
                    userGuid,
                    imageGuid,
                    businessGuid,
                    fileUrl,
                    mimeType
                ]
            )

            res.status(200).json({
                message: 'File uploaded and saved to database successfully',
                fileUrl,
                insertId: (result).insertId
            });
        } else {
            {/**unlink the existing file first */ }
            const existingImageUrl = `business_profile_pics/${exists[0].image_filename}`
            if (existingImageUrl) {
                const existingPath = path.join(__dirname, existingImageUrl)
                try {
                    fs
                    await fs.unlink(existingPath);
                    console.log(`Deleted old file: ${existingPath}`);
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.log('Error deleting old file:', err)
                    }
                }
            }

            {/** do an update */ }
            const [update] = await pool.query(`UPDATE tbl_business_profile_image 
                SET
                image_filename = ?,
                image_guid = ?,
                image_url = ?,
                mimetype = ?
                WHERE
                user_guid = ?
                AND
                business_guid = ?`,
                [
                    originalName,
                    imageGuid,
                    fileUrl,
                    mimeType,
                    userGuid,
                    businessGuid
                ])

            res.status(200).json({
                message: 'File uploaded and saved to database successfully',
                fileUrl,
                insertId: (exists[0]).id
            });
        }




    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/business_gallery_pic_upload', businessGalleryPicUpload.single('file'), async (req, res) => {
    const guid = req.body.guid;
    const file = req.file;
    const bid = req.body.bid;



    if (!file) {
        return res.status(405).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${process.env.SITE_BASE_URL}/business_gallery_pics/${req.file.filename}`;
    const originalName = req.file.filename;
    const mimeType = req.file.mimetype;
    const userGuid = guid
    const imageGuid = crypto.randomUUID()
    const businessGuid = bid
    const imageTitle = req.body.image_title

    try {
        const [result] = await pool.query(
            `INSERT INTO tbl_business_gallery_image
            (image_filename, user_guid, image_guid,
            image_url, mimetype, business_guid, image_title)
            VALUES
            (?, ?, ?, ?, ?, ?, ?)`,
            [
                originalName,
                userGuid,
                imageGuid,
                fileUrl,
                mimeType,
                businessGuid,
                imageTitle
            ]
        )

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


app.post('/business_gallery_pic_update', businessGalleryPicUpload.single('file'), async (req, res) => {
    const guid = req.body.guid;
    const file = req.file;
    const bid = req.body.bid;
    let imageGuid = req.body.image_guid

    const userGuid = guid
    const businessGuid = bid
    let fileUrl = null
    let originalName = null
    let mimeType = null
    let imageTitle = null

    console.log(userGuid)
    console.log(businessGuid)
    console.log(imageGuid)

    let sql = `SELECT * FROM tbl_business_gallery_image
        WHERE
        user_guid = '${userGuid}'
        AND
        business_guid = '${businessGuid}'
        AND
        image_guid = '${imageGuid}'`


    const [existingImageRecord] = await pool.query(sql)

    //console.log(existingImageRecord)

    if ((existingImageRecord).length <= 0) {
        return DoResponse({ error: "Image does not exist" }, 200)
    }
    console.log(existingImageRecord[0].image_filename)
    if (!file) {
        {/** save only image title  */ }
        fileUrl = existingImageRecord[0].image_url
        originalName = existingImageRecord[0].image_filename
        mimeType = existingImageRecord[0].mimetype
        imageTitle = req.body.image_title || "" //|| existingImageRecord[0].image_title
    } else {
        {/** save new image with title */ }
        fileUrl = `${process.env.SITE_BASE_URL}/business_gallery_pics/${req.file.filename}`;
        originalName = req.file.filename
        mimeType = req.file.mimetype;
        imageTitle = req.body.image_title

        {/** delete prior file */ }
        const existingImageUrl = `business_gallery_pics/${existingImageRecord[0].image_filename}`
        if (existingImageUrl) {
            const existingPath = path.join(__dirname, existingImageUrl)
            try {
                await fs.unlink(existingPath);
                console.log(`Deleted old file: ${existingPath}`);
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.log('Error deleting old file:', err)
                }
            }
        }
    }


    try {
        const [result] = await pool.query(
            `UPDATE tbl_business_gallery_image
            SET
            image_filename = ?,
            image_url = ?,
            mimetype = ?,
            image_title = ?
            WHERE
            user_guid = ?
            AND
            business_guid = ?
            AND
            image_guid = ?`,
            [
                originalName,
                fileUrl,
                mimeType,
                imageTitle,
                userGuid,
                businessGuid,
                imageGuid
            ]
        )

        res.status(200).json({
            message: 'File uploaded and saved to database successfully',
            fileUrl,
            insertId: existingImageRecord[0].id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database save failed' });
    }
});


app.post('/delete_business_gallery_pic', async (req, res) => {
    const contentType = req.get("Content-Type")
    if (contentType !== "application/json") {
        return res.status(500).json({ message: `Invalid content type. Expected JSON.` });
    }

    const body = req.body
    const userGuid = body.guid
    const businessGuid = body.bid
    const imageGuid = body.image_guid

    let sql = `SELECT * FROM tbl_business_gallery_image
        WHERE
        user_guid = '${userGuid}'
        AND
        business_guid = '${businessGuid}'
        AND
        image_guid = '${imageGuid}'`

    console.log(sql)


    const [existingImageRecord] = await pool.query(sql)


    if ((existingImageRecord).length <= 0) {
        res.status(200).json({ message: `Image does not exist` });
    }

    console.log(existingImageRecord)

    {/** delete prior file */ }
    const existingImageUrl = `business_gallery_pics/${existingImageRecord[0].image_filename}`
    if (existingImageUrl) {
        const existingPath = path.join(__dirname, existingImageUrl)
        try {
            await fs.unlink(existingPath);
            console.log(`Deleted old file: ${existingPath}`);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.log('Error deleting old file:', err)
                res.status(500).json({ message: `Error deleting old file: ${err}` });
            }
        }
    }


    try {
        const [result] = await pool.query(
            `DELETE FROM tbl_business_gallery_image
            WHERE
            user_guid = ?
            AND
            business_guid = ?
            AND
            image_guid = ?`,
            [
                userGuid,
                businessGuid,
                imageGuid
            ]
        )


        res.status(200).json({
            message: 'File deleted successfully',
            insertId: existingImageRecord[0].id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database save failed' });
    }

});



// Home route
app.get("/", (req, res) => {
    const currentEnv = process.env.NODE_ENV || 'development';
    const db = process.env.DATABASE_NAME
    res.send(`Image APIv1!`);
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port} on ${process.env.NODE_ENV}`);
});
