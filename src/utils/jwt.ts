import jwt from 'jsonwebtoken';

const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const getJwtSecret = () => process.env.JWT_SECRET || 't6d_6Gf^2**145@62$$&1kH@';

export interface TokenPayload {
    id: number;
    email: string;
}


export const signJwt = (payload: TokenPayload, expiresIn?: string | number) => {
    try {
        const secret = getJwtSecret();
        return jwt.sign(payload, secret, { expiresIn: expiresIn || JWT_EXPIRE });
    } catch (err) {
        return null;
    }
};



export const verifyJwt = <T = any>(token: string): T | null => {
    try {
        const decoded = jwt.verify(token, getJwtSecret()) as T;
        return decoded;
    } catch (err) {
        return null;
    }
};