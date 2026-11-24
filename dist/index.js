// src/index.ts
import http from "http";

// src/app.ts
import express6 from "express";

// src/routes/authrouter.ts
import express from "express";

// src/model/user.model.ts
import { DataTypes, Model } from "sequelize";

// src/config/db.ts
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();
var DATABASE = process.env.DB_NAME;
var USER = process.env.DB_USER;
var PASSWORD = process.env.DB_PASS;
var sequelize = new Sequelize(
  // Settings.db_dilect,
  // Settings.db_name,
  // Settings.db_user,
  // Settings.db_password,
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false
  }
);

// src/model/user.model.ts
var User = class extends Model {
  id;
  name;
  email;
  phone;
  password;
  createdAt;
  updatedAt;
};
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    // connection
    tableName: "users",
    // DB table name
    modelName: "User",
    // Sequelize model name
    timestamps: true
  }
);

// src/controller/AuthController.ts
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
var getJwtSecret = () => process.env.JWT_SECRET || "t6d_6Gf^2**145@62$$&1kH@";
var signJwt = (payload, expiresIn) => {
  try {
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, { expiresIn: expiresIn || JWT_EXPIRE });
  } catch (err) {
    return null;
  }
};
var verifyJwt = (token) => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded;
  } catch (err) {
    return null;
  }
};

// src/controller/AuthController.ts
import dotenv3 from "dotenv";

// src/utils/mail.ts
import nodemailer from "nodemailer";
import dotenv2 from "dotenv";
dotenv2.config();
var transporter = null;
async function getTransporter() {
  if (transporter)
    return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  console.log(host, user, pass);
  if (host && user && pass) {
    console.error(`test pass`);
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
        // Gmail App Password
      }
    });
  }
  return transporter;
}
async function sendMailFun({ to, subject, text, html }) {
  const t = await getTransporter();
  const from = process.env.EMAIL_USER || `no-reply@${process.env.APP_DOMAIN || "localhost"}`;
  const info = await t.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
  console.log("Message sent:", info.messageId);
}
async function sendSignupMail(to, name, verificationURL) {
  const subject = "Welcome to Our App \u2014 Please confirm your email";
  const safeName = name || "there";
  const html = `
       <p>Hi ${safeName},</p>
    <p>Thanks for signing up! Please confirm your email by clicking the link below:</p>
    <p><a href="${verificationURL || "#"}">Confirm your email</a></p>
    <p>If you didn't create an account, you can safely ignore this message.</p>
    <p>\u2014 The Team</p>`;
  const text = `Hi ${safeName},

Thanks for signing up! Confirm your email: ${verificationURL || "#"}

\u2014 The Team`;
  return sendMailFun({ to, subject, text, html });
}

// src/config/redis.ts
import { createClient } from "redis";
var redisClient = createClient({
  url: "redis://localhost:6379"
  // add password if needed
  // url: "redis://:password@localhost:6379"
});
redisClient.on("connect", () => {
  console.log("\u2705 Redis connected");
});
redisClient.on("error", (err) => {
  console.error("\u274C Redis error:", err);
});
var connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
var redis_default = redisClient;

// src/controller/AuthController.ts
import jwt2 from "jsonwebtoken";
dotenv3.config();
var signup = async (req, res) => {
  console.log("HEADERS:", req.headers["content-type"]);
  console.log("RAW BODY:", req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      res.status(400).json({
        status: "failed",
        message: errorMessages
      });
      return;
    }
    const { name, email, password, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const info = await User.create({
      name,
      email,
      phone,
      password: hashPassword
    });
    const resData = info.get({ plain: true });
    if (!resData) {
      res.json({
        status: "failed",
        message: "Signup failed"
      });
      return;
    }
    res.json({
      status: "success",
      message: "Signup Successfully",
      data: {
        id: info.id,
        name: resData.name,
        email: resData.email
      }
    });
    sendSignupMail(email).catch((err) => {
      console.error("Signup Mail Error", err);
    });
  } catch (err) {
    console.error("Sql Error", err);
    res.json(
      {
        status: "failed",
        message: "email alredy exits",
        err
      }
    );
  }
};
var getData = (req, res, next) => {
  const { name, age } = req.query;
  res.json({
    data: name
  });
};
var authLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      res.status(400).json({
        status: "Login Failed",
        message: errorMessages
      });
      return;
    }
    const { email, password } = req.body;
    const getUser = await User.findOne({ where: { email }, attributes: ["id", "name", "email", "password"], raw: true });
    console.log("get users", getUser?.password);
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
      });
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
    });
  } catch (err) {
    console.error("Sql Error", err);
    res.json(
      {
        status: "failed",
        message: "SQL ERROR"
      }
    );
  }
};
var getDataByParam = (req, res, next) => {
  const { id } = req.params;
  res.json({
    data: id
  });
};
var formDataHandle = (req, res) => {
  try {
    const bodyData = req.body;
    res.json({
      allData: bodyData
    });
  } catch (err) {
  }
};
var logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    if (!decoded) {
      return res.status(401).json({ status: "failed", message: "Invalid or expired token" });
    }
    const decodedPayload = jwt2.decode(token);
    const exp = decodedPayload?.exp;
    if (!exp) {
      return res.status(400).json({ status: "failed", message: "Invalid token payload" });
    }
    const now = Math.floor(Date.now() / 1e3);
    const ttl = exp - now;
    if (ttl <= 0) {
      return res.status(400).json({ status: "failed", message: "Token already expired" });
    }
    await redis_default.setEx(`bl:${token}`, ttl, "1");
    return res.status(200).json({ status: "success", message: "Logout successful" });
  } catch (err) {
    console.error("Logout Error", err);
    return res.status(500).json({ status: "failed", message: "Internal server error" });
  }
};

