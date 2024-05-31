const express = require('express');
const router = express.Router();
const Student = require('../model/User');
const { body, validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

router.post('/createstudent', [
    body('name').isLength({ min: 3, max: 25 }).withMessage('Name must be between 3 and 25 characters'),
    body('card').isLength({ min: 4, max: 10 }).withMessage('Card Id should be at least 4 characters')
], async (req, res) => {
    const { card, name, session, fname, address, city, state, course, image } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const existStudent = await Student.findOne({ card });
        if (existStudent) {
            return res.status(400).json({ message: 'Student with this id already exists' });
        }

        // Assuming `image` is a base64-encoded string in req.body
        const cloudinaryResponse = await cloudinary.uploader.upload(image, {
            folder: 'ITC_Students', // Specify your folder name here
            // upload_preset: 'your_upload_preset_name' // Optional: If you use unsigned upload preset
        });
  
        const userData = await Student.create({
            card, name, session, fname, address, city, state, course,
            image: cloudinaryResponse.secure_url // Save the secure URL returned by Cloudinary
        });

        res.status(200).json({ message: 'Create Successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid Details' });
    }
});

module.exports = router;
