// server/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const sendMail = require("../config/mail");

const User = require("../models/user");
const Quest = require("../models/quest");
const authMiddleware = require("../middleware/authMiddleware");
const passport = require("passport");
require("../config/passport");
const SemdMail = require("../config/mail");
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = new User({
      name,
      email,
      passwordHash,
      verificationToken,
      verificationTokenExpires,
    });
    await user.save();

    // Send verification email with code (not a link)
    try {
      const html = `<p>Hi ${name},</p><p>Thanks for registering for SkillQuest!</p><p>Your verification code is:</p><p style="font-size:1.5em;font-weight:bold;color:#1DB954;letter-spacing:2px;">${verificationToken}</p><p>Enter this code on the website to verify your email. This code expires in 24 hours.</p>`;
      await sendMail(email, "SkillQuest - Your verification code", html);
    } catch (mailErr) {
      console.error(
        "Failed to send verification mail:",
        mailErr && mailErr.message ? mailErr.message : mailErr
      );
    }

    res.json({
      msg: "User registered successfully. Please check your email to verify your account.",
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Verify email token
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query || {};
    if (!token) return res.status(400).json({ msg: "Missing token" });

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send verification success email
    try {
      const html = `<p>Hi ${user.name || "there"},</p><p>Your email has been verified successfully. You can now log in to SkillQuest.</p>`;
      await sendMail(user.email, "SkillQuest - Email verified", html);
    } catch (mailErr) {
      console.error(
        "Failed to send verification success mail:",
        mailErr && mailErr.message ? mailErr.message : mailErr
      );
    }

    // Redirect back to frontend or respond with success
    const frontend = process.env.FRONTEND_URL || `http://localhost:5173`;
    return res.redirect(`${frontend}/login?verified=true`);
  } catch (err) {
    console.error(
      "verify-email error:",
      err && err.message ? err.message : err
    );
    return res.status(500).json({ msg: "Server error" });
  }
});

