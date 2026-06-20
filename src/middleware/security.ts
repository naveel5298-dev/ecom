import { NextFunction,Request,Response } from "express";
import {Express} from 'express';
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";


// Rate limiting middleware
export const limiter = rateLimit({
    windowMs: 1* 60 * 1000, // 1 minutes
    max: 10, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 3, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});


export const headersOptions = (req:Request,res:Response,next:NextFunction)=>{
    // res.header("Access-Control-Allow-Origin","*");
    // res.header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,PATCH,OPTIONS");
    // res.header("Access-Control-Allow-Headers","Content-Type,Authorization");
    // res.header("Access-Control-Allow-Credentials","true");
    // res.header("Access-Control-Max-Age","86400"); // 24 hours
    // res.header("Access-Control-Expose-Headers","Content-Length, X-Kuma-Revision");
    res.header("x-frame-options","DENY");
    //res.header("x-xss-protection","1; mode=block");
    // res.header("x-content-type-options","nosniff");
    // res.header("referrer-policy","no-referrer-when-downgrade");
    // res.header("strict-transport-security","max-age=31536000; includeSubDomains");
    next();

}



// Configure CORS
export const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
   // optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
};

export const applySecurity = (app:Express)=>{
        const node_env = process.env.NODE_ENV=="production";
       node_env?app.use(cors(corsOptions)):app.use(cors())
       // app.use(headersOptions);
        //app.use(helmet());
     ////   app.use(limiter);
        // prevent param pollution and remove null values
        app.use((req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            // Remove any null or undefined values
            Object.keys(req.body).forEach(key => {
                if (req.body[key] === null || req.body[key] === undefined) {
                    delete req.body[key];
                }
            });
        }
        next();
    });
}