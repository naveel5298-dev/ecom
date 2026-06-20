import dotenv from 'dotenv'
dotenv.config();

interface Settings{
    port:number,
    host:string,
    db_name:string,
    db_dilect:string,
    db_port:number,
    db_user:string,
    db_password:string
    db_host:string
    secret_key:string
}

export const Settings:Settings  = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || "localhost",
  db_dilect:process.env.DB_DILECT as string,
  db_name:process.env.DB_NAME as string,
  db_port:Number (process.env.DB_PORT) as number,
  db_user:process.env.DB_USER as string,
  db_password:process.env.DB_PASS as string,
  db_host:process.env.DB_HOST as string,
  secret_key:process.env.JWT_SECRET as string
}

