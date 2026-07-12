import { Op } from "sequelize";
import { Product } from "../model/product.model"
import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { Category } from "../model/category.model";
import redisClient from "../config/redis";


export const createProduct = async (req: Request, res: Response) => {
    try {
        const { productName, productPrice, description, sku, cat_id, productUnit, productStock, productStatus, productRating, image } = req.body;
        // if (!req.file ) {
        //     return res.status(400).json({ status: "failed", message: "file unavailable" })
        // }
        // console.log(req.file);
        // const fileBuffer = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(image, {
            folder: "uploads",
            public_id: `PIMG_${Date.now()}`, //~ optional
            overwrite: true,
        });
        console.log(result)

        // Transform the image: auto-crop to square aspect_ratio
        // const finalUrl = cloudinary.url(result.public_id, {
        //      fetch_format: 'auto',
        //     quality: 'auto',
        //     crop: 'auto',
        //     gravity: 'auto',
        //     width: 500, 
        //     height: 500,
        // });
        // console.log(finalUrl);    


        const product = await Product.create({
            productName,
            productPrice,
            description,
            sku,
            cat_id: cat_id,
            productUnit,
            productStock,
            productStatus,
            productRating,
            productImage: result.secure_url 
            // productImage:finalUrl
        })

        return res.status(201).json({ status: "Success", message: "Product Added Successfully", data: product })
    }

    catch (error) {
        return res.status(500).json({ status: "failed", message: "Failed to Add New Product", error })
    }
}

export const getProduct = async (req: Request, res: Response) => {
    try {
        if(await redisClient.get(`products`)){
            const cachedProducts = await redisClient.get(`products`);
            if (cachedProducts) {
                const products = JSON.parse(cachedProducts);
                return res.json({ status: 'success', message: "products Found Successfully", data: { total: products.length, items: products, count: products.length } });
            }
        }
        const page = parseInt((req.query.page as string) || '1', 10);
        const search = (req.query.search as string) || undefined;
        //console.log("current pages ",page);
        const limit = 100;
        const offset = (page - 1) * limit;
        //const product = await Product.findAll();
        const where: any = {}
        // where.id =  {[Op.gt]:1}
        if (search)
            where.productName = { [Op.like]: `%${search}%` };
        const result = await Product.findAndCountAll({ where, limit, offset });
        //  console.log(result)
        redisClient.setEx(`products`, 3600, JSON.stringify(result.rows));
        if (result.rows.length === 0) {
            return res.status(500).json({ status: "failed", message: "Product Not available" })
        }
        return res.json({ status: 'success', message: "products Found Successfully", data: { total: result.count, items: result.rows, count: result.rows.length } });
    }
    catch (error) {
        return res.status(500).json({ status: "failed", message: "unable to find Products", error })
    }
}

export const getProductByid = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const product = await Product.findByPk(id)
        if (!product) {
            return res.status(501).json({ satus: "failed", message: "Product Not Found" })
        }

        return res.status(201).json({ status: "success", message: "Product Found", data: product })
    }
    catch (error) {
        return res.status(500).json({ status: "failed", message: "Unable to fetch product details" })
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { productName, productPrice, description, sku, cat_id } = req.body
        const product = await Product.findByPk(id)
        if (!product) {
            return res.status(500).json({ status: "failed", message: "product not found" })
        }
        if (!req.file) {
            return res.status(400).json({ status: "failed", message: "file unavailable" })
        }
        console.log(req.file);
        const fileBuffer = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(fileBuffer , {
            folder: "uploads",
            public_id: `PIMG_${Date.now()}`, // optional 
            overwrite: true,
        });

        const productImage = result.secure_url;
        console.log(productImage)
        const updatedProduct = await product.update({
            productName, productPrice, description, sku, productImage
        })
        console.log(updatedProduct)
        return res.status(201).json({ status: "success", message: "Product Updated successfully", data: updatedProduct })
    }
    catch (error) {
        return res.status(500).json({ status: "failed", message: "unable to update", error })
    }
}

export const removeProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id)

        if (!product) {
            return res.status(500).json({ status: "failed", message: "product not found" })
        }
        const product_details = product.toJSON();
        const fileName = product_details?.productImage?.split("/").pop()?.split(".")[0];
        console.log(fileName);
        const result = await cloudinary.uploader.destroy(`uploads/${fileName?.trim()}`);

        console.log(result);
        const deletedProduct = product.destroy()
        return res.status(200).json({ status: "product deleted successfuly", deletedProduct })
    }
    catch (error) {
        return res.status(500).json({ status: "failed", message: "Unable to delete Producct", error })
    }
}




export const getProductBycatId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

     //   const product = await Product.findByPk(id)
        const products = await Product.findAndCountAll({
            include: [{
                model: Category,
                attributes: ["id", "catName", "catDesc", "catSlug"],
                required: true,      // ✅ INNER JOIN
                where: {
                    id: id     // match category id
                }
            }]
            ,
            attributes: ["id", "productName", "productPrice", "description", "sku", "productImage"]
        });


        if (!products) {
            return res.status(501).json({ satus: "failed", message: "Product Not Found" })
        }

        return res.status(201).json({ status: "success", message: "Product Found", data: products.rows })
    }
    catch (error) {
        return res.status(500).json({ status: "failed", message: "Unable to fetch product details" })
    }
}
