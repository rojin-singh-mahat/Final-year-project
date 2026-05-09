const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const User = require("../models/user");
const Quest = require("../models/quest");
const authMiddleware = require("../middleware/authMiddleware");
const crypto = require("crypto");

// eSewa configuration
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_PAYMENT_URL = process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL || "http://localhost:5001/api/payment/esewa/success";
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL || "http://localhost:5001/api/payment/esewa/failure";

// Generate eSewa signature
function generateEsewaSignature(message, secretKey) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
}

// Initiate eSewa payment
router.post("/initiate", authMiddleware, async (req, res) => {
  try {
    const { questId } = req.body;
    const userId = req.user.id;

    // Get quest details
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    // Check if quest is free
    if (quest.price === 0) {
      // Free quest - just add to purchased quests
      const user = await User.findById(userId);
      if (!user.purchasedQuests.includes(questId)) {
        user.purchasedQuests.push(questId);
        await user.save();
      }
      return res.json({ 
        message: "Quest accessed successfully", 
        isFree: true,
        isPaid: false 
      });
    }

    // Check if already purchased
    const user = await User.findById(userId);
    if (user.purchasedQuests.includes(questId)) {
      return res.json({ 
        message: "Quest already purchased", 
        alreadyPurchased: true,
        isPaid: true 
      });
    }

    // Create pending payment record
    const transactionUuid = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = new Payment({
      userId,
      questId,
      amount: quest.price,
      currency: "NPR", // eSewa uses NPR
      status: "pending",
      transactionId: transactionUuid,
      transactionDate: new Date(),
    });

    await payment.save();

    // Prepare eSewa payment parameters
    const totalAmount = quest.price.toString();
    const productCode = "EPAYTEST"; // Use merchant code in production
    
    // Create message for signature: total_amount,transaction_uuid,product_code
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const signature = generateEsewaSignature(message, ESEWA_SECRET_KEY);

    // Return eSewa payment URL and parameters
    res.json({
      message: "Payment initiated",
      paymentUrl: ESEWA_PAYMENT_URL,
      paymentParams: {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: ESEWA_SUCCESS_URL,
        failure_url: ESEWA_FAILURE_URL,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature
      },
      transactionId: transactionUuid
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
});

// eSewa success callback
router.get("/esewa/success", async (req, res) => {
  try {
    const { data } = req.query;
    
    if (!data) {
      return res.redirect(`http://localhost:5173/dashboard?payment=failed&reason=no_data`);
    }

    // Decode base64 data from eSewa
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const { transaction_uuid, status, total_amount } = decodedData;

    // Find payment record
    const payment = await Payment.findOne({ transactionId: transaction_uuid });
    
    if (!payment) {
      return res.redirect(`http://localhost:5173/dashboard?payment=failed&reason=not_found`);
    }

    if (status === "COMPLETE") {
      // Update payment status
      payment.status = "completed";
      await payment.save();

      // Add quest to user's purchased quests
      const user = await User.findById(payment.userId);
      if (!user.purchasedQuests.includes(payment.questId)) {
        user.purchasedQuests.push(payment.questId);
        await user.save();
      }

      return res.redirect(`http://localhost:5173/dashboard?payment=success&transaction=${transaction_uuid}`);
    } else {
      payment.status = "failed";
      await payment.save();
      return res.redirect(`http://localhost:5173/dashboard?payment=failed&reason=incomplete`);
    }
  } catch (error) {
    console.error("eSewa success callback error:", error);
    res.redirect(`http://localhost:5173/dashboard?payment=failed&reason=error`);
  }
});

// eSewa failure callback
router.get("/esewa/failure", async (req, res) => {
  try {
    const { transaction_uuid } = req.query;
    
    if (transaction_uuid) {
      const payment = await Payment.findOne({ transactionId: transaction_uuid });
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
    }

    res.redirect(`http://localhost:5173/dashboard?payment=failed&reason=cancelled`);
  } catch (error) {
    console.error("eSewa failure callback error:", error);
    res.redirect(`http://localhost:5173/dashboard?payment=failed&reason=error`);
  }
});

// Get user's purchased quests
router.get("/purchased", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("purchasedQuests");

    const completedPayments = await Payment.find({
      userId: req.user.id,
      status: "completed",
    })
      .select("questId createdAt transactionDate")
      .sort({ createdAt: -1 });

    const purchasedAtByQuestId = new Map();
    completedPayments.forEach((payment) => {
      const questId = String(payment.questId);
      if (!purchasedAtByQuestId.has(questId)) {
        purchasedAtByQuestId.set(
          questId,
          payment.createdAt || payment.transactionDate || null
        );
      }
    });

    const purchasedQuests = Array.isArray(user?.purchasedQuests)
      ? user.purchasedQuests.map((quest) => {
          const questObj = quest?.toObject ? quest.toObject() : quest;
          const questId = String(questObj?._id || "");
          return {
            ...questObj,
            purchasedAt: purchasedAtByQuestId.get(questId) || null,
          };
        })
      : [];

    res.json({ purchasedQuests });
  } catch (error) {
    console.error("Error fetching purchased quests:", error);
    res.status(500).json({ message: "Failed to fetch purchased quests" });
  }
});

// Check if user has access to a specific quest
router.get("/check/:questId", authMiddleware, async (req, res) => {
  try {
    const { questId } = req.params;
    const user = await User.findById(req.user.id);
    const quest = await Quest.findById(questId);

    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    // Free quests are always accessible
    if (quest.price === 0) {
      return res.json({ hasAccess: true, isPaid: false });
    }

    // Check if purchased
    const hasAccess = user.purchasedQuests.includes(questId);
    res.json({ hasAccess, isPaid: true });
  } catch (error) {
    console.error("Error checking quest access:", error);
    res.status(500).json({ message: "Failed to check access" });
  }
});

// Get admin notifications (quest purchases)
router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    // Only admins can view notifications
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get recent payments
    const payments = await Payment.find({ status: "completed" })
      .populate("userId", "name email")
      .populate("questId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications: payments });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

module.exports = router;
