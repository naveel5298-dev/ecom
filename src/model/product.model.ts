import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { Category } from "./category.model";

interface ProductAttributes {
  id?: number;
  productName: string;
  productPrice: number;
  description?: string;
  sku?: string;
  cat_id: number; // Foreign key to Category
  // Relative or absolute path to product image
  productImage?: string;
  productUnit:string;
  productStock?:number;
  productStatus?:number;
  productRating?:number;
  createdAt?: Date;
  updatedAt?: Date;
}

//type ProductCreationAttributes = Optional<ProductAttributes, "id" | "createdAt" | "updatedAt">;

export class Product extends Model<ProductAttributes>
  implements ProductAttributes {
  public id!: number;
  public productName!: string;
  public productPrice!: number;
  public description?: string;
  public sku?: string;
  public cat_id!: number;
  public productUnit!: string;
  public productStock?: number;
  public productStatus?: number;
  public productRating?: number;
  public productImage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull:false,
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    productPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    cat_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    productUnit: {
      type: DataTypes.STRING(50),
      allowNull: false, 
      defaultValue: "pcs",
    },
    productStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    productStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
    productRating: {  
      type: DataTypes.DECIMAL(3, 2),
      validate: { min: 0, max: 5 },
      allowNull: true,
      defaultValue: 0,
    },
    productImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "product",
    modelName: "Product",
    timestamps: true,
  }
);

Product.belongsTo(Category, { foreignKey: "cat_id", targetKey: "id" });
Category.hasMany(Product, { foreignKey: "cat_id", sourceKey: "id" });