// src/routes/authrouter.ts
import multer from "multer";

// src/middleware/validators.ts
import { body } from "express-validator";
var signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters").matches(/^[a-zA-Z\s'-]+$/).withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage("Password must contain uppercase, lowercase, number, and special character (@$!%*?&)"),
  body("phone").trim().notEmpty().withMessage("Phone number is required").matches(/^[0-9]{10,12}$/).withMessage("Phone must be 10-12 digits")
];
var loginValidation = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];
var createCategoryValidation = [
  body("catName").trim().notEmpty().withMessage("Category name is required").isLength({ min: 2 }).withMessage("Category name must be at least 2 characters"),
  body("catSlug").trim().notEmpty().withMessage("Category slug is required").isLength({ min: 2 }).withMessage("Category slug must be at least 2 characters").matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage("Category slug can only contain lowercase letters, numbers, and hyphens")
];
var updateCategoryValidation = [
  body("catName").optional().trim().isLength({ min: 2 }).withMessage("Category name must be at least 2 characters").isLength({ max: 200 }).withMessage("Category name must not exceed 200 characters").matches(/^[a-zA-Z\s'-]+$/).withMessage("Category name can only contain letters, spaces, hyphens, and apostrophes"),
  body("catSlug").optional().trim().isLength({ min: 2 }).withMessage("Category slug must be at least 2 characters").isLength({ max: 100 }).withMessage("Category slug must not exceed 100 characters").matches(/^[a-z0-9-]+$/).withMessage("Category slug must be lowercase alphanumeric with hyphens only"),
  body("catDesc").optional().trim().isLength({ max: 2e3 }).withMessage("Category description must not exceed 2000 characters")
];

// src/middleware/security.ts
import rateLimit from "express-rate-limit";
import cors from "cors";
var limiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // 1 minutes
  max: 10,
  // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var authLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minutes
  max: 3,
  // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5174", "http://localhost:3000"],
  credentials: true,
  // optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
var applySecurity = (app2) => {
  const node_env = process.env.NODE_ENV == "production";
  node_env ? app2.use(cors(corsOptions)) : app2.use(cors());
  app2.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] === null || req.body[key] === void 0) {
          delete req.body[key];
        }
      });
    }
    next();
  });
};

// src/routes/authrouter.ts
var authRouter = express.Router();
authRouter.post("/signup", signupValidation, signup);
authRouter.post("/login", authLimiter, loginValidation, authLogin);
authRouter.get("/check", getData);
authRouter.post("/formData", multer().none(), formDataHandle);
authRouter.get("/check/:id", getDataByParam);
authRouter.post("/logout", logout);
var authrouter_default = authRouter;

// src/routes/productrouter.ts
import { Router } from "express";

// src/controller/productController.ts
import { Op } from "sequelize";

// src/model/product.model.ts
import { DataTypes as DataTypes3, Model as Model3 } from "sequelize";

