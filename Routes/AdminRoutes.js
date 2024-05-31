const express = require('express')
const router = express.Router()
const Admin = require('../model/Admin')
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;  
const bcrypt = require('bcryptjs');
const {Authenticate} = require("../middleware/Auth")
console.log(JWT_SECRET)
router.get("/me",Authenticate,async(req,res)=>{
    try {
        const user = await Admin.findById(req.user.id)
       
        res.status(200).json({success:true,user})
    } catch (error) {
        res.status(400).json({message:"Token Not Provided"})
    }
})

router.post("/signup", async (req, res) => {
    try {
       
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        // Check if the user already exists
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user instance
        const newUser = new Admin({
            username,
            email,
            password, // Password will be hashed by the pre-save hook in the schema
        });

        // Save the user to the database
        await newUser.save();

        // Generate a JWT token
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

        // Set the token as a cookie in the response
        res.cookie('token', token, { httpOnly: true, secure: true });

        // Send a success response
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        console.log("internal server error ")
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find the user by email
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password not match' });
        }

        // Generate a JWT token
        const token = await jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        
        const options = {
            maxAge: 7 * 24 * 60 * 60 * 1000, // Set to environment variable's value
            httpOnly: true,
            sameSite: 'None', // Adjust as needed based on your application's requirements
            secure: true, // Ensure this is set to true if served over HTTPS
        };

        // Set the token as a cookie in the response
        res.status(200)
            .cookie("token", token, options)
            .json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: 'Logged out successfully' });
});



module.exports = router;

