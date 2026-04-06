/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../connectDB");
const Payment = require("../models/Payment");
const User = require("../models/user");

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  if (!raw) return fallback;
  const value = raw.slice(prefix.length);
  return value === "" ? fallback : value;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const limit = Number(parseArg("limit", "5"));
  const apply = hasFlag("apply");
  const status = parseArg("status", "completed");

  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error("--limit must be a positive number");
  }

  await connectDB();

  const payments = await Payment.find({ status })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (payments.length === 0) {
    console.log(`No payments found with status '${status}'.`);
    return;
  }

  let wouldDelete = 0;
  let wouldPullQuestRefs = 0;

  console.log(`Found ${payments.length} payments (status='${status}') to process.`);

  for (const payment of payments) {
    const hasOtherCompleted = await Payment.exists({
      _id: { $ne: payment._id },
      userId: payment.userId,
      questId: payment.questId,
      status: "completed",
    });

    const paymentId = String(payment._id);
    const userId = String(payment.userId);
    const questId = String(payment.questId);

    wouldDelete += 1;

    if (!hasOtherCompleted) {
      wouldPullQuestRefs += 1;
    }

    console.log(
      `${apply ? "APPLY" : "DRY"} | payment=${paymentId} | user=${userId} | quest=${questId} | pullPurchasedQuest=${!hasOtherCompleted}`
    );

    if (!apply) {
      continue;
    }

    if (!hasOtherCompleted) {
      await User.updateOne(
        { _id: payment.userId },
        { $pull: { purchasedQuests: payment.questId } }
      );
    }

    await Payment.deleteOne({ _id: payment._id });
  }

  console.log("--- Summary ---");
  console.log(`Payments ${apply ? "deleted" : "to delete"}: ${wouldDelete}`);
  console.log(
    `User purchasedQuests refs ${apply ? "pulled" : "to pull"}: ${wouldPullQuestRefs}`
  );
}

main()
  .catch((err) => {
    console.error("Cleanup failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