// src/model/category.model.ts
import { DataTypes as DataTypes2, Model as Model2 } from "sequelize";
var Category = class extends Model2 {
  id;
  catName;
  catDesc;
  catSlug;
  createdAt;
  updatedAt;
};
Category.init(
  {
    id: {
      type: DataTypes2.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    catName: {
      type: DataTypes2.STRING(200),
      allowNull: false
    },
    catDesc: {
      type: DataTypes2.TEXT,
      allowNull: true
    },
    catSlug: {
      type: DataTypes2.STRING(100),
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes2.DATE,
      allowNull: false,
      defaultValue: DataTypes2.NOW
    },
    updatedAt: {
      type: DataTypes2.DATE,
      allowNull: false,
      defaultValue: DataTypes2.NOW
    }
  },
  {
    sequelize,
    tableName: "categories",
    modelName: "Category",
    timestamps: true
  }
);

// src/model/product.model.ts
var Product = class extends Model3 {
  id;
  productName;
  productPrice;
  description;
  sku;
  cat_id;
  productUnit;
  productStock;
  productStatus;
  productRating;
  productImage;
  createdAt;
  updatedAt;
};
Product.init(
  {
    id: {
      type: DataTypes3.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    productName: {
      type: DataTypes3.STRING(200),
      allowNull: false
    },
    productPrice: {
      type: DataTypes3.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes3.TEXT,
      allowNull: true
    },
    sku: {
      type: DataTypes3.STRING(100),
      allowNull: true,
      unique: true
    },
    cat_id: {
      type: DataTypes3.INTEGER.UNSIGNED,
      allowNull: false
    },
    productUnit: {
      type: DataTypes3.STRING(50),
      allowNull: false,
      defaultValue: "pcs"
    },
    productStock: {
      type: DataTypes3.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    productStatus: {
      //type: DataTypes.INTEGER,
      type: DataTypes3.STRING(20),
      allowNull: true,
      //defaultValue: 1, // 1 for active, 0 for inactive
      defaultValue: "active"
    },
    productRating: {
      type: DataTypes3.DECIMAL(3, 2),
      validate: { min: 0, max: 5 },
      allowNull: true,
      defaultValue: 0
    },
    productImage: {
      type: DataTypes3.STRING(500),
      allowNull: true
    },
    createdAt: {
      type: DataTypes3.DATE,
      allowNull: false,
      defaultValue: DataTypes3.NOW
    },
    updatedAt: {
      type: DataTypes3.DATE,
      allowNull: false,
      defaultValue: DataTypes3.NOW
    }
  },
  {
    sequelize,
    tableName: "product",
    modelName: "Product",
    timestamps: true
  }
);
Product.belongsTo(Category, { foreignKey: "cat_id", targetKey: "id" });
Category.hasMany(Product, { foreignKey: "cat_id", sourceKey: "id" });

// src/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
  // Click 'View API Keys' above to copy your API secret
});
var cloudinary_default = cloudinary;

// src/controller/productController.ts
var createProduct = async (req, res) => {
  try {
    const { productName, productPrice, description, sku, cat_id, productUnit, productStock, productStatus, productRating } = req.body;
    if (!req.file) {
      return res.status(400).json({ status: "failed", message: "file unavailable" });
    }
    console.log(req.file);
    const fileBuffer = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary_default.uploader.upload(fileBuffer, {
      folder: "uploads",
      public_id: `PIMG_${Date.now()}`,
      //~ optional
      overwrite: true
    });
    console.log("file resullt", result);
    console.log("Product data before insert:", {
      productName,
      productPrice,
      description,
      sku,
      cat_id,
      productUnit,
      productStock,
      productStatus,
      productRating,
      productImage: result.secure_url
    });
    const product = await Product.create({
      productName,
      productPrice,
      description,
      sku,
      cat_id,
      productUnit,
      productStock,
      productStatus,
      productRating,
      productImage: result.secure_url
    });
    await redis_default.del("products");
    console.log("Product successfully created:", product);
    return res.status(201).json({ status: "Success", message: "Product Added Successfully", data: product });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    console.error("SQL ERROR:", error.original);
    console.error("VALIDATION ERROR:", error.errors);
    return res.status(500).json({
      status: "failed",
      message: "Failed to Add New Product",
      error: error.message,
      details: error.original?.sqlMessage || null
    });
  }
};
var getProduct = async (req, res) => {
  try {
    if (await redis_default.get(`products`)) {
      const cachedProducts = await redis_default.get(`products`);
      if (cachedProducts) {
        const products = JSON.parse(cachedProducts);
        return res.json({ status: "success", message: "products Found Successfully", data: { total: products.length, items: products, count: products.length } });
      }
    }
    const page = parseInt(req.query.page || "1", 10);
    const search = req.query.search || void 0;
    const limit = 100;
    const offset = (page - 1) * limit;
    const where = {};
    if (search)
      where.productName = { [Op.like]: `%${search}%` };
    const result = await Product.findAndCountAll({ where, limit, offset });
    redis_default.setEx(`products`, 3600, JSON.stringify(result.rows));
    if (result.rows.length === 0) {
      return res.status(500).json({ status: "failed", message: "Product Not available" });
    }
    return res.json({ status: "success", message: "products Found Successfully", data: { total: result.count, items: result.rows, count: result.rows.length } });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: "unable to find Products", error });
  }
};
var getProductByid = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(501).json({ satus: "failed", message: "Product Not Found" });
    }
    return res.status(201).json({ status: "success", message: "Product Found", data: product });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: "Unable to fetch product details" });
  }
};
var updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, productPrice, description, sku, cat_id } = req.body;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(500).json({ status: "failed", message: "product not found" });
    }
    if (!req.file) {
      return res.status(400).json({ status: "failed", message: "file unavailable" });
    }
    console.log(req.file);
    const fileBuffer = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary_default.uploader.upload(fileBuffer, {
      folder: "uploads",
      public_id: `PIMG_${Date.now()}`,
      // optional 
      overwrite: true
    });
    const productImage = result.secure_url;
    console.log(productImage);
    const updatedProduct = await product.update({
      productName,
      productPrice,
      description,
      sku,
      productImage
    });
    console.log(updatedProduct);
    return res.status(201).json({ status: "success", message: "Product Updated successfully", data: updatedProduct });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: "unable to update", error });
  }
};
var removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(500).json({ status: "failed", message: "product not found" });
    }
    const product_details = product.toJSON();
    const fileName = product_details?.productImage?.split("/").pop()?.split(".")[0];
    console.log(fileName);
    const result = await cloudinary_default.uploader.destroy(`uploads/${fileName?.trim()}`);
    console.log(result);
    const deletedProduct = product.destroy();
    return res.status(200).json({ status: "product deleted successfuly", deletedProduct });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: "Unable to delete Producct", error });
  }
};
var getProductBycatId = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.findAndCountAll({
      include: [{
        model: Category,
        attributes: ["id", "catName", "catDesc", "catSlug"],
        required: true,
        // ✅ INNER JOIN
        where: {
          id
          // match category id
        }
      }],
      attributes: ["id", "productName", "productPrice", "description", "sku", "productImage"]
    });
    if (!products) {
      return res.status(501).json({ satus: "failed", message: "Product Not Found" });
    }
    return res.status(201).json({ status: "success", message: "Product Found", data: products.rows });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: "Unable to fetch product details" });
  }
};

// src/routes/productrouter.ts
import multer2 from "multer";
var cloud = multer2({
  storage: multer2.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }
  // 3MB
});
var productRouter = Router();
productRouter.get("/allproducts", getProduct);
productRouter.get("/getbyid", getProductByid);
productRouter.post("/add", cloud.single("image"), createProduct);
productRouter.put("/update/:id", updateProduct);
productRouter.delete("/remove/:id", removeProduct);
productRouter.get("/getbycategory/:id", getProductBycatId);
var productrouter_default = productRouter;

// src/middleware/performance.ts
import compression from "compression";
var applyPerformance = (app2) => {
  app2.use(compression({
    level: 6,
    // balanced CPU vs size
    threshold: 1024
    // only compress > 1K
  }));
};

