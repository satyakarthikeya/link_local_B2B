import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token and attaches user data to the request
 */
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers?.['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication token required',
        message: 'Please provide a valid authentication token'
      });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.error('JWT verification error:', { error: err.message, token: token.substring(0, 10) + '...' });
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Token expired',
            message: 'Your session has expired. Please log in again.'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ 
            error: 'Invalid token',
            message: 'Authentication failed. Please log in again.'
          });
        }
        
        return res.status(403).json({ 
          error: 'Authentication failed',
          message: 'Please log in again.'
        });
      }
      
      if (!user.type || !user.id) {
        logger.error('Invalid token payload:', { user });
        return res.status(403).json({
          error: 'Invalid token format',
          message: 'Authentication token is malformed. Please log in again.'
        });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    if (res && typeof res.status === 'function') {
      res.status(500).json({ 
        error: 'Authentication failed',
        message: 'An unexpected error occurred. Please try again.'
      });
    } else {
      logger.error('Response object is invalid in authenticateToken middleware');
      if (typeof next === 'function') next(error);
    }
  }
}

/**
 * Middleware to check if user has a specific role
 * Uses the authenticateToken middleware first, then checks the user type
 */
function authorizeRole(roles) {
  // Handle both string and array formats for roles
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return [
    authenticateToken,
    (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.type)) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: `Access requires ${allowedRoles.join(' or ')} role`
        });
      }
      next();
    }
  ];
}

// Specific role middleware functions
const authorizeBusiness = authorizeRole('business');
const authorizeDelivery = authorizeRole('delivery');

// Middleware to allow either business or delivery user
function authorizeBusinessOrDelivery(req, res, next) {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user.type !== 'business' && req.user.type !== 'delivery') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Access requires business or delivery role' 
      });
    }
    next();
  });
}

export { 
  authenticateToken, 
  authorizeRole,
  authorizeBusiness,
  authorizeDelivery,
  authorizeBusinessOrDelivery
};