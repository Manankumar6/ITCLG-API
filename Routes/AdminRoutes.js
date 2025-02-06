const express = require('express');
const router = express.Router();
const Admin = require('../model/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Authenticate, checkInitialAdmin } = require('../middleware/Auth');

const JWT_SECRET = process.env.JWT_SECRET;

// Get current user profile
router.get('/me', Authenticate, async (req, res) => {
  
  try {
    const user = await Admin.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User signup
router.post('/signup', async (req, res) => {
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

    const options = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      httpOnly: true,
      sameSite: 'None', // Adjust as needed based on your application's requirements
      secure: process.env.NODE_ENV === 'production', // Ensure this is set to true if served over HTTPS
    };

    // Send a success response
    res.status(201)
      .cookie('token', token, options)
      .json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in /signup route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    const options = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // Set to environment variable's value
      httpOnly: true,
      sameSite: 'None', // Adjust as needed based on your application's requirements
      secure: true, // Ensure this is set to true if served over HTTPS
    };

    // Set the token as a cookie in the response
    res.status(200)
      .cookie('token', token, options)
      .json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error in /login route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'None', 
    expires: new Date(0) // Expire immediately
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// Initial admin setup
router.post('/initial-admin', Authenticate,checkInitialAdmin, async (req, res) => {
  try {
    const { user } = req; // Assuming `req.user` contains the authenticated user data
  
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    user.role = 'admin';
    await user.save();

    res.status(200).json({ message: 'User promoted to admin successfully', user });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
