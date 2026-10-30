
import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Op } from "sequelize";

import { sequelize } from "../config/db";
import { Cart } from "../model/cart.model";
import { Product } from "../model/product.model";
import { Order } from "../model/order.model";
import { OrderDetails } from "../model/orderdeatils.model";
import Payment from "../model/payment.model";


import { RequestWithUser } from "../middleware/authcheck";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const getUserId = (req: RequestWithUser): number => {
  // Change "id" to "userId" if that is the claim in your JWT.
  const user = req.user as any;
  const id = Number(user?.id ?? user?.userId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid user ID in authentication token");
  }

  return id;
};

const validateAddress = (body: any) => {
  const fields = [
    "shippingAddress",
    "city",
    "state",
    "zipCode",
    "country",
    "phoneNumber",
  ];

  for (const field of fields) {
    if (
      typeof body[field] !== "string" ||
      body[field].trim().length === 0
    ) {
      throw new Error(`${field} is required`);
    }
  }
};

const createPendingOrder = async (
  userId: number,
  body: any,
  transaction: any
) => {
  const cartItems = await Cart.findAll({
    where: { userId },
    include: [{ model: Product, as: "product" }],
    transaction,
    order: [["id", "ASC"]],
  });

  if (cartItems.length === 0) {
    throw new Error("Your cart is empty");
  }

  let totalAmount = 0;
  let totalItems = 0;

  const items = cartItems.map((cart) => {
    const product = cart.product;

    if (!product) {
      throw new Error(`Product ${cart.productId} was not found`);
    }

    if (
      product.productStatus &&
      !["active", "1"].includes(
        String(product.productStatus).toLowerCase()
      )
    ) {
      throw new Error(`${product.productName} is not available`);
    }

    if (cart.quantity < 1) {
      throw new Error("Invalid cart quantity");
    }

    if (
      product.productStock != null &&
      product.productStock < cart.quantity
    ) {
      throw new Error(`Insufficient stock for ${product.productName}`);
    }

    const unitPrice = Number(product.productPrice);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid price for ${product.productName}`);
    }

    const lineTotal = Math.round(unitPrice * 100) * cart.quantity;

    totalAmount += lineTotal;
    totalItems += cart.quantity;

    return {
      productId: product.id,
      quantity: cart.quantity,
      unitPrice: unitPrice,
      totalPrice: lineTotal / 100,
      productName: product.productName,
      productSku: product.sku ?? "",
    };
  });

  // Use a unique order number for each checkout.
  const orderNumber = `ORD-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

  const order = await Order.create(
    {
      userId,
      orderNumber,
      totalAmount: totalAmount / 100,
      totalItems,
      totalDiscount: 0,
      status: "pending",
      shippingAddress: body.shippingAddress.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      zipCode: body.zipCode.trim(),
      country: body.country.trim(),
      phoneNumber: body.phoneNumber.trim(),
      paymentMethod: body.paymentMethod,
      paymentStatus: "pending",
      notes: body.notes?.trim() || undefined,
    },
    { transaction }
  );

  await OrderDetails.bulkCreate(
    items.map((item) => ({
      orderId: order.id,
      ...item,
    })),
    { transaction }
  );

  return { order, items, totalAmount };
};

/**
 * POST /api/v1/checkout/razorpay/order
 */
export const createRazorpayOrder = async (
  req: RequestWithUser,
  res: Response
) => {
  let order: Order | undefined;

  try {
    const userId = getUserId(req);
    validateAddress(req.body);

    const result = await sequelize.transaction(async (transaction) => {
      const created = await createPendingOrder(
        userId,
        { ...req.body, paymentMethod: "razorpay" },
        transaction
      );

      return created;
    });

    order = result.order;

    // Razorpay expects the amount in paise, not rupees.
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: String(order.id),
        orderNumber: order.orderNumber,
        userId: String(userId),
      },
    });

    await Payment.create({
      orderId: order.id,
      provider: "razorpay",
      providerOrderId: razorpayOrder.id,
      amount: Number(order.totalAmount),
      currency: "INR",
      status: "created",
    });

    return res.status(201).json({
      status: "success",
      message: "Checkout order created",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: amountInPaise,
        currency: "INR",
        razorpayOrderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error("Create Razorpay order error:", error);

    if (order) {
      await order.update({ status: "cancelled" }).catch(console.error);
    }

    return res.status(400).json({
      status: "failed",
      message: error.message || "Could not create checkout order",
    });
  }
};

/**
 * POST /api/v1/checkout/razorpay/verify
 */
export const verifyRazorpayPayment = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const userId = getUserId(req);

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
        message: "Missing Razorpay payment verification fields",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error("Razorpay secret is not configured");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const supplied = Buffer.from(String(razorpay_signature), "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");

    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid payment signature",
      });
    }

    const paymentRecord = await Payment.findOne({
      where: { providerOrderId: razorpay_order_id },
      include: [
        {
          model: Order,
          as: "order",
        },
      ],
    });

    if (!paymentRecord) {
      return res.status(404).json({
        status: "failed",
        message: "Payment record not found",
      });
    }

    const order = await Order.findByPk(paymentRecord.orderId);

    if (!order || order.userId !== userId) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    // Idempotency: don't process the same successful payment twice.
    if (
      paymentRecord.status === "captured" &&
      paymentRecord.providerPaymentId === razorpay_payment_id &&
      order.paymentStatus === "completed"
    ) {
      return res.json({
        status: "success",
        message: "Payment already verified",
        data: { orderId: order.id, orderNumber: order.orderNumber },
      });
    }

    // Never trust the frontend's success callback alone.
    const gatewayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      gatewayPayment.order_id !== razorpay_order_id ||
      Number(gatewayPayment.amount) !==
        Math.round(Number(paymentRecord.amount) * 100) ||
      gatewayPayment.currency !== "INR" ||
      gatewayPayment.status !== "captured"
    ) {
      return res.status(400).json({
        status: "failed",
        message:
          "Payment is not captured or does not match this order. Ensure automatic capture is configured in Razorpay.",
      });
    }

    await sequelize.transaction(async (transaction) => {
      const lockedOrder = await Order.findByPk(order.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const lockedPayment = await Payment.findByPk(paymentRecord.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!lockedOrder || !lockedPayment) {
        throw new Error("Order or payment record not found");
      }

      if (lockedOrder.paymentStatus === "completed") {
        if (
          lockedPayment.providerPaymentId !== razorpay_payment_id
        ) {
          throw new Error("Order has already been paid with another payment");
        }
        return;
      }

      const details = await OrderDetails.findAll({
        where: { orderId: lockedOrder.id },
        transaction,
      });

      // Recheck and decrement stock atomically after payment confirmation.
      for (const detail of details) {
        const product = await Product.findByPk(detail.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!product) {
          throw new Error(`Product ${detail.productId} no longer exists`);
        }

        if (
          product.productStock != null &&
          product.productStock < detail.quantity
        ) {
          throw new Error(
            `Insufficient stock for ${product.productName}. Contact support about your captured payment.`
          );
        }

        if (product.productStock != null) {
          await product.update(
            {
              productStock: product.productStock - detail.quantity,
            },
            { transaction }
          );
        }
      }

      await lockedPayment.update(
        {
          providerPaymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: "captured",
        },
        { transaction }
      );

      await lockedOrder.update(
        {
          paymentStatus: "completed",
          status: "confirmed",
        },
        { transaction }
      );

      // Remove only the purchased products from this user's cart.
      const purchasedProductIds = details.map((item) => item.productId);

      await Cart.destroy({
        where: {
          userId,
          productId: { [Op.in]: purchasedProductIds },
        },
        transaction,
      });
    });

    return res.json({
      status: "success",
      message: "Payment verified and order confirmed",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentId: razorpay_payment_id,
      },
    });
  } catch (error: any) {
    console.error("Verify Razorpay payment error:", error);

    return res.status(500).json({
      status: "failed",
      message: error.message || "Payment verification failed",
    });
  }
};

