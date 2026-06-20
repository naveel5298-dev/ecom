import express from "express";
import { requireAuth } from "../middleware/authcheck";
import * as orderController from "../controller/OrderController";

const orderRouter = express.Router();

orderRouter.post("/", requireAuth, orderController.createOrder);
// orderRouter.get("/", requireAuth, orderController.getOrders);
// orderRouter.get("/:id", requireAuth, orderController.getOrderById);
// orderRouter.put("/:id", requireAuth, orderController.updateOrder);
// orderRouter.delete("/:id", requireAuth, orderController.deleteOrder);

export default orderRouter;