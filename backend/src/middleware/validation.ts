import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const validateUserRegistration: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('role')
    .optional()
    .isIn(['customer', 'vendor', 'admin'])
    .withMessage('Invalid role')
];

export const validateUserLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateProduct: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Product name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Valid price is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be non-negative'),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Valid category ID is required')
];

export const validateOrder: ValidationChain[] = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Valid unit price is required'),
  body('shipping_address')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shipping_address.street')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Street address is required'),
  body('shipping_address.city')
    .trim()
    .isLength({ min: 1 })
    .withMessage('City is required'),
  body('shipping_address.country')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Country is required')
];
