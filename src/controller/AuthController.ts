import { Response, Request, NextFunction } from "express"
import { User } from "../model/user.model";
import bcrypt from 'bcrypt';
import { validationResult } from "express-validator";
import { signJwt,verifyJwt } from "../utils/jwt";
import dotenv from "dotenv";
import {sendMailFun, sendSignupMail } from "../utils/mail";
import redisClient from "../config/redis";
import jwt from "jsonwebtoken";

dotenv.config();

export const signup = async (req: Request, res: Response) => {
    console.log("HEADERS:", req.headers["content-type"]);
console.log("RAW BODY:", req.body);

    try {
     
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg);
            res.status(400).json({
                status: "failed",
                message: errorMessages
            });
            return;
        }
           
        const { name, email, password, phone } = req.body;
         
        const salt: string = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const info = await User.create({
            name,
            email,
            phone,
            password: hashPassword
        });



        // info.get({ plain: true })
        // info.toJSON();
        const resData = info.get({ plain: true });

        if (!resData) {
            res.json({
                status: "failed",
                message: "Signup failed",
            })
            return;
        }


        res.json({
            status: "success",
            message: "Signup Successfully",
            data: {
                id: info.id,
                name: resData.name,
                email: resData.email,
            }
        })

        // sendMailer(email).catch((err) => {
        //     console.error("Signup Mail Error", err);
        // });
            sendSignupMail(email).catch((err) => {
            console.error("Signup Mail Error", err);
        });
    


    } catch (err) {
        console.error("Sql Error", err);
        res.json({
            status: "failed",
            message: "email alredy exits", err
        }
        )
    }
}

export const getData = (req: Request, res: Response, next: NextFunction) => {
    const { name, age } = req.query;
    res.json({
        data: name
    })
}

export const authLogin = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg);
            res.status(400).json({
                status: "Login Failed",
                message: errorMessages
            })
            return;
        }

        const { email, password } = req.body;
        const getUser = await User.findOne({ where: { email: email }, attributes: ["id", "name", "email", "password"], raw: true });
        console.log('get users', getUser?.password);
        if (!getUser) {
            res.status(400).json({
                status: "failed",
                message: "Invalid Email or Password"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, getUser.password);
        if (!isPasswordValid) {
         return res.status(401).json({
                status: "failed",
                message: "Invalid Email or Password"
            })
            
        }

        const token = signJwt({ id: getUser.id, email: getUser.email });

        res.status(200).json({
            status: "success",
            Message: "login Successfully",
            data: {
                id: getUser.id,
                name: getUser.name,
                email: getUser.email,
                access_token: token
            }
        })

    }
    catch (err) {
        console.error("Sql Error", err);
        res.json({
            status: "failed",
            message: "SQL ERROR"
        }
        )
    }


}

export const getDataByParam = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    res.json({
        data: id
    })
}

export const formDataHandle = (req: Request<{}, {}, User>, res: Response) => {
    try {
        const bodyData: User = req.body;
        res.json({
            allData: bodyData
        })
    } catch (err) {

    }
}


export const logout = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'failed', message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token is valid
        const decoded = verifyJwt(token as any);
        if (!decoded) {
            return res.status(401).json({ status: 'failed', message: 'Invalid or expired token' });
        }

        // Decode token to get expiry
        const decodedPayload: any = jwt.decode(token as string);
        const exp = decodedPayload?.exp as number | undefined;
        if (!exp) {
            return res.status(400).json({ status: 'failed', message: 'Invalid token payload' });
        }

        const now = Math.floor(Date.now() / 1000);
        const ttl = exp - now;
        if (ttl <= 0) {
            return res.status(400).json({ status: 'failed', message: 'Token already expired' });
        }

        // blacklist the token in Redis
        await redisClient.setEx(`bl:${token}`, ttl, '1');

        return res.status(200).json({ status: 'success', message: 'Logout successful' });
    } catch (err) {
        console.error('Logout Error', err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error' });
    }
};