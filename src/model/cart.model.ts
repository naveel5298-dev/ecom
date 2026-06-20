import { Optional, Model, DataTypes } from "sequelize"
import { User } from "./user.model";
import { Product } from "./product.model";
import { sequelize } from "../config/db";


interface cartAttributes {
    id: number,
    userId: number,
    productId: number,
    quantity: number,
    createdAt?: Date,
    updatedAt?: Date
    product?: Product; // Include product details in cart response
}

type cartCreationAttributes = Optional<cartAttributes, "id" | "createdAt" | "updatedAt">;

export class Cart extends Model<cartAttributes, cartCreationAttributes>
    implements cartAttributes {
    public id!: number;
    public userId!: number;
    public productId!: number;
    public quantity!: number;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;
    public product?: Product; // Include product details in cart response
}

Cart.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
        },
        productId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Product,
                key: "id",
            },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
            },
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
        tableName: "carts",
        modelName: "cart",
        timestamps: true,
        indexes: [
            {
                fields: ["userId"],
            },
            {
                fields: ["productId"],
            },
            {
                fields: ["userId", "productId"],
                unique: true,
            },
        ],

    }
    
);


// Associations
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });
Cart.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User.hasMany(Cart, { foreignKey: "userId", as: "cartItems" });
// Product.hasMany(Cart, { foreignKey: "productId", as: "cartItems" });

export default Cart;