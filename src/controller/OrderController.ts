import { Request, Response } from "express";
import { RequestWithUser } from "../middleware/authcheck";
import Cart from "../model/cart.model";
import { Product } from "../model/product.model";
import { v4 as uuidv4 } from "uuid";
import { OrderDetails } from "../model/orderdeatils.model";
import { Order } from "../model/order.model";
import { generateInvoice } from "../utils/generateInvoice";

export async function createOrder(req: RequestWithUser, res: Response) {
    try {
        const { shippingAddress, city, state, zipCode, country, PhoneNumber, notes, orderPaymentMode, orderCouponCode, } = req.body

        const UserId = req.user?.id;
        if (!UserId) {
            return res.status(401).json({ status: "failed", message: "Unauthorized - user not Found" });
        }

        const cartItems = await Cart.findAll({
            where: { userId: UserId },
            include: {
                model: Product,
                as: "product",
            }
        })

         const count = await Cart.count({where:{userId:UserId}});
                const TotalItems = count || 0;

        const OrderItems = cartItems.map(item => item.toJSON());
        console.log("userId::::::", UserId, "OrderItems::::::", OrderItems)

        if (!OrderItems || OrderItems.length === 0) {
            return res.status(400).json({ status: "failed", message: "No items in cart" });
        }

        // Calculate total price
        let totalAmount = 0;
        // let totalItems = 0;
        OrderItems.forEach(item => {
            const price = item.product?.productPrice || 0;
            const quantity = item.quantity || 0;
            totalAmount += price * quantity;
            // totalItems += quantity;
        });


        const order_tax_amount = (totalAmount * 18) / 100;
        const order_total_amount_with_tax = totalAmount + order_tax_amount;
        let order_discount_amount = 0;
        if (orderCouponCode === "DISCOUNT10") {
            console.log(orderCouponCode)
            order_discount_amount = order_total_amount_with_tax * 0.1;
        }
        const paymentMode = (orderPaymentMode || "COD").toUpperCase();
        const order_txn_id = paymentMode === "COD" ? "COD-" + uuidv4() : "PAY-" + uuidv4();
        const order_status = paymentMode === "COD" ? "confirmed" : "pending";


        //  const payload: any = {
        //     userId: UserId,
        //     order_txn_id,
        //     totalAmount,
        //     order_tax_amount,
        //     order_discount_amount,
        //     totalItems,
        //     order_coupon_code: order_coupon_code || null,
        //     order_payment_mode: paymentMode,
        //     order_status,
        //     order_address,
        //     city,
        //     state,
        //     zipCode,
        //     country,
        //     phoneNumber,
        //     notes: notes || null
        // }
        const payload: any = {
            userId: UserId,
            orderNumber: order_txn_id,
            totalAmount,
            totalItems: TotalItems,
            totalDiscount: order_discount_amount,
            shippingAddress: shippingAddress,
            city,
            state,
            zipCode,
            country,
            phoneNumber: PhoneNumber,
            paymentMethod: paymentMode,
            status: order_status,
            notes: notes || null
        };
        console.log("Order Payload::::::", payload);
        const newOrder = await Order.create(payload);

        // const orderDetailsData= OrderItems.map((item: any):any => {
        //     const price = Number(item.product?.productPrice) || 0;
        //     const qty = Number(item.quantity) || 0;
        //     return {
        //         orderId: newOrder.id,
        //         productId: item.productId,
        //         productName: item.product?.productName || "Unknown Product",
        //         sku: item.product?.sku || "SKU-" + item.productId,
        //         quantity: qty,
        //         unitPrice: price,
        //         discount: 0,
        //         taxPercent: 18,
        //         taxAmount: (price * qty * 18) / 100,
        //         totalAmount: price * qty + (price * qty * 18) / 100,
        //         status: "ORDERED",
        //   };
        // });

        const orderDetailsData = OrderItems.map((item: any) => {
            const price = Number(item.product?.productPrice) || 0;
            const qty = Number(item.quantity) || 0;

            return {
                orderId: newOrder.id,
                productId: item.productId,
                productName: item.product?.productName || "Unknown Product",
                productSku: item.product?.sku || "SKU-" + item.productId,
                quantity: qty,
                unitPrice: price,
                totalPrice: price * qty
            };
        });

        await OrderDetails.bulkCreate(orderDetailsData);



        // Clear user's cart after order creation
        await Cart.destroy({ where: { userId: UserId } });
        return generateInvoice(res, newOrder.toJSON(), orderDetailsData);
        // generateInvoice(res, newOrder, orderDetailsData);
        // res.status(201).json({ status: "success", message: "Order created successfully", order: newOrder });


    }

    catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
}