/**
 * POST /api/v1/checkout/cod
 */
export const createCodOrder = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    validateAddress(req.body);

    const result = await sequelize.transaction(async (transaction) => {
      const created = await createPendingOrder(
        userId,
        { ...req.body, paymentMethod: "cod" },
        transaction
      );

      // Reserve stock immediately for COD orders.
      for (const item of created.items) {
        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!product) {
          throw new Error(`Product ${item.productId} no longer exists`);
        }

        if (
          product.productStock != null &&
          product.productStock < item.quantity
        ) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }

        if (product.productStock != null) {
          await product.update(
            {
              productStock: product.productStock - item.quantity,
            },
            { transaction }
          );
        }
      }

      // COD payment remains pending until collection.
      await created.order.update(
        {
          status: "confirmed",
          paymentStatus: "pending",
        },
        { transaction }
      );

      await Cart.destroy({
        where: { userId },
        transaction,
      });

      return created;
    });

    return res.status(201).json({
      status: "success",
      message: "Cash on Delivery order placed",
      data: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        totalAmount: result.order.totalAmount,
        paymentMethod: "cod",
        paymentStatus: "pending",
      },
    });
  } catch (error: any) {
    console.error("Create COD order error:", error);

    return res.status(400).json({
      status: "failed",
      message: error.message || "Could not place COD order",
    });
  }
};