// src/routes/cartrouter.ts
import express2 from "express";

// src/middleware/authcheck.ts
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "failed", message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  console.log(token);
  const blacklisted = await redis_default.get(`bl:${token}`);
  if (blacklisted) {
    return res.status(401).json({ status: "failed", message: "Token revoked" });
  }
  try {
    const decoded = verifyJwt(token);
    if (!decoded) {
      return res.status(401).json({ status: "failed", message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error", err);
    return res.status(500).json({ status: "failed", message: "Internal server error" });
  }
};

// src/model/cart.model.ts
import { Model as Model4, DataTypes as DataTypes4 } from "sequelize";
var Cart = class extends Model4 {
  id;
  userId;
  productId;
  quantity;
  createdAt;
  updatedAt;
  product;
  // Include product details in cart response
};
Cart.init(
  {
    id: {
      type: DataTypes4.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes4.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id"
      }
    },
    productId: {
      type: DataTypes4.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Product,
        key: "id"
      }
    },
    quantity: {
      type: DataTypes4.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    createdAt: {
      type: DataTypes4.DATE,
      allowNull: false,
      defaultValue: DataTypes4.NOW
    },
    updatedAt: {
      type: DataTypes4.DATE,
      allowNull: false,
      defaultValue: DataTypes4.NOW
    }
  },
  {
    sequelize,
    tableName: "carts",
    modelName: "cart",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"]
      },
      {
        fields: ["productId"]
      },
      {
        fields: ["userId", "productId"],
        unique: true
      }
    ]
  }
);
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });
Cart.belongsTo(Product, { foreignKey: "productId", as: "product" });
var cart_model_default = Cart;

