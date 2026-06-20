import { Response } from "express"
import { RequestWithUser } from "../middleware/authcheck"
import { Product } from "../model/product.model";
import { User } from "../model/user.model";
import Cart from "../model/cart.model";
import { it } from "node:test";
import { totalmem } from "os";
import { ADDRGETNETWORKPARAMS } from "dns";

export const addTocart = async (req: RequestWithUser, res: Response) => {
    try {
        const { productId, quantity } = req.body;

        const userId = req.user?.id;

        // Validation
        if (!productId || !quantity || !userId) {
            return res.status(400).json({ message: "productId, quantity and UserId required" });

        }


        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity Must be Atleast 1" });
        }

        // Check if user exists
        const user = await Product.findByPk(userId)
        if (!user) {
            return res.status(400).json({ message: "User Not Found" })
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(400).json({ message: "Product Not Found" })
        }

        let cartItem = await Cart.findOne({ where: { userId, productId }, raw: true });

        if (cartItem) {
            await Cart.update({ quantity: cartItem.quantity + Number(quantity) }, { where: { id: cartItem.id } });
        }
        else {
            cartItem = await Cart.create({
                userId,
                productId,
                quantity,
            });
        }

        const updatedCartItem = await Cart.findByPk(cartItem.id, {
            include: [{ model: Product, as: "product", required: true }]
        });

        if (!updatedCartItem) {
            return res.status(400).json({ message: "Unable to add Item" })
        }
        return res.status(201).json({ status: "success", message: "Item added successfully", data: updatedCartItem })
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }

};

// Get all cart items for a user

export const getCartItems = async (req: RequestWithUser, res: Response) => {
    try {
        const userId = await req.user?.id;

        if (!userId) {
            return res.status(400).json({ Message: "User Id required" })
        }

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // const cartItems = await Cart.findAndCountAll({
        //     attributes: ['id', 'quantity', 'createdAt', 'updatedAt'],
        //     where: { userId },
        //     include: [{ model: Product, as: "product", required: true, attributes: ['id', 'productName', 'productPrice', 'productImage'] }],
        // });

        const cartItems = await Cart.findAll({
            attributes: ['id', 'quantity', 'createdAt', 'updatedAt'],
            include: [{
                model: Product, as: "product", required: true,
                attributes: ['id', 'productName', 'productPrice', 'productImage']
            }],
        });

        // Calculate cart total
        // const cartJson = cartItems.map(item => item.toJSON());

        const cartJson = cartItems.map(item => item.get({ plain: true }))

        let cartTotal = 0;
        const itemsWithTotal = cartJson.map((item: any) => {
            const itemTotal = Number(item.product.productPrice) * item.quantity;
            cartTotal += itemTotal;
            return ({ ...item, totalPrice: itemTotal });

        });
        res.status(200).json({
            success: true,
            message: "Cart items retrieved successfully",
            cartTotal,
            itemCount: cartItems.length,
            data: itemsWithTotal,
        });
    }
    catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}


//Update cart item quantity

export const updateCartItem = async (req: RequestWithUser, res: Response) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        //  console.log("backend received id and action ",{id,action});
        // console.log("backend req body ",req.body);

        if (!id) {
            return res.status(400).json({ success: false, message: "Cart item ID is required" });
        }

        if (!action || !["increment", "decrement"].includes(action)) {
            return res
                .status(400)
                .json({ success: false, message: "Action must be 'increment' or 'decrement'" });
        }

        const cartItem = await Cart.findByPk(id);
       // console.log("Cart item found:", cartItem);

        if (!cartItem) {
            return res
                .status(404)
                .json({ success: false, message: "Cart item not found" });
        }

        console.log("Action:", action);
        //console.log("Current:", cartItem.quantity);
        console.log("dataValues.quantity:", cartItem.dataValues.quantity);
        // console.log(cartItem.dataValues);

        const currentQuantity = Number(
            cartItem.get("quantity")
        );
        // console.log("Current Quantity:", currentQuantity);
        const newQuantity = action === "increment" ? currentQuantity + 1 : currentQuantity - 1;
        console.log("New:", newQuantity);
        if (newQuantity < 1) {
            
            return res
                .status(400)
                .json({ success: false, message: "Quantity must be at least 1" });
        }

        await Cart.update(
            { quantity: 1 },
            {
                where: {
                    quantity: 0,
                },
            }
        );
        await Cart.update({ quantity: newQuantity }, { where: { id } });
        // if(action === "decrement" && newQuantity === 1){
        //     await Cart.destroy({ where: { id } });
        // }



        // Fetch updated item with product details
        const updatedCartItem = await Cart.findByPk(id, {
            include: [{ model: Product, as: "product" }],
        });

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: updatedCartItem,
        });

    }
    catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

/**
 * Remove item from cart
 */

export const removeFromCart = async (req: RequestWithUser, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "Cart item ID is required" });
            return;
        }

        const cartItem = await Cart.findByPk(id);
        if (!cartItem) {
            res
                .status(404)
                .json({ success: false, message: "Cart item not found" });
            return;
        }

        await Cart.destroy({ where: { id } });

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
        });

    }
    catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }

}

/**
 * Clear entire cart for a user
 */

export const clearCart = async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res
                .status(400)
                .json({ success: false, message: "User ID is required" });
            return;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const deletedCount = await Cart.destroy({ where: { userId } });

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: { deletedCount }
        });

    }
    catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }

}

/**
 * Get cart item count for a user
 */

export const getCartCount = async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res
                .status(400)
                .json({ success: false, message: "User ID is required" });
            return;
        };

        const count = await Cart.count({ where: { userId } });
        res.status(200).json({
            success: true,
            message: "Cart count retrieved successfully",
            data: { count },
        });
    }
    catch (error) {
        console.error("Error fetching cart count:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }

}

