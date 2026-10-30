import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { Order } from "./order.model";

interface PaymentAttributes {
  id: number;
  orderId: number;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string | null;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  signature?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  "id" | "providerPaymentId" | "signature" | "createdAt" | "updatedAt"
>;

export class Payment extends Model<
  PaymentAttributes,
  PaymentCreationAttributes
> implements PaymentAttributes {
  public id!: number;
  public orderId!: number;
  public provider!: string;
  public providerOrderId!: string;
  public providerPaymentId!: string | null;
  public amount!: number;
  public currency!: string;
  public status!: PaymentAttributes["status"];
  public signature!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
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
    provider: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "razorpay",
    },
    providerOrderId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    providerPaymentId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },
    status: {
      type: DataTypes.ENUM(
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded"
      ),
      allowNull: false,
      defaultValue: "created",
    },
    signature: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "payments",
    timestamps: true,
  }
);

Payment.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

Order.hasMany(Payment, {
  foreignKey: "orderId",
  as: "payments",
});

export default Payment;