// src/controller/cartController.ts
var addTocart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;
    console.log("Authenticated user:", req.user);
    console.log("User ID:", req.user?.id);
    if (!productId || !quantity || !userId) {
      return res.status(400).json({ message: "productId, quantity and UserId required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity Must be Atleast 1" });
    }
    const user = await User.findByPk(userId);
    console.log("User query result:", user);
    console.log("User JSON:", user?.toJSON());
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(400).json({ message: "Product Not Found" });
    }
    let cartItem = await cart_model_default.findOne({ where: { userId, productId }, raw: true });
    if (cartItem) {
      await cart_model_default.update({ quantity: cartItem.quantity + Number(quantity) }, { where: { id: cartItem.id } });
    } else {
      cartItem = await cart_model_default.create({
        userId,
        productId,
        quantity
      });
    }
    const updatedCartItem = await cart_model_default.findByPk(cartItem.id, {
      include: [{ model: Product, as: "product", required: true }]
    });
    if (!updatedCartItem) {
      return res.status(400).json({ message: "Unable to add Item" });
    }
    return res.status(201).json({ status: "success", message: "Item added successfully", data: updatedCartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var getCartItems = async (req, res) => {
  try {
    const userId = await req.user?.id;
    if (!userId) {
      return res.status(400).json({ Message: "User Id required" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    const cartItems = await cart_model_default.findAll({
      attributes: ["id", "quantity", "createdAt", "updatedAt"],
      include: [{
        model: Product,
        as: "product",
        required: true,
        attributes: ["id", "productName", "productPrice", "productImage"]
      }]
    });
    const cartJson = cartItems.map((item) => item.get({ plain: true }));
    let cartTotal = 0;
    const itemsWithTotal = cartJson.map((item) => {
      const itemTotal = Number(item.product.productPrice) * item.quantity;
      cartTotal += itemTotal;
      return { ...item, totalPrice: itemTotal };
    });
    res.status(200).json({
      success: true,
      message: "Cart items retrieved successfully",
      cartTotal,
      itemCount: cartItems.length,
      data: itemsWithTotal
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Cart item ID is required" });
    }
    if (!action || !["increment", "decrement"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'increment' or 'decrement'" });
    }
    const cartItem = await cart_model_default.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }
    console.log("Action:", action);
    console.log("dataValues.quantity:", cartItem.dataValues.quantity);
    const currentQuantity = Number(
      cartItem.get("quantity")
    );
    const newQuantity = action === "increment" ? currentQuantity + 1 : currentQuantity - 1;
    console.log("New:", newQuantity);
    if (newQuantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }
    await cart_model_default.update(
      { quantity: 1 },
      {
        where: {
          quantity: 0
        }
      }
    );
    await cart_model_default.update({ quantity: newQuantity }, { where: { id } });
    const updatedCartItem = await cart_model_default.findByPk(id, {
      include: [{ model: Product, as: "product" }]
    });
    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: updatedCartItem
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Cart item ID is required" });
      return;
    }
    const cartItem = await cart_model_default.findByPk(id);
    if (!cartItem) {
      res.status(404).json({ success: false, message: "Cart item not found" });
      return;
    }
    await cart_model_default.destroy({ where: { id } });
    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully"
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    const deletedCount = await cart_model_default.destroy({ where: { userId } });
    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { deletedCount }
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var getCartCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }
    ;
    const count = await cart_model_default.count({ where: { userId } });
    res.status(200).json({
      success: true,
      message: "Cart count retrieved successfully",
      data: { count }
    });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// src/routes/cartrouter.ts
var cartRouter = express2.Router();
cartRouter.post("/add", requireAuth, addTocart);
cartRouter.get("/", requireAuth, getCartItems);
cartRouter.get("/count/:userId", requireAuth, getCartCount);
cartRouter.put("/:id", requireAuth, updateCartItem);
cartRouter.delete("/:id", requireAuth, removeFromCart);
cartRouter.delete("/clear/:userId", requireAuth, clearCart);
var cartrouter_default = cartRouter;

// src/routes/category.router.ts
import express3 from "express";

// src/controller/categoryController.ts
var createCategory = async (req, res) => {
  try {
    const { catName, catDesc, catSlug } = req.body;
    if (!catName || !catSlug) {
      res.status(400).json({
        success: false,
        message: "Category name and slug are required"
      });
      return;
    }
    const existingCategory = await Category.findOne({ where: { catSlug } });
    if (existingCategory) {
      res.status(409).json({ success: false, message: "Category slug already exists" });
      return;
    }
    const category = await Category.create({
      catName,
      catDesc,
      catSlug
    });
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
};
var getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Category ID is required" });
      return;
    }
    const category = await Category.findByPk(id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { catSlug, catName, catDesc } = req.body;
    if (!id) {
      res.status(400).json({ success: false, message: "Category ID is required" });
      return;
    }
    const category = await Category.findByPk(id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    if (catSlug && catSlug !== category.catSlug) {
      const existingCategory = await Category.findOne({
        where: { catSlug }
      });
      if (existingCategory) {
        res.status(409).json({
          success: false,
          message: "Category slug already exists"
        });
        return;
      }
    }
    await category.update({
      catName: catName || category.catName,
      catDesc: catDesc || category.catDesc,
      catSlug: catSlug || category.catSlug
    });
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Category ID is required" });
      return;
    }
    const category = await Category.findByPk(id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    await category.destroy();
    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// src/routes/category.router.ts
var categoryRouter = express3.Router();
categoryRouter.post("/", createCategoryValidation, createCategory);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.put("/:id", updateCategoryValidation, updateCategory);
var category_router_default = categoryRouter;

// src/routes/OrderRouter.ts
import express4 from "express";

// src/controller/OrderController.ts
import { v4 as uuidv4 } from "uuid";

// src/model/orderdeatils.model.ts
import { DataTypes as DataTypes5, Model as Model5 } from "sequelize";
var OrderDetails = class extends Model5 {
  id;
  orderId;
  productId;
  quantity;
  unitPrice;
  totalPrice;
  productName;
  productSku;
  createdAt;
  updatedAt;
};
OrderDetails.init(
  {
    id: {
      type: DataTypes5.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes5.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "orders",
        key: "id"
      }
    },
    productId: {
      type: DataTypes5.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "product",
        key: "id"
      }
    },
    quantity: {
      type: DataTypes5.INTEGER.UNSIGNED,
      allowNull: false
    },
    unitPrice: {
      type: DataTypes5.DECIMAL(10, 2),
      allowNull: false
    },
    totalPrice: {
      type: DataTypes5.DECIMAL(10, 2),
      allowNull: false
    },
    productName: {
      type: DataTypes5.STRING(200),
      allowNull: false
    },
    productSku: {
      type: DataTypes5.STRING(100),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "order_details",
    timestamps: true
  }
);
OrderDetails.belongsTo(Product, { foreignKey: "productId", as: "product" });

// src/model/order.model.ts
import { DataTypes as DataTypes6, Model as Model6 } from "sequelize";
var Order = class extends Model6 {
  id;
  userId;
  orderNumber;
  totalAmount;
  totalItems;
  totalDiscount;
  status;
  shippingAddress;
  city;
  state;
  zipCode;
  country;
  phoneNumber;
  paymentMethod;
  paymentStatus;
  notes;
  createdAt;
  updatedAt;
};
Order.init(
  {
    id: {
      type: DataTypes6.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes6.INTEGER.UNSIGNED,
      allowNull: false
    },
    orderNumber: {
      type: DataTypes6.STRING(50),
      allowNull: false,
      unique: true
    },
    totalAmount: {
      type: DataTypes6.DECIMAL(10, 2),
      allowNull: false
    },
    totalItems: {
      type: DataTypes6.INTEGER.UNSIGNED,
      allowNull: false
    },
    totalDiscount: {
      type: DataTypes6.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes6.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending"
    },
    shippingAddress: {
      type: DataTypes6.STRING(255),
      allowNull: false
    },
    city: {
      type: DataTypes6.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes6.STRING(100),
      allowNull: false
    },
    zipCode: {
      type: DataTypes6.STRING(20),
      allowNull: false
    },
    country: {
      type: DataTypes6.STRING(100),
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes6.STRING(20),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes6.STRING(50),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes6.ENUM("pending", "completed", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending"
    },
    notes: {
      type: DataTypes6.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true
  }
);
Order.belongsTo(User, { foreignKey: "userId", as: "user", targetKey: "id" });
Order.hasMany(OrderDetails, { foreignKey: "orderId", as: "orderDetails", sourceKey: "id" });

// src/utils/generateInvoice.ts
import PDFDocument from "pdfkit";
var generateInvoice = (res, order, items) => {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order.id}.pdf`
  );
  doc.pipe(res);
  doc.fontSize(18).text(`Invoice #${order.orderNumber}`);
  doc.moveDown();
  doc.text(`Customer ID: ${order.userId}`);
  doc.text(`Phone: ${order.phoneNumber}`);
  doc.text(`Payment: ${order.paymentMethod}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();
  doc.text(`Address: ${order.shippingAddress}`);
  doc.text(`${order.city}, ${order.state} - ${order.zipCode}`);
  doc.text(`${order.country}`);
  doc.moveDown();
  doc.text("Items:");
  doc.moveDown();
  items.forEach((item, i) => {
    doc.text(
      `${i + 1}. ${item.productName} | Qty: ${item.quantity} | Price: \u20B9${item.unitPrice} | Total: \u20B9${item.totalPrice}`
    );
  });
  doc.moveDown();
  doc.text(`Total Items: ${order.totalItems}`);
  doc.text(`Discount: \u20B9${order.totalDiscount || 0}`);
  doc.text(`Total Amount: \u20B9${order.totalAmount}`);
  doc.end();
};

// src/controller/OrderController.ts
async function createOrder(req, res) {
  try {
    const { shippingAddress, city, state, zipCode, country, PhoneNumber, notes, orderPaymentMode, orderCouponCode } = req.body;
    const UserId = req.user?.id;
    if (!UserId) {
      return res.status(401).json({ status: "failed", message: "Unauthorized - user not Found" });
    }
    const cartItems = await cart_model_default.findAll({
      where: { userId: UserId },
      include: {
        model: Product,
        as: "product"
      }
    });
    const count = await cart_model_default.count({ where: { userId: UserId } });
    const TotalItems = count || 0;
    const OrderItems = cartItems.map((item) => item.toJSON());
    console.log("userId::::::", UserId, "OrderItems::::::", OrderItems);
    if (!OrderItems || OrderItems.length === 0) {
      return res.status(400).json({ status: "failed", message: "No items in cart" });
    }
    let totalAmount = 0;
    OrderItems.forEach((item) => {
      const price = item.product?.productPrice || 0;
      const quantity = item.quantity || 0;
      totalAmount += price * quantity;
    });
    const order_tax_amount = totalAmount * 18 / 100;
    const order_total_amount_with_tax = totalAmount + order_tax_amount;
    let order_discount_amount = 0;
    if (orderCouponCode === "DISCOUNT10") {
      console.log(orderCouponCode);
      order_discount_amount = order_total_amount_with_tax * 0.1;
    }
    const paymentMode = (orderPaymentMode || "COD").toUpperCase();
    const order_txn_id = paymentMode === "COD" ? "COD-" + uuidv4() : "PAY-" + uuidv4();
    const order_status = paymentMode === "COD" ? "confirmed" : "pending";
    const payload = {
      userId: UserId,
      orderNumber: order_txn_id,
      totalAmount,
      totalItems: TotalItems,
      totalDiscount: order_discount_amount,
      shippingAddress,
      city,
      state,
      zipCode,
      country,
      phoneNumber: PhoneNumber,
      paymentMethod: paymentMode,
      status: order_status,
      notes: notes || null
    };
    console.log("Order Payload::::::", payload);
    const newOrder = await Order.create(payload);
    const orderDetailsData = OrderItems.map((item) => {
      const price = Number(item.product?.productPrice) || 0;
      const qty = Number(item.quantity) || 0;
      return {
        orderId: newOrder.id,
        productId: item.productId,
        productName: item.product?.productName || "Unknown Product",
        productSku: item.product?.sku || "SKU-" + item.productId,
        quantity: qty,
        unitPrice: price,
        totalPrice: price * qty
      };
    });
    await OrderDetails.bulkCreate(orderDetailsData);
    await cart_model_default.destroy({ where: { userId: UserId } });
    return generateInvoice(res, newOrder.toJSON(), orderDetailsData);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}

// src/routes/OrderRouter.ts
var orderRouter = express4.Router();
orderRouter.post("/", requireAuth, createOrder);
var OrderRouter_default = orderRouter;

// src/routes/paymentRouter.ts
import express5 from "express";

// src/controller/payment.controller.ts
import Razorpay from "razorpay";
import crypto from "crypto";
var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
async function createPaymentOrder(req, res) {
  try {
    const userId = req.user.id;
    const totalInRupees = 1500;
    if (!Number.isFinite(totalInRupees) || totalInRupees <= 0) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid payment amount"
      });
    }
    const amountInPaise = Math.round(totalInRupees * 100);
    const paymentOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `user_${userId}_${Date.now()}`
    });
    return res.status(201).json({
      status: "success",
      data: {
        razorpayOrderId: paymentOrder.id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error("Payment order creation failed:", error);
    return res.status(500).json({
      status: "failed",
      message: "Could not initiate payment"
    });
  }
}
async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        status: "failed",
        message: "Missing payment details"
      });
    }
    const expectedSignature = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    ).update(
      `${razorpay_order_id}|${razorpay_payment_id}`
    ).digest();
    const receivedSignature = Buffer.from(
      razorpay_signature,
      "hex"
    );
    const valid = receivedSignature.length === expectedSignature.length && crypto.timingSafeEqual(
      expectedSignature,
      receivedSignature
    );
    if (!valid) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid payment signature"
      });
    }
    return res.json({
      status: "success",
      message: "Payment signature verified"
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({
      status: "failed",
      message: "Payment verification failed"
    });
  }
}

// src/routes/paymentRouter.ts
var paymentRouter = express5.Router();
paymentRouter.post("/create-order", requireAuth, createPaymentOrder);
paymentRouter.post("/verify-payment", requireAuth, verifyPayment);
var paymentRouter_default = paymentRouter;

// src/routes/checkout.routes.ts
import { Router as Router2 } from "express";

// src/controller/checkoutController.ts
import crypto2 from "crypto";
import Razorpay2 from "razorpay";
import { Op as Op2 } from "sequelize";

// src/model/payment.model.ts
import { DataTypes as DataTypes7, Model as Model7 } from "sequelize";
var Payment = class extends Model7 {
  id;
  orderId;
  provider;
  providerOrderId;
  providerPaymentId;
  amount;
  currency;
  status;
  signature;
  createdAt;
  updatedAt;
};
Payment.init(
  {
    id: {
      type: DataTypes7.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes7.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "orders",
        key: "id"
      }
    },
    provider: {
      type: DataTypes7.STRING(30),
      allowNull: false,
      defaultValue: "razorpay"
    },
    providerOrderId: {
      type: DataTypes7.STRING(100),
      allowNull: false,
      unique: true
    },
    providerPaymentId: {
      type: DataTypes7.STRING(100),
      allowNull: true,
      unique: true
    },
    amount: {
      type: DataTypes7.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes7.STRING(3),
      allowNull: false,
      defaultValue: "INR"
    },
    status: {
      type: DataTypes7.ENUM(
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded"
      ),
      allowNull: false,
      defaultValue: "created"
    },
    signature: {
      type: DataTypes7.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "payments",
    timestamps: true
  }
);
Payment.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order"
});
Order.hasMany(Payment, {
  foreignKey: "orderId",
  as: "payments"
});
var payment_model_default = Payment;

// src/controller/checkoutController.ts
var razorpay2 = new Razorpay2({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
var getUserId = (req) => {
  const user = req.user;
  const id = Number(user?.id ?? user?.userId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid user ID in authentication token");
  }
  return id;
};
var validateAddress = (body2) => {
  const fields = [
    "shippingAddress",
    "city",
    "state",
    "zipCode",
    "country",
    "phoneNumber"
  ];
  for (const field of fields) {
    if (typeof body2[field] !== "string" || body2[field].trim().length === 0) {
      throw new Error(`${field} is required`);
    }
  }
};
var createPendingOrder = async (userId, body2, transaction) => {
  const cartItems = await Cart.findAll({
    where: { userId },
    include: [{ model: Product, as: "product" }],
    transaction,
    order: [["id", "ASC"]]
  });
  if (cartItems.length === 0) {
    throw new Error("Your cart is empty");
  }
  let totalAmount = 0;
  let totalItems = 0;
  const items = cartItems.map((cart) => {
    const product = cart.product;
    if (!product) {
      throw new Error(`Product ${cart.productId} was not found`);
    }
    if (product.productStatus && !["active", "1"].includes(
      String(product.productStatus).toLowerCase()
    )) {
      throw new Error(`${product.productName} is not available`);
    }
    if (cart.quantity < 1) {
      throw new Error("Invalid cart quantity");
    }
    if (product.productStock != null && product.productStock < cart.quantity) {
      throw new Error(`Insufficient stock for ${product.productName}`);
    }
    const unitPrice = Number(product.productPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid price for ${product.productName}`);
    }
    const lineTotal = Math.round(unitPrice * 100) * cart.quantity;
    totalAmount += lineTotal;
    totalItems += cart.quantity;
    return {
      productId: product.id,
      quantity: cart.quantity,
      unitPrice,
      totalPrice: lineTotal / 100,
      productName: product.productName,
      productSku: product.sku ?? ""
    };
  });
  const orderNumber = `ORD-${Date.now()}-${crypto2.randomBytes(3).toString("hex").toUpperCase()}`;
  const order = await Order.create(
    {
      userId,
      orderNumber,
      totalAmount: totalAmount / 100,
      totalItems,
      totalDiscount: 0,
      status: "pending",
      shippingAddress: body2.shippingAddress.trim(),
      city: body2.city.trim(),
      state: body2.state.trim(),
      zipCode: body2.zipCode.trim(),
      country: body2.country.trim(),
      phoneNumber: body2.phoneNumber.trim(),
      paymentMethod: body2.paymentMethod,
      paymentStatus: "pending",
      notes: body2.notes?.trim() || void 0
    },
    { transaction }
  );
  await OrderDetails.bulkCreate(
    items.map((item) => ({
      orderId: order.id,
      ...item
    })),
    { transaction }
  );
  return { order, items, totalAmount };
};
var createRazorpayOrder = async (req, res) => {
  let order;
  try {
    const userId = getUserId(req);
    validateAddress(req.body);
    const result = await sequelize.transaction(async (transaction) => {
      const created = await createPendingOrder(
        userId,
        { ...req.body, paymentMethod: "razorpay" },
        transaction
      );
      return created;
    });
    order = result.order;
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);
    const razorpayOrder = await razorpay2.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: String(order.id),
        orderNumber: order.orderNumber,
        userId: String(userId)
      }
    });
    await payment_model_default.create({
      orderId: order.id,
      provider: "razorpay",
      providerOrderId: razorpayOrder.id,
      amount: Number(order.totalAmount),
      currency: "INR",
      status: "created"
    });
    return res.status(201).json({
      status: "success",
      message: "Checkout order created",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: amountInPaise,
        currency: "INR",
        razorpayOrderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    if (order) {
      await order.update({ status: "cancelled" }).catch(console.error);
    }
    return res.status(400).json({
      status: "failed",
      message: error.message || "Could not create checkout order"
    });
  }
};
var verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        status: "failed",
        message: "Missing Razorpay payment verification fields"
      });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("Razorpay secret is not configured");
    }
    const expectedSignature = crypto2.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const supplied = Buffer.from(String(razorpay_signature), "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");
    if (supplied.length !== expected.length || !crypto2.timingSafeEqual(supplied, expected)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid payment signature"
      });
    }
    const paymentRecord = await payment_model_default.findOne({
      where: { providerOrderId: razorpay_order_id },
      include: [
        {
          model: Order,
          as: "order"
        }
      ]
    });
    if (!paymentRecord) {
      return res.status(404).json({
        status: "failed",
        message: "Payment record not found"
      });
    }
    const order = await Order.findByPk(paymentRecord.orderId);
    if (!order || order.userId !== userId) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found"
      });
    }
    if (paymentRecord.status === "captured" && paymentRecord.providerPaymentId === razorpay_payment_id && order.paymentStatus === "completed") {
      return res.json({
        status: "success",
        message: "Payment already verified",
        data: { orderId: order.id, orderNumber: order.orderNumber }
      });
    }
    const gatewayPayment = await razorpay2.payments.fetch(
      razorpay_payment_id
    );
    if (gatewayPayment.order_id !== razorpay_order_id || Number(gatewayPayment.amount) !== Math.round(Number(paymentRecord.amount) * 100) || gatewayPayment.currency !== "INR" || gatewayPayment.status !== "captured") {
      return res.status(400).json({
        status: "failed",
        message: "Payment is not captured or does not match this order. Ensure automatic capture is configured in Razorpay."
      });
    }
    await sequelize.transaction(async (transaction) => {
      const lockedOrder = await Order.findByPk(order.id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      const lockedPayment = await payment_model_default.findByPk(paymentRecord.id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!lockedOrder || !lockedPayment) {
        throw new Error("Order or payment record not found");
      }
      if (lockedOrder.paymentStatus === "completed") {
        if (lockedPayment.providerPaymentId !== razorpay_payment_id) {
          throw new Error("Order has already been paid with another payment");
        }
        return;
      }
      const details = await OrderDetails.findAll({
        where: { orderId: lockedOrder.id },
        transaction
      });
      for (const detail of details) {
        const product = await Product.findByPk(detail.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        if (!product) {
          throw new Error(`Product ${detail.productId} no longer exists`);
        }
        if (product.productStock != null && product.productStock < detail.quantity) {
          throw new Error(
            `Insufficient stock for ${product.productName}. Contact support about your captured payment.`
          );
        }
        if (product.productStock != null) {
          await product.update(
            {
              productStock: product.productStock - detail.quantity
            },
            { transaction }
          );
        }
      }
      await lockedPayment.update(
        {
          providerPaymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: "captured"
        },
        { transaction }
      );
      await lockedOrder.update(
        {
          paymentStatus: "completed",
          status: "confirmed"
        },
        { transaction }
      );
      const purchasedProductIds = details.map((item) => item.productId);
      await Cart.destroy({
        where: {
          userId,
          productId: { [Op2.in]: purchasedProductIds }
        },
        transaction
      });
    });
    return res.json({
      status: "success",
      message: "Payment verified and order confirmed",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentId: razorpay_payment_id
      }
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    return res.status(500).json({
      status: "failed",
      message: error.message || "Payment verification failed"
    });
  }
};
var createCodOrder = async (req, res) => {
  try {
    const userId = getUserId(req);
    validateAddress(req.body);
    const result = await sequelize.transaction(async (transaction) => {
      const created = await createPendingOrder(
        userId,
        { ...req.body, paymentMethod: "cod" },
        transaction
      );
      for (const item of created.items) {
        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        if (!product) {
          throw new Error(`Product ${item.productId} no longer exists`);
        }
        if (product.productStock != null && product.productStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }
        if (product.productStock != null) {
          await product.update(
            {
              productStock: product.productStock - item.quantity
            },
            { transaction }
          );
        }
      }
      await created.order.update(
        {
          status: "confirmed",
          paymentStatus: "pending"
        },
        { transaction }
      );
      await Cart.destroy({
        where: { userId },
        transaction
      });
      return created;
    });
    return res.status(201).json({
      status: "success",
      message: "Cash on Delivery order placed",
      data: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        totalAmount: result.order.totalAmount,
        paymentMethod: "cod",
        paymentStatus: "pending"
      }
    });
  } catch (error) {
    console.error("Create COD order error:", error);
    return res.status(400).json({
      status: "failed",
      message: error.message || "Could not place COD order"
    });
  }
};

