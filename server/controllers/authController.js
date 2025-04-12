import BusinessModel from '../models/businessModel.js';
import DeliveryModel from '../models/deliveryModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Authentication controller for business users and delivery agents
const AuthController = {
  // Register a new business user
  async registerBusiness(req, res) {
    try {
      const { name, business_name, area, street, category, email, password, phone_no } = req.body;
      
      // Check if email already exists
      const existingBusiness = await BusinessModel.findByEmail(email);
      if (existingBusiness) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      
      // Create new business user
      const business = await BusinessModel.create({
        name,
        business_name,
        area,
        street,
        category,
        email,
        password,
        phone_no
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: business.businessman_id, type: 'business' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user data without password
      const { password: _, ...businessData } = business;
      
      res.status(201).json({
        message: 'Business registration successful',
        token,
        user: businessData
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      res.status(500).json({ error: 'Server error during registration' });
    }
  },
  
  // Register a new delivery agent
  async registerDelivery(req, res) {
    try {
      const { name, contact_number, vehicle_type, license_no, email, password } = req.body;
      
      // Check if email already exists
      const existingAgent = await DeliveryModel.findByEmail(email);
      if (existingAgent) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      
      // Create new delivery agent
      const agent = await DeliveryModel.create({
        name,
        contact_number,
        vehicle_type,
        license_no,
        email,
        password
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: agent.agent_id, type: 'delivery' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user data without password
      const { password: _, ...agentData } = agent;
      
      res.status(201).json({
        message: 'Delivery agent registration successful',
        token,
        user: agentData
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      res.status(500).json({ error: 'Server error during registration' });
    }
  },
  
  // Login for business user
  async loginBusiness(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find business user by email
      const business = await BusinessModel.findByEmail(email);
      if (!business) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, business.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: business.businessman_id, type: 'business' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user data without password
      const { password: _, ...businessData } = business;
      
      res.json({
        message: 'Login successful',
        token,
        user: businessData
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ error: 'Server error during login' });
    }
  },
  
  // Login for delivery agent
  async loginDelivery(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find delivery agent by email
      const agent = await DeliveryModel.findByEmail(email);
      if (!agent) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, agent.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: agent.agent_id, type: 'delivery' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user data without password
      const { password: _, ...agentData } = agent;
      
      res.json({
        message: 'Login successful',
        token,
        user: agentData
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ error: 'Server error during login' });
    }
  },
  
  // Get current user information
  async getCurrentUser(req, res) {
    try {
      const { id, type } = req.user;
      let userData;
      
      if (type === 'business') {
        userData = await BusinessModel.findById(id);
        if (!userData) {
          return res.status(404).json({ error: 'Business user not found' });
        }
        
        // Remove password from response
        const { password, ...businessData } = userData;
        return res.json(businessData);
      } else if (type === 'delivery') {
        userData = await DeliveryModel.findById(id);
        if (!userData) {
          return res.status(404).json({ error: 'Delivery agent not found' });
        }
        
        // Remove password from response
        const { password, ...agentData } = userData;
        return res.json(agentData);
      } else {
        return res.status(400).json({ error: 'Invalid user type' });
      }
    } catch (error) {
      console.error('Auth error:', error.message);
      res.status(500).json({ error: 'Server error fetching user data' });
    }
  }
};

export default AuthController;