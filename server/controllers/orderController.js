import OrderModel from '../models/orderModel.js';
import ProductModel from '../models/productModel.js';
import DeliveryModel from '../models/deliveryModel.js';

// Order controller for order-related operations
const OrderController = {
  // Create a new order
  async createOrder(req, res) {
    try {
      const { supplying_businessman_id, product_id, quantity_requested } = req.body;
      const requesting_businessman_id = req.user.id;
      
      // Validate required fields
      if (!supplying_businessman_id || !product_id || !quantity_requested) {
        return res.status(400).json({ error: 'Required fields missing' });
      }
      
      // Check if quantity is valid
      if (quantity_requested <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than 0' });
      }
      
      // Create the order
      const order = await OrderModel.create({
        requesting_businessman_id,
        supplying_businessman_id,
        product_id,
        quantity_requested
      });
      
      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      console.error('Create order error:', error.message);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (error.message === 'Not enough quantity available') {
        return res.status(400).json({ error: 'Not enough quantity available' });
      }
      
      res.status(500).json({ error: 'Server error creating order' });
    }
  },
  
  // Get order by ID
  async getOrder(req, res) {
    try {
      const { id } = req.params;
      
      const order = await OrderModel.findById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check if the user is authorized to view this order
      const userId = req.user.id;
      const userType = req.user.type;
      
      if (userType === 'business') {
        if (order.requesting_businessman_id !== userId && order.supplying_businessman_id !== userId) {
          return res.status(403).json({ error: 'Not authorized to view this order' });
        }
      } else if (userType === 'delivery') {
        if (order.agent_id !== userId) {
          return res.status(403).json({ error: 'Not authorized to view this order' });
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error('Get order error:', error.message);
      res.status(500).json({ error: 'Server error fetching order' });
    }
  },
  
  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, delivery_status } = req.body;
      const userId = req.user.id;
      const userType = req.user.type;
      
      // Find the order
      const order = await OrderModel.findById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check authorization based on user type
      if (userType === 'business') {
        if (order.supplying_businessman_id !== userId) {
          return res.status(403).json({ error: 'Only the supplying business can update order status' });
        }
        
        if (!status) {
          return res.status(400).json({ error: 'Status is required' });
        }
        
        const updatedOrder = await OrderModel.updateStatus(id, status);
        return res.json({
          message: 'Order status updated successfully',
          order: updatedOrder
        });
      } else if (userType === 'delivery') {
        if (order.agent_id !== userId) {
          return res.status(403).json({ error: 'Only the assigned delivery agent can update delivery status' });
        }
        
        if (!delivery_status) {
          return res.status(400).json({ error: 'Delivery status is required' });
        }
        
        const updatedOrder = await OrderModel.updateStatus(id, order.status, delivery_status);
        return res.json({
          message: 'Delivery status updated successfully',
          order: updatedOrder
        });
      }
      
      res.status(400).json({ error: 'Invalid user type or missing required fields' });
    } catch (error) {
      console.error('Update order status error:', error.message);
      res.status(500).json({ error: 'Server error updating order status' });
    }
  },
  
  // Get orders for a business
  async getBusinessOrders(req, res) {
    try {
      const businessman_id = req.user.id;
      const { role } = req.query; // 'requesting', 'supplying', or 'both'
      
      const orders = await OrderModel.getByBusinessmanId(businessman_id, role || 'both');
      
      res.json(orders);
    } catch (error) {
      console.error('Get business orders error:', error.message);
      res.status(500).json({ error: 'Server error fetching orders' });
    }
  },
  
  // Get orders for a delivery agent
  async getDeliveryOrders(req, res) {
    try {
      const agent_id = req.user.id;
      
      const orders = await OrderModel.getByAgentId(agent_id);
      
      res.json(orders);
    } catch (error) {
      console.error('Get delivery orders error:', error.message);
      res.status(500).json({ error: 'Server error fetching orders' });
    }
  },
  
  // Assign delivery agent to an order
  async assignDeliveryAgent(req, res) {
    try {
      const { order_id, agent_id } = req.body;
      const userType = req.user.type;
      
      // Only business users can assign delivery agents
      if (userType !== 'business') {
        return res.status(403).json({ error: 'Only business users can assign delivery agents' });
      }
      
      // Find the order
      const order = await OrderModel.findById(order_id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check if the user is authorized to assign a delivery agent
      if (order.supplying_businessman_id !== req.user.id) {
        return res.status(403).json({ error: 'Only the supplying business can assign delivery agents' });
      }
      
      // Check if the delivery agent exists and is available
      const agent = await DeliveryModel.findById(agent_id);
      if (!agent) {
        return res.status(404).json({ error: 'Delivery agent not found' });
      }
      
      if (!agent.availability_status) {
        return res.status(400).json({ error: 'Delivery agent is not available' });
      }
      
      // Assign the delivery agent to the order
      const updatedOrder = await OrderModel.assignAgent(order_id, agent_id);
      
      // Update delivery agent's availability
      await DeliveryModel.updateAvailability(agent_id, false);
      
      res.json({
        message: 'Delivery agent assigned successfully',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Assign delivery agent error:', error.message);
      res.status(500).json({ error: 'Server error assigning delivery agent' });
    }
  }
};

export default OrderController;