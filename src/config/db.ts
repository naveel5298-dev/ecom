import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { Settings } from "./settings";
dotenv.config();

const DATABASE = process.env.DB_NAME;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASS;
console.log(DATABASE,USER,PASSWORD);

export const sequelize = new Sequelize(
  // Settings.db_dilect,
  // Settings.db_name,
  // Settings.db_user,
  // Settings.db_password,
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST!,
    dialect: "mysql",
    logging: false,
  }
);