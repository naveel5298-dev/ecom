import express from "express";
import { requireAuth } from "../middleware/authcheck";
import { addTocart } from "../controller/cartController";
import * as cartController from "../controller/cartController";

const cartRouter = express.Router();

/**
 * POST /api/v1/cart/add
 * Add item to cart
 */
cartRouter.post("/add",requireAuth,addTocart);

/**
 * GET /api/cart/:userId
 * Get all cart items for a user
 */
cartRouter.get("/", requireAuth, cartController.getCartItems)

/**
 * GET /api/cart/count/:userId
 * Get cart item count for a user
 */
cartRouter.get("/count/:userId", requireAuth, cartController.getCartCount);

/**
 * PUT /api/v1/cart/:id
 * Update cart item quantity
 */
cartRouter.put("/:id", requireAuth, cartController.updateCartItem);


/**
 * DELETE /api/v1/cart/:id
 * Remove item from cart
 */
cartRouter.delete("/:id", requireAuth, cartController.removeFromCart);

/**
 * DELETE /api/v1/cart/clear/:userId
 * Clear entire cart for a user
 */
cartRouter.delete("/clear/:userId", requireAuth, cartController.clearCart);

export default cartRouter;