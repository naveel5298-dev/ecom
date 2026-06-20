import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { User } from "./user.model";
import { OrderDetails } from "./orderdeatils.model";

interface OrderAttributes {
  id: number;
  userId: number;
  orderNumber: string;
  totalAmount: number;
  totalItems: number;
  totalDiscount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderCreationAttributes = Optional<OrderAttributes, "id" | "createdAt" | "updatedAt">;

export class Order extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes {
  public id!: number;
  public userId!: number;
  public orderNumber!: string;
  public totalAmount!: number;
  public totalItems!: number;
  public totalDiscount!: number;
  public status!: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  public shippingAddress!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public country!: string;
  public phoneNumber!: string;
  public paymentMethod!: string;
  public paymentStatus!: "pending" | "completed" | "failed" | "refunded";
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalItems: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    totalDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    shippingAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
  }
);

// Define Associations
Order.belongsTo(User, { foreignKey: "userId", as: "user", targetKey: "id" });
//OrderDetails.belongsTo(Order, { foreignKey: "orderId", as: "order", targetKey: "id" });

Order.hasMany(OrderDetails, { foreignKey: "orderId", as: "orderDetails", sourceKey: "id" });
 
export default Order;