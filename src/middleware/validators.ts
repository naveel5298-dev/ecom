import { ValidationChain ,body} from "express-validator";

export const signupValidation:ValidationChain[] = [
     body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10,12}$/).withMessage('Phone must be 10-12 digits')
];



// Login validation middleware
export const loginValidation: ValidationChain[] = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];


export const createCategoryValidation: ValidationChain[] = [
    body('catName')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
    body('catSlug') 
        .trim()
        .notEmpty().withMessage('Category slug is required')
        .isLength({ min: 2 }).withMessage('Category slug must be at least 2 characters')
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Category slug can only contain lowercase letters, numbers, and hyphens'),
];

// Category validation - Update
export const updateCategoryValidation: ValidationChain[] = [
    body('catName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Category name must be at least 2 characters')
        .isLength({ max: 200 }).withMessage('Category name must not exceed 200 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Category name can only contain letters, spaces, hyphens, and apostrophes'),
    body('catSlug')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Category slug must be at least 2 characters')
        .isLength({ max: 100 }).withMessage('Category slug must not exceed 100 characters')
        .matches(/^[a-z0-9-]+$/).withMessage('Category slug must be lowercase alphanumeric with hyphens only'),
    body('catDesc')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Category description must not exceed 2000 characters')
];