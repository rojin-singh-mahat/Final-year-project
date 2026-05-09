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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const FORBIDDEN_EMAIL_TYPO_SUFFIXES = [".con", ".conm", ".cmo", ".cm", ".coom", ".comm"];
const STRONG_PASSWORD_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const ALLOWED_EMAIL_DOMAIN = "@gmail.com";
const STARTER_XP = 20;
const STARTER_BADGE = "Starter Badge";

const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();

const isValidEmail = (email = "") => {
  const normalized = normalizeEmail(email);
  if (!normalized || !EMAIL_REGEX.test(normalized)) return false;
  if (normalized.includes("..")) return false;
  if (!normalized.endsWith(ALLOWED_EMAIL_DOMAIN)) return false;
  return !FORBIDDEN_EMAIL_TYPO_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
};

const isStrongPassword = (password = "") => STRONG_PASSWORD_REGEX.test(String(password || ""));

const createVerificationToken = () => crypto.randomBytes(32).toString("hex");
const createVerificationTokenExpiry = () => Date.now() + 24 * 60 * 60 * 1000;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const brandedEmail = ({ title, intro, bodyHtml, footer = "Need help? Reply to this email and we will assist you." }) => `
  <div style="margin:0;padding:24px;background:#0b1118;font-family:Arial,Helvetica,sans-serif;color:#dbe7f3;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#121a24;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:22px 24px;background:linear-gradient(90deg,#0ea5b7,#f59e0b);color:#0b1118;font-weight:700;font-size:20px;letter-spacing:0.4px;">
          SkillQuest
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 10px;font-size:22px;color:#f8fafc;">${title}</h1>
          <p style="margin:0 0 18px;color:#b7c6d8;line-height:1.55;">${intro}</p>
          ${bodyHtml}
          <hr style="border:none;border-top:1px solid #2a394b;margin:22px 0;" />
          <p style="margin:0;font-size:12px;color:#8aa0b8;line-height:1.5;">${footer}</p>
        </td>
      </tr>
    </table>
  </div>
`;

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body?.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Please enter a valid @gmail.com email address." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ msg: "Password must be at least 8 characters and include at least 1 number and 1 symbol." });
    }

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = createVerificationToken();
    const verificationTokenExpires = createVerificationTokenExpiry();

    const user = new User({
      name,
      email,
      passwordHash,
      points: STARTER_XP,
      currentXP: STARTER_XP,
      badges: [STARTER_BADGE],
      verificationToken,
      verificationTokenExpires,
    });
    await user.save();

    // Send verification email with code (not a link)
    try {
      const html = brandedEmail({
        title: "Verify Your Email",
        intro: `Hi ${escapeHtml(name || "there")}, welcome to SkillQuest.`,
        bodyHtml: `
          <p style="margin:0 0 12px;color:#dbe7f3;">Use this verification code to activate your account:</p>
          <div style="display:inline-block;padding:10px 14px;background:#0f1720;border:1px solid #2f4258;border-radius:10px;color:#22d3ee;font-size:24px;font-weight:700;letter-spacing:2px;">${escapeHtml(verificationToken)}</div>
          <p style="margin:14px 0 8px;color:#b7c6d8;">This code expires in 24 hours.</p>
          <p style="margin:0;color:#fcd34d;">Starter unlocked on signup: +${STARTER_XP} XP and the ${STARTER_BADGE} badge.</p>
        `,
      });
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
      const html = brandedEmail({
        title: "Email Verified",
        intro: `Hi ${escapeHtml(user.name || "there")}, your account is now fully verified.`,
        bodyHtml: "<p style=\"margin:0;color:#dbe7f3;\">You can now log in, access your dashboard, and continue your quest.</p>",
      });
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
    const code = req.body?.code;
    const email = normalizeEmail(req.body?.email);
    if (!email || !code)
      return res.status(400).json({ msg: "Missing email or code" });
    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Please enter a valid @gmail.com email address." });
    }

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
      const html = brandedEmail({
        title: "Email Verified",
        intro: `Hi ${escapeHtml(user.name || "there")}, your account is now fully verified.`,
        bodyHtml: "<p style=\"margin:0;color:#dbe7f3;\">You can now log in, access your dashboard, and continue your quest.</p>",
      });
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
    const { password } = req.body;
    const email = normalizeEmail(req.body?.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Please enter a valid @gmail.com email address." });
    }

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
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(200).json({ msg: "If that email exists, a password reset link has been sent." });
    }
    if (!isValidEmail(email)) {
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
    const html = brandedEmail({
      title: "Reset Your Password",
      intro: `Hi ${escapeHtml(user.name || "there")}, we received a request to reset your password.`,
      bodyHtml: `
        <p style="margin:0 0 14px;color:#dbe7f3;">Use the secure button below to continue:</p>
        <p style="margin:0 0 14px;"><a href="${resetUrl}" style="display:inline-block;padding:11px 16px;background:#22d3ee;color:#0b1118;text-decoration:none;border-radius:9px;font-weight:700;">Reset Password</a></p>
        <p style="margin:0 0 8px;color:#b7c6d8;">If you did not request this, you can safely ignore this email.</p>
        <p style="margin:0;color:#fcd34d;">This link expires in 30 minutes.</p>
      `,
    });

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

    if (!isStrongPassword(password)) {
      return res.status(400).json({ msg: "Password must be at least 8 characters and include at least 1 number and 1 symbol." });
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
      const html = brandedEmail({
        title: "Password Updated",
        intro: `Hi ${escapeHtml(user.name || "there")}, your password was changed successfully.`,
        bodyHtml: "<p style=\"margin:0;color:#dbe7f3;\">If this was not you, contact support immediately and reset your password again.</p>",
      });
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
        address: user.address || "",
        phoneNumber: user.phoneNumber || "",
        showEmail: user.showEmail !== false,
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

// Update profile settings for current user
router.put("/profile-settings", authMiddleware, async (req, res) => {
  try {
    const address = String(req.body?.address || "").trim().slice(0, 180);
    const phoneNumber = String(req.body?.phoneNumber || "").trim().slice(0, 30);
    const showEmail = req.body?.showEmail;

    if (showEmail !== undefined && typeof showEmail !== "boolean") {
      return res.status(400).json({ msg: "showEmail must be true or false" });
    }

    if (phoneNumber && !/^[+\d\s()-]{6,30}$/.test(phoneNumber)) {
      return res.status(400).json({ msg: "Please enter a valid phone number." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.address = address;
    user.phoneNumber = phoneNumber;
    if (showEmail !== undefined) {
      user.showEmail = showEmail;
    }

    await user.save();

    return res.json({
      msg: "Profile settings updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address || "",
        phoneNumber: user.phoneNumber || "",
        showEmail: user.showEmail !== false,
        picture: user.picture || null,
      },
    });
  } catch (err) {
    console.error("profile-settings update error:", err?.message || err);
    return res.status(500).json({ msg: "Server error" });
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

    const { name, picture, sub: googleId, email_verified } = payload;
    const email = normalizeEmail(payload?.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Only @gmail.com email addresses are allowed." });
    }

    if (!email_verified) {
      return res.status(400).json({ msg: "Email not verified by Google" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new Google user
      console.log("Creating new user from Google login for", email);
      try {
        const verificationToken = createVerificationToken();
        const verificationTokenExpires = createVerificationTokenExpiry();

        user = await User.create({
          name,
          email,
          googleId,
          picture,
          passwordHash: "",
          isVerified: false,
          points: STARTER_XP,
          currentXP: STARTER_XP,
          badges: [STARTER_BADGE],
          verificationToken,
          verificationTokenExpires,
        });

        // Send verification code just like manual signup
        try {
          const html = brandedEmail({
            title: "Verify Your Google Signup",
            intro: `Hi ${escapeHtml(name || "there")}, welcome to SkillQuest.`,
            bodyHtml: `
              <p style="margin:0 0 12px;color:#dbe7f3;">Use this verification code to activate your account:</p>
              <div style="display:inline-block;padding:10px 14px;background:#0f1720;border:1px solid #2f4258;border-radius:10px;color:#22d3ee;font-size:24px;font-weight:700;letter-spacing:2px;">${escapeHtml(verificationToken)}</div>
              <p style="margin:14px 0 8px;color:#b7c6d8;">This code expires in 24 hours.</p>
              <p style="margin:0;color:#fcd34d;">Starter unlocked on signup: +${STARTER_XP} XP and the ${STARTER_BADGE} badge.</p>
            `,
          });
          await sendMail(email, "SkillQuest - Your verification code", html);
        } catch (mailErr) {
          console.error(
            "Failed to send Google verification code:",
            mailErr && mailErr.message ? mailErr.message : mailErr
          );
        }

        return res.status(202).json({
          requiresVerification: true,
          email,
          msg: "Google signup successful. Please verify your email with the code sent.",
        });
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

    if (!user.isVerified) {
      try {
        user.verificationToken = createVerificationToken();
        user.verificationTokenExpires = createVerificationTokenExpiry();
        await user.save();

        const html = brandedEmail({
          title: "Verify Your Email",
          intro: `Hi ${escapeHtml(user.name || "there")}, here is your verification code.`,
          bodyHtml: `
            <p style="margin:0 0 12px;color:#dbe7f3;">Use this verification code to activate your account:</p>
            <div style="display:inline-block;padding:10px 14px;background:#0f1720;border:1px solid #2f4258;border-radius:10px;color:#22d3ee;font-size:24px;font-weight:700;letter-spacing:2px;">${escapeHtml(user.verificationToken)}</div>
            <p style="margin:14px 0 8px;color:#b7c6d8;">This code expires in 24 hours.</p>
          `,
        });
        await sendMail(user.email, "SkillQuest - Verify your email", html);
      } catch (mailErr) {
        console.error("Failed to send verification code for unverified Google user:", mailErr?.message || mailErr);
      }

      return res.status(403).json({
        requiresVerification: true,
        email: user.email,
        msg: "Email not verified. Please verify your email to continue.",
      });
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
