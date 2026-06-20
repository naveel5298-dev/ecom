import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { Product } from "./product.model";
import { Order } from "./order.model";


interface OrderDetailsAttributes {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productSku: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderDetailsCreationAttributes = Optional<OrderDetailsAttributes, "id" | "createdAt" | "updatedAt">;

export class OrderDetails extends Model<OrderDetailsAttributes, OrderDetailsCreationAttributes>
  implements OrderDetailsAttributes {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public productName!: string;
  public productSku!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderDetails.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "product",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    productSku: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "order_details",
    timestamps: true,
  }
);

// Define Association
OrderDetails.belongsTo(Product, { foreignKey: "productId", as: "product" });
export default OrderDetails;