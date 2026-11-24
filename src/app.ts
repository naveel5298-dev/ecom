import express  from "express";
import authRouter from "./routes/authrouter";
import productRouter from "./routes/productrouter";
import { applySecurity } from "./middleware/security";
import { applyPerformance } from "./middleware/performance";
import cartRouter from "./routes/cartrouter";
import categoryRouter from "./routes/category.router";
import orderRouter from "./routes/OrderRouter";
import paymentRouter from "./routes/paymentRouter";
import checkoutRouter from "./routes/checkout.routes";

import path from 'path';
import { fileURLToPath } from 'url';



const app = express();

// app.use is builtin middleware of Express


app.use(express.json({limit:"1024kb"})); // application label middleware (third party in middleware)
app.use(express.urlencoded({extended:true, limit:"1024kb"})); // application label middleware (third party in middleware)


applyPerformance(app); // application level middleware

applySecurity(app); // application level middleware


// app.use("/",function(req,res){
//     console.log(res.json({status:"success"}))
    
// })
app.use("/api/v1/auth",authRouter); // router based middleware
app.use("/api/v1/product",productRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/category",categoryRouter)
app.use("/api/v1/order",orderRouter)
app.use("/api/v1/payment",paymentRouter)
app.use("/api/v1/checkout",checkoutRouter)

export default app;


///////
import fs from "fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// React build folder in project root
const frontendPath = path.resolve(__dirname, "../dist");

if (!fs.existsSync(path.join(frontendPath, "index.html"))) {
    throw new Error(`React build not found: ${frontendPath}`);
}

// Register API routes BEFORE frontend serving

app.use(express.static(frontendPath));

// React Router fallback (Express 5)
app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});

