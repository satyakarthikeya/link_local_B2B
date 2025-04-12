import Joi from 'joi';
import { ValidationError } from '../utils/errorHandler.js';

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi schema for validation
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      // Format validation errors
      const errors = error.details.reduce((acc, detail) => {
        const key = detail.path[0];
        acc[key] = detail.message.replace(/['"]/g, '');
        return acc;
      }, {});
      
      return next(new ValidationError('Validation failed', errors));
    }

    // Replace request body with validated data
    req.body = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  businessRegister: Joi.object({
    name: Joi.string().required().min(2).max(100),
    business_name: Joi.string().required().min(2).max(100),
    area: Joi.string().required(),
    street: Joi.string().required(),
    category: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    phone_no: Joi.string().pattern(/^\d{10}$/)
  }),

  deliveryRegister: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    contact_number: Joi.string().pattern(/^\d{10}$/).required(),
    area: Joi.string(),
    vehicle_type: Joi.string().required(),
    vehicle_number: Joi.string(),
    license_no: Joi.string(),
    password: Joi.string().required().min(6)
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Product schemas
  productCreate: Joi.object({
    product_name: Joi.string().required().min(2).max(100),
    price: Joi.number().required().min(0),
    quantity_available: Joi.number().min(0).default(0),
    category: Joi.string().required(),
    description: Joi.string().allow('', null),
    moq: Joi.number().integer().min(1).default(1),
    reorder_point: Joi.number().integer().min(0).default(10)
  }),

  productUpdate: Joi.object({
    product_name: Joi.string().min(2).max(100),
    price: Joi.number().min(0),
    quantity_available: Joi.number().min(0),
    category: Joi.string(),
    description: Joi.string().allow('', null),
    moq: Joi.number().integer().min(1),
    reorder_point: Joi.number().integer().min(0)
  }).min(1),

  quantityUpdate: Joi.object({
    quantity: Joi.number().required().min(0),
    operation: Joi.string().valid('add', 'subtract', 'set').default('set')
  }),

  // Order schemas
  orderCreate: Joi.object({
    supplying_businessman_id: Joi.number().required(),
    product_id: Joi.number().required(),
    quantity_requested: Joi.number().required().min(1)
  }),

  orderStatusUpdate: Joi.object({
    status: Joi.string().valid('Requested', 'Accepted', 'Rejected', 'Cancelled', 'Completed'),
    delivery_status: Joi.string().valid('Pending', 'Assigned', 'PickedUp', 'InTransit', 'Delivered', 'Failed')
  })
};

export { validateRequest, schemas };