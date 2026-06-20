import { Router } from "express";
import { 
  createProduct,
  getProduct, 
  getProductByid, 
  removeProduct, 
  updateProduct,
  getProductBycatId } from "../controller/productController";
import { requireAuth } from "../middleware/authcheck";
import rateLimit from "express-rate-limit";
import multer from "multer";



export const cloud = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 1MB
});

const productRouter = Router();



// requireAuth router based middleware

//productRouter.use(requireAuth);
productRouter.get("/allproducts",  getProduct);

productRouter.get("/getbyid",getProductByid);

//productRouter.use(requireAuth);
productRouter.post("/add",cloud.single("productImage"),createProduct);
productRouter.put("/update/:id",updateProduct);
productRouter.delete("/remove/:id",removeProduct);
productRouter.get("/getbycategory/:id", getProductBycatId);

export default productRouter;