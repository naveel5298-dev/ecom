import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  phone:string;
  password:string;
  createdAt?:Date;
  updatedAt?:Date;
}

type UserCreationAttributes = Optional<UserAttributes,  "id" | "createdAt" | "updatedAt">;

export class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public phone!:string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull:false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone:{
      type: DataTypes.STRING(12),
      allowNull: false,
      unique:true,
    },
    password:{
        type: DataTypes.STRING(255),
        allowNull: true,
    }
  },
  {
    sequelize,           // connection
    tableName: "users",  // DB table name
    modelName: "User",   // Sequelize model name
    timestamps: true,
  }
);