import express from "express";
import * as categoryController from "../controller/categoryController";
import { createCategoryValidation } from "../middleware/validators";
import { updateCategoryValidation } from "../middleware/validators";

const categoryRouter = express.Router();

// Define category routes here

categoryRouter.post("/", createCategoryValidation, categoryController.createCategory);
//categoryRouter.get('/search', categoryController.searchCategories);
categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/:id', categoryController.getCategoryById);
categoryRouter.delete('/:id', categoryController.deleteCategory);   
categoryRouter.put('/:id', updateCategoryValidation, categoryController.updateCategory); 

export default categoryRouter;
