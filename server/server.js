import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import validateEnv from './config/validateEnv.js';
import config from './config/appConfig.js';
import { logger, requestLogger } from './utils/logger.js';
import { handleError } from './utils/errorHandler.js';

// Validate environment variables before starting
if (!validateEnv()) {
  process.exit(1);
}

// Initialize express app
const app = express();
const PORT = config.server.port;

// Implement rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Security headers
app.use(helmet());

// Compress responses
app.use(compression());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Use the request logger
app.use(requestLogger);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: config.server.nodeEnv,
    timestamp: new Date() 
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Link Local B2B API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Use centralized error handler
app.use(handleError);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} in ${config.server.nodeEnv} mode`);
    logger.info(`API available at http://localhost:${PORT}/api`);
    logger.info(`Frontend should connect to http://localhost:${PORT}/api`);
  });
}

// Handle unexpected errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // For debugging, but in production it's better to recover
  // process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // For critical errors, shut down to prevent undefined state
  process.exit(1);
});

export default app;