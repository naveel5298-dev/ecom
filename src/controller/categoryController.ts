import { Category } from "../model/category.model";
import { NextFunction, Request, Response } from "express";
/**
 * Create a new category
 */

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { catName, catDesc, catSlug } = req.body;

        // Validation
        if (!catName || !catSlug) {
            res
                .status(400)
                .json({
                    success: false,
                    message: "Category name and slug are required",
                });
            return;
        }

        // Check if slug already exists
        const existingCategory = await Category.findOne({ where: { catSlug } });
        if (existingCategory) {
            res
                .status(409)
                .json({ success: false, message: "Category slug already exists" });
            return;
        }

        const category = await Category.create({
            catName, catDesc, catSlug
        });
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });

    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

/**
 * Get all categories
 */

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.findAll();

        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            data: categories,
        });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        next(error);
        // res.status(500).json({
        //     success: false,
        //     message: "Internal server error",
        //     error: error instanceof Error ? error.message : "Unknown error",
        // });
    }

};

/**
 * Get a single category by ID
 */

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            res
                .status(400)
                .json({ success: false, message: "Category ID is required" });
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
            data: category,
        });

    }
    catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get category by slug
 */

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            res.status(400).json({ success: false, message: "Slug is required" });
            return;
        }

        const category = await Category.findOne({ where: { catSlug: slug } });

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: category,
        });
    }

    catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Update a category
 */

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const {catSlug, catName, catDesc} = req.body;
        if (!id) {
            res
                .status(400)
                .json({ success: false, message: "Category ID is required" });
            return;
        }

        const category = await Category.findByPk(id);

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        // Check if new slug already exists (if slug is being updated)
        if (catSlug && catSlug !== category.catSlug) {
            const existingCategory = await Category.findOne({
                where: { catSlug },
            });
            if (existingCategory) {
                res.status(409).json({
                    success: false,
                    message: "Category slug already exists",
                });
                return;
            }
        }

        // Update category
        await category.update({
            catName: catName || category.catName,
            catDesc: catDesc || category.catDesc,
            catSlug: catSlug || category.catSlug,
        });

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } 
    catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Delete a category
 */
export const deleteCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res
                .status(400)
                .json({ success: false, message: "Category ID is required" });
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
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};