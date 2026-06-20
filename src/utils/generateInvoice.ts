import PDFDocument from 'pdfkit';
import { Response } from 'express';

// export const generateInvoice = (res:Response,order:any,items:any)=>{
//     const doc = new PDFdocument();
//     doc.text(`Invoice for Order #${order.id}`);
//     doc.text(`Customer: ${order.userId}`);
//     doc.text(`Total Amount: ${order.totalAmount}`);
//     doc.text(`Tax Amount: ${order.order_tax_amount}`);
//     doc.text(`Discount Amount: ${order.order_discount_amount}`);
//     doc.text('Items:');
//     items.forEach((item:any) => {
//         doc.text(`- ${item.productName} x ${item.quantity} @ ${item.price} each`);
//     });
//     doc.end();

// }


export const generateInvoice = (res: Response, order: any, items: any[]) => {

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${order.id}.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(18).text(`Invoice #${order.orderNumber}`);
    doc.moveDown();

    // Order Info
    doc.text(`Customer ID: ${order.userId}`);
    doc.text(`Phone: ${order.phoneNumber}`);
    doc.text(`Payment: ${order.paymentMethod}`);
    doc.text(`Status: ${order.status}`);

    doc.moveDown();

    // Address
    doc.text(`Address: ${order.shippingAddress}`);
    doc.text(`${order.city}, ${order.state} - ${order.zipCode}`);
    doc.text(`${order.country}`);

    doc.moveDown();
    doc.text("Items:");
    doc.moveDown();

    items.forEach((item: any, i: number) => {
        doc.text(
            `${i + 1}. ${item.productName} | Qty: ${item.quantity} | Price: ₹${item.unitPrice} | Total: ₹${item.totalPrice}`
        );
    });

    doc.moveDown();

    // Totals
    doc.text(`Total Items: ${order.totalItems}`);
    doc.text(`Discount: ₹${order.totalDiscount || 0}`);
    doc.text(`Total Amount: ₹${order.totalAmount}`);

    doc.end();
};