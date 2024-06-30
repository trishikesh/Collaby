const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// POST route for user registration (signup)
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;

  console.log("Received signup data:", req.body); // Log received data

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Redirect to userpage.html after successful registration
    res.redirect('/userpage.html');
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST route for user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log("Received login data:", req.body); // Log received data

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Redirect to userpage.html after successful login
    res.redirect('/userpage.html');
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
