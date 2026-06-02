// testUser.js
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./connectDB"); // your DB connection module
const User = require("./models/user.js"); // path to your User schema

const test = async () => {
  try {
    await connectDB();

    // Create a sample user
    const sampleUser = new User({
      name: "Test User",
      email: "testuser@example.com",
      passwordHash: "password123", // in real app, you'd hash this
    });

    const savedUser = await sampleUser.save();
    console.log(" User saved:", savedUser);

    // Fetch user from DB
    const fetchedUser = await User.findOne({ email: "testuser@example.com" });
    console.log(" User fetched:", fetchedUser);

    // Clean up (delete the sample user)
    await User.deleteOne({ email: "testuser@example.com" });
    console.log(" Sample user removed");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error during test:", err);
    process.exit(1);
  }
};

test();
