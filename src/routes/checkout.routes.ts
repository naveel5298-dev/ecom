import { Router } from "express";
import * as checkoutController from "../controller/checkoutController";

import { requireAuth } from "../middleware/authcheck";

const router = Router();

// All checkout operations require a logged-in user.
router.post("/razorpay/order", requireAuth, checkoutController.createRazorpayOrder);
router.post("/razorpay/verify", requireAuth, checkoutController.verifyRazorpayPayment);
router.post("/cod", requireAuth, checkoutController.createCodOrder);

export default router;