// Verify code endpoint (for CheckEmail page)
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code)
      return res.status(400).json({ msg: "Missing email or code" });

    const user = await User.findOne({
      email,
      verificationToken: code,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ msg: "Invalid or expired code" });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send verification success email
    try {
      const html = `<p>Hi ${user.name || "there"},</p><p>Your email has been verified successfully. You can now log in to SkillQuest.</p>`;
      await sendMail(user.email, "SkillQuest - Email verified", html);
    } catch (mailErr) {
      console.error(
        "Failed to send verification success mail:",
        mailErr && mailErr.message ? mailErr.message : mailErr
      );
    }

    return res.json({ msg: "Email verified successfully" });
  } catch (err) {
    console.error("verify-code error:", err && err.message ? err.message : err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid credentials(email)" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Block login if the user's email hasn't been verified yet
    if (!user.isVerified) {
      return res
        .status(403)
        .json({
          msg: "Email not verified. Please verify your email before logging in.",
        });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Forgot password: send reset link email (generic response for security)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(200).json({ msg: "If that email exists, a password reset link has been sent." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ msg: "If that email exists, a password reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordTokenExpires = Date.now() + 1000 * 60 * 30; // 30 mins
    await user.save();

    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontend}/reset-password?token=${rawToken}`;
    const html = `<p>Hi ${user.name || "there"},</p>
      <p>We received a request to reset your SkillQuest password.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 14px;background:#1DB954;color:#111;text-decoration:none;border-radius:8px;">Reset Password</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
      <p>This link expires in 30 minutes.</p>`;

    try {
      await sendMail(user.email, "SkillQuest - Reset your password", html);
    } catch (mailErr) {
      console.error("Failed to send forgot-password email:", mailErr?.message || mailErr);
    }

    return res.status(200).json({ msg: "If that email exists, a password reset link has been sent." });
  } catch (err) {
    console.error("forgot-password error:", err?.message || err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ msg: "Missing token or password" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordTokenHash = null;
    user.resetPasswordTokenExpires = null;
    await user.save();

    try {
      const html = `<p>Hi ${user.name || "there"},</p><p>Your SkillQuest password has been changed successfully.</p>`;
      await sendMail(user.email, "SkillQuest - Password changed", html);
    } catch (mailErr) {
      console.error("Failed to send password changed email:", mailErr?.message || mailErr);
    }

    return res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("reset-password error:", err?.message || err);
    return res.status(500).json({ msg: "Server error" });
  }
});

//get all user data
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!user.isVerified)
      return res
        .status(403)
        .json({ msg: "Email not verified. Please verify your email." });

    const totalQuests = await Quest.countDocuments();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        // XP and progress
        xp: user.points || 0,
        xpToNextLevel: user.xpToNextLevel || 500,
        currentXP: user.currentXP || 0,
        level: user.level || 1,
        questsCompleted: user.questsCompleted || 0,
        totalQuests,
        streak: user.streak || 0,
        badges: user.badges || [],
        picture: user.picture || null,
        // personalization arrays
        recentActivity: user.recentActivity || [],
        recommendedQuests: user.recommendedQuests || [],
        skills: user.skills ? Object.fromEntries(user.skills) : {},
        purchasedQuests: user.purchasedQuests || [],
        completedQuests: user.completedQuests || [],
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update profile picture for current user (supports data URL or http/https URL)
router.put("/profile-picture", authMiddleware, async (req, res) => {
  try {
    const incomingPicture = req.body ? req.body.picture : null;

    if (incomingPicture !== null && incomingPicture !== undefined && typeof incomingPicture !== "string") {
      return res.status(400).json({ msg: "Invalid picture format" });
    }

    const picture = typeof incomingPicture === "string" ? incomingPicture.trim() : "";
    const hasPicture = Boolean(picture);

    if (hasPicture) {
      const isDataUrl = picture.startsWith("data:image/");
      const isHttpUrl = /^https?:\/\//i.test(picture);
      if (!isDataUrl && !isHttpUrl) {
        return res.status(400).json({ msg: "Picture must be an image data URL or http/https URL" });
      }

      if (picture.length > 2_000_000) {
        return res.status(400).json({ msg: "Image is too large. Please use a smaller file." });
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.picture = hasPicture ? picture : null;
    await user.save();

    return res.json({
      msg: "Profile picture updated",
      picture: user.picture,
    });
  } catch (err) {
    console.error("profile-picture update error:", err && err.message ? err.message : err);
    return res.status(500).json({ msg: "Server error" });
  }
});

//google login
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google-login", async (req, res) => {
  console.log("Google login attempt");
  try {
    const { credential } = req.body || {};

    if (!credential) {
      console.warn("No credential provided in google-login request");
      return res.status(400).json({ msg: "No credential provided" });
    }

    console.log(
      "Received credential length:",
      typeof credential,
      credential ? credential.length : 0
    );

    // Verify token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyErr) {
      console.error(
        "Google ID token verification failed:",
        verifyErr && verifyErr.message ? verifyErr.message : verifyErr
      );
      return res
        .status(400)
        .json({
          msg: "Invalid Google ID token",
          error: verifyErr && verifyErr.message,
        });
    }

    const payload = ticket && ticket.getPayload ? ticket.getPayload() : null;
    if (!payload) {
      console.error("No payload returned from verifyIdToken");
      return res.status(400).json({ msg: "Invalid token payload" });
    }

    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ msg: "Email not verified by Google" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new Google user
      console.log("Creating new user from Google login for", email);
      try {
        user = await User.create({
          name,
          email,
          googleId,
          picture,
          passwordHash: "",
          isVerified: true,
        });

        // Send verification success email
        try {
          const html = `<p>Hi ${name || "there"},</p><p>Your email has been verified successfully via Google. You can now log in to SkillQuest.</p>`;
          await sendMail(email, "SkillQuest - Email verified", html);
        } catch (mailErr) {
          console.error(
            "Failed to send verification success mail:",
            mailErr && mailErr.message ? mailErr.message : mailErr
          );
        }
      } catch (createErr) {
        console.error(
          "Error creating user from Google payload:",
          createErr && createErr.message ? createErr.message : createErr
        );
        return res
          .status(500)
          .json({
            msg: "Failed to create user",
            error: createErr && createErr.message,
          });
      }
    }

    // Issue JWT
    let token;
    try {
      token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    } catch (signErr) {
      console.error(
        "JWT sign error:",
        signErr && signErr.message ? signErr.message : signErr
      );
      return res
        .status(500)
        .json({
          msg: "Failed to create token",
          error: signErr && signErr.message,
        });
    }

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google login error:", err && err.stack ? err.stack : err);
    res
      .status(500)
      .json({
        msg: "Server error",
        error: err && err.message ? err.message : String(err),
      });
  }
});

module.exports = router;
