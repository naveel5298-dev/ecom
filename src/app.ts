import express  from "express";
import authRouter from "./routes/authrouter";
import productRouter from "./routes/productrouter";
import { applySecurity } from "./middleware/security";
import { applyPerformance } from "./middleware/performance";
import cartRouter from "./routes/cartrouter";
import categoryRouter from "./routes/category.router";
import orderRouter from "./routes/OrderRouter";



const app = express();

// app.use is builtin middleware of Express


app.use(express.json({limit:"1024kb"})); // application label middleware (third party in middleware)
app.use(express.urlencoded({extended:true, limit:"1024kb"})); // application label middleware (third party in middleware)


applyPerformance(app); // application level middleware

applySecurity(app); // application level middleware


app.use("/api/v1/auth",authRouter); // router based middleware
app.use("/api/v1/product",productRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/category",categoryRouter)
app.use("/api/v1/order",orderRouter)

export default app;