// src/routes/checkout.routes.ts
var router = Router2();
router.post("/razorpay/order", requireAuth, createRazorpayOrder);
router.post("/razorpay/verify", requireAuth, verifyRazorpayPayment);
router.post("/cod", requireAuth, createCodOrder);
var checkout_routes_default = router;

// src/app.ts
import path from "path";
import { fileURLToPath } from "url";
var app = express6();
app.use(express6.json({ limit: "1024kb" }));
app.use(express6.urlencoded({ extended: true, limit: "1024kb" }));
applyPerformance(app);
applySecurity(app);
app.use("/api/v1/auth", authrouter_default);
app.use("/api/v1/product", productrouter_default);
app.use("/api/v1/cart", cartrouter_default);
app.use("/api/v1/category", category_router_default);
app.use("/api/v1/order", OrderRouter_default);
app.use("/api/v1/payment", paymentRouter_default);
app.use("/api/v1/checkout", checkout_routes_default);
var app_default = app;
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
app.use(express6.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(9e3, () => {
  console.log("Server running on port 9000");
});

// src/index.ts
import process2 from "process";
var PORT = process2.env.PORT;
(async () => {
  const server = http.createServer(app_default);
  await connectRedis();
  server.listen(PORT, function() {
    console.log(`Server started at http://localhost:${PORT}`);
  });
})();
async function testDB() {
  try {
    await sequelize.authenticate();
    console.log("\u2705 Database connection successful!");
    const alter = process2.env.NODE_ENV === "production" ? false : true;
    await sequelize.sync({ alter: false });
    console.log("\u2705 Models synced");
  } catch (error) {
    console.error("\u274C Unable to connect to the database:", error);
  }
}
testDB();
//# sourceMappingURL=index.js.map