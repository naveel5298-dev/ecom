import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "node:crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// CREATE PAYMENT ORDER
export async function createPaymentOrder(
  req: Request,
  res: Response
) {
  try {
    // Your JWT middleware should attach the logged-in user.
    const userId = (req as any).user.id;

    // TODO: Load this user's cart from MySQL using Sequelize.
    // TODO: Calculate the total from database product prices.
    // TODO: Validate stock and create a pending order in MySQL.

    const totalInRupees = 1500; // Replace with your server-calculated cart total.

    if (!Number.isFinite(totalInRupees) || totalInRupees <= 0) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid payment amount",
      });
    }

    const amountInPaise = Math.round(totalInRupees * 100);

    const paymentOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `user_${userId}_${Date.now()}`,
    });

    // TODO: Save paymentOrder.id and the pending order
    // reference in your MySQL database.

    return res.status(201).json({
      status: "success",
      data: {
        razorpayOrderId: paymentOrder.id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Payment order creation failed:", error);

    return res.status(500).json({
      status: "failed",
      message: "Could not initiate payment",
    });
  }
}


////VERIFY PAYMENT SIGNATURE
export async function verifyPayment(
  req: Request,
  res: Response
) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Missing payment details",
      });
    }

    // TODO: Find the pending payment in MySQL and ensure
    // it belongs to the authenticated user.

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET!
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest();

    const receivedSignature = Buffer.from(
      razorpay_signature,
      "hex"
    );

    const valid =
      receivedSignature.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        expectedSignature,
        receivedSignature
      );

    if (!valid) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid payment signature",
      });
    }

    // IMPORTANT:
    // Confirm payment capture/status through Razorpay's API
    // or a verified webhook before fulfilling the order.
    // Update the matching order/payment transaction in MySQL
    // using a database transaction and idempotent logic.

    return res.json({
      status: "success",
      message: "Payment signature verified",
    });
  } catch (error) {
    console.error("Payment verification failed:", error);

    return res.status(500).json({
      status: "failed",
      message: "Payment verification failed",
    });
  }
}