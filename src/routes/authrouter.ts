import express from 'express';
import * as authController from '../controller/AuthController';
import multer from 'multer';
import { loginValidation, signupValidation } from '../middleware/validators';
import {authLimiter} from '../middleware/security';


const authRouter = express.Router();
// router level middleware

// POST METHOD
authRouter.post("/signup",signupValidation,  authController.signup);
authRouter.post("/login",authLimiter,loginValidation, authController.authLogin);
//GET METHOD
authRouter.get("/check",authController.getData);

authRouter.post("/formData",multer().none(),authController.formDataHandle);

authRouter.get("/check/:id",authController.getDataByParam);
export default authRouter;