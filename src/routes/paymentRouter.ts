import express from "express";
import { requireAuth } from "../middleware/authcheck";
import * as paymentController from "../controller/payment.controller";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", requireAuth, paymentController.createPaymentOrder);
paymentRouter.post("/verify-payment", requireAuth, paymentController.verifyPayment);

export default paymentRouter;