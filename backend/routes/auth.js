const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys");
const USER = mongoose.model("USER");

// Default Route
router.get("/", (req, res) => {
    res.send("Hello, welcome to the authentication service!");
});

// Signup Route
router.post("/signup", async (req, res) => {
    const { name, userName, email, password } = req.body;

    // Validate Input
    if (!name || !email || !userName || !password) {
        return res.status(422).json({ error: "Please fill in all the fields." });
    }

    try {
        // Check if user already exists
        const existingUser = await USER.findOne({
            $or: [{ email }, { userName }],
        });
        if (existingUser) {
            return res
                .status(422)
                .json({ error: "User already exists with that email or username." });
        }   

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = new USER({
            name,
            email,
            userName,
            password: hashedPassword,
        });

        await user.save();
        res.json({ message: "Registered successfully" });
    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Signin Route
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    console.log(email)

    // Validate Input
    if (!email || !password) {
        return res.status(422).json({ error: "Please provide email and password." });
    }

    try {
        e = req.body.email;
        const user = await USER.findOne({ email: e });
        if (!user) {
            return res.status(422).json({ error: "Invalid email or password." });
        }

        // Compare password
        console.log(user);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(422).json({ error: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign({ _id: user._id }, Jwt_secret, { expiresIn: "7d" });

        // Send user details (excluding sensitive data)
        const { _id, name, email, userName } = user;
        res.json({ token, user: { _id, name, email, userName } });
    } catch (err) {
        console.error("Signin Error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
