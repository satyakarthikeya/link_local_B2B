import DeliveryModel from '../models/deliveryModel.js';
import OrderModel from '../models/orderModel.js';
import OrderNotificationModel from '../models/orderNotificationModel.js';
import db from '../config/db.js';

// Delivery agent controller for delivery-related operations
const DeliveryController = {
  // Get delivery agent profile
  async getProfile(req, res) {
    try {
      const id = req.user.id;
      const profile = await DeliveryModel.findById(id);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error.message);
      res.status(500).json({ error: 'Server error fetching profile' });
    }
  },
  
  // Update delivery agent profile
  async updateProfile(req, res) {
    try {
      const id = req.user.id;
      const updateData = req.body;
      
      const updatedProfile = await DeliveryModel.update(id, updateData);
      
      res.json({
        message: 'Profile updated successfully',
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Update profile error:', error.message);
      res.status(500).json({ error: 'Server error updating profile' });
    }
  },
  
  // Update delivery agent's availability status
  async updateAvailabilityStatus(req, res) {
    try {
      const id = req.user.id;
      const { status } = req.body;
      
      if (status === undefined) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const updatedProfile = await DeliveryModel.updateAvailability(id, status);
      
      res.json({
        message: `Status updated to ${status ? 'Available' : 'Unavailable'}`,
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Update status error:', error.message);
      res.status(500).json({ error: 'Server error updating availability status' });
    }
  },
  
  // Set delivery agent status to offline (special handler for beacon requests)
  async setOfflineStatus(req, res) {
    try {
      const id = req.user.id;
      
      await DeliveryModel.updateAvailability(id, false);
      
      res.json({
        message: 'Status updated to Unavailable'
      });
    } catch (error) {
      console.error('Set offline status error:', error.message);
      res.status(500).json({ error: 'Server error updating status' });
    }
  },
  
  // Get current orders assigned to the delivery agent
  async getCurrentOrders(req, res) {
    try {
      const agent_id = req.user.id;
      
      const orders = await OrderModel.getByAgentId(agent_id);
      
      res.json(orders);
    } catch (error) {
      console.error('Get current orders error:', error.message);
      res.status(500).json({ error: 'Server error fetching current orders' });
    }
  },
  
  // Get delivery order history with filters
  async getOrderHistory(req, res) {
    try {
      const agent_id = req.user.id;
      const { status, start_date, end_date } = req.query;
      
      const orders = await OrderModel.getDeliveryHistory(agent_id, { status, start_date, end_date });
      
      res.json(orders);
    } catch (error) {
      console.error('Get order history error:', error.message);
      res.status(500).json({ error: 'Server error fetching order history' });
    }
  },
  
  // Get earnings information
  async getEarnings(req, res) {
    try {
      const agent_id = req.user.id;
      const stats = await OrderModel.getOrderStatistics(agent_id);
      
      // Format the response
      const earnings = {
        today: `₹${Math.floor(Math.random() * 500) + 500}`, // Demo value - replace with actual calculation
        weekly: `₹${Math.floor(Math.random() * 2000) + 3000}`, // Demo value
        monthly: `₹${stats.total_earnings ? Math.floor(stats.total_earnings) : 0}`,
        completed_orders: stats.completed_orders || 0,
        active_orders: stats.active_orders || 0
      };
      
      res.json(earnings);
    } catch (error) {
      console.error('Get earnings error:', error.message);
      res.status(500).json({ error: 'Server error fetching earnings' });
    }
  },
  
  // Update delivery agent location
  async updateLocation(req, res) {
    try {
      const id = req.user.id;
      const { latitude, longitude, address } = req.body;
      
      // This is a placeholder - you'd need to add location fields to the profile table
      // or create a separate locations table
      
      res.json({
        message: 'Location updated successfully'
      });
    } catch (error) {
      console.error('Update location error:', error.message);
      res.status(500).json({ error: 'Server error updating location' });
    }
  },

  // Get nearby available orders
  async getNearbyOrders(req, res) {
    try {
      const agent_id = req.user.id;
      // Get agent profile to find their city
      const profile = await DeliveryModel.findById(agent_id);
      
      if (!profile || !profile.city) {
        return res.status(400).json({ error: 'Agent profile missing city information' });
      }
      
      // Find orders in the same city
      const orders = await OrderModel.getNearbyOrders(profile.city);
      
      res.json(orders);
    } catch (error) {
      console.error('Get nearby orders error:', error.message);
      res.status(500).json({ error: 'Server error fetching nearby orders' });
    }
  },
  
  // Accept an order
  async acceptOrder(req, res) {
    try {
      const agent_id = req.user.id;
      const { order_id } = req.params;
      
      if (!order_id) {
        return res.status(400).json({ error: 'Order ID is required' });
      }
      
      // Check if the agent is available
      const agent = await DeliveryModel.findById(agent_id);
      if (agent.availability_status !== 'Available') {
        return res.status(400).json({ error: 'You must be online to accept orders' });
      }
      
      // Assign the agent to the order
      const updatedOrder = await OrderModel.assignAgent(order_id, agent_id);
      
      // Create delivery tracking entry
      await OrderModel.createDeliveryTracking(order_id, agent_id);
      
      res.json({
        message: 'Order accepted successfully',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Accept order error:', error.message);
      res.status(500).json({ error: 'Server error accepting order' });
    }
  },
  
  // Update order delivery status
  async updateOrderStatus(req, res) {
    try {
      const agent_id = req.user.id;
      const { order_id } = req.params;
      const { status, notes } = req.body;
      
      if (!order_id || !status) {
        return res.status(400).json({ error: 'Order ID and status are required' });
      }
      
      // Verify the agent is assigned to this order
      const order = await OrderModel.findById(order_id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      if (order.agent_id !== agent_id) {
        return res.status(403).json({ error: 'You are not assigned to this order' });
      }
      
      // Update the delivery status
      const updatedTracking = await OrderModel.updateDeliveryStatus(order_id, status, notes);
      
      // If order is delivered, update agent stats
      if (status === 'Delivered') {
        await DeliveryModel.updateStats(agent_id, { 
          rating: req.body.rating || 5, // Default rating if not provided
          completed: true 
        });
      }
      
      res.json({
        message: `Order status updated to ${status}`,
        tracking: updatedTracking
      });
    } catch (error) {
      console.error('Update order status error:', error.message);
      res.status(500).json({ error: 'Server error updating order status' });
    }
  },
  
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const agent_id = req.user.id;
      
      // Get order statistics
      const stats = await OrderModel.getOrderStatistics(agent_id);
      
      // Get agent profile
      const profile = await DeliveryModel.findById(agent_id);
      
      // Format earnings for display
      const earnings = {
        today: `₹${Math.floor(Math.random() * 500) + 500}`, // Demo values
        weekly: `₹${Math.floor(Math.random() * 2000) + 3000}`, // Demo values
        monthly: `₹${stats.total_earnings ? Math.floor(stats.total_earnings) : 0}`
      };
      
      // Calculate ratings and other statistics
      const dashboardStats = {
        earnings,
        orders: {
          active: stats.active_orders || 0,
          completed: stats.completed_orders || 0,
          total: (stats.active_orders || 0) + (stats.completed_orders || 0)
        },
        rating: profile.avg_rating || 5.0,
        total_deliveries: profile.total_deliveries || 0
      };
      
      res.json(dashboardStats);
    } catch (error) {
      console.error('Get dashboard stats error:', error.message);
      res.status(500).json({ error: 'Server error fetching dashboard statistics' });
    }
  },

  // Get performance statistics
  async getPerformanceStats(req, res) {
    try {
      const agent_id = req.user.id;
      
      // Get order statistics
      const stats = await OrderModel.getOrderStatistics(agent_id);
      
      // Get agent profile
      const profile = await DeliveryModel.findById(agent_id);
      
      // Calculate performance metrics
      const totalOrders = (stats.completed_orders || 0) + (stats.active_orders || 0);
      const onTimeDeliveryRate = totalOrders > 0 ? 
        Math.round((stats.completed_orders || 0) * 0.9 * 100) / totalOrders : 100; // 90% on-time delivery rate assumption
      
      const performanceStats = {
        rating: profile.avg_rating || 5.0,
        deliveryCompletionRate: totalOrders > 0 ? 
          Math.round((stats.completed_orders || 0) * 100 / totalOrders) : 100,
        onTimeDeliveryRate,
        cancellationRate: totalOrders > 0 ? 
          Math.round(Math.random() * 5) : 0, // Random cancellation rate between 0-5%
        customerFeedback: [
          { rating: 5, comment: "Very professional delivery" },
          { rating: 4, comment: "Good service, slightly delayed" }
        ]
      };
      
      res.json(performanceStats);
    } catch (error) {
      console.error('Get performance stats error:', error.message);
      res.status(500).json({ error: 'Server error fetching performance statistics' });
    }
  },
  
  // Get earnings history
  async getEarningsHistory(req, res) {
    try {
      const agent_id = req.user.id;
      const { period = 'month', start_date, end_date } = req.query;
      
      // Get completed orders with earnings calculation
      const stats = await OrderModel.getOrderStatistics(agent_id);
      
      // Generate some mock earnings history data
      const today = new Date();
      const earningsHistory = [];
      
      // Generate data for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        earningsHistory.push({
          date: date.toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 500) + 200,
          deliveries: Math.floor(Math.random() * 5) + 1,
          tip: Math.floor(Math.random() * 100)
        });
      }
      
      res.json({
        total: stats.total_earnings || 0,
        history: earningsHistory
      });
    } catch (error) {
      console.error('Get earnings history error:', error.message);
      res.status(500).json({ error: 'Server error fetching earnings history' });
    }
  },
  
  // Get delivery agent documents
  async getDocuments(req, res) {
    try {
      const agent_id = req.user.id;
      
      // In a real implementation, you would fetch documents from storage
      // Here we're returning mock data
      const documents = [
        { id: 1, type: 'ID Proof', name: 'Aadhar Card', status: 'Verified', uploadDate: '2025-01-15' },
        { id: 2, type: 'Address Proof', name: 'Utility Bill', status: 'Pending', uploadDate: '2025-03-20' },
        { id: 3, type: 'Vehicle Registration', name: 'RC Book', status: 'Verified', uploadDate: '2025-02-10' },
        { id: 4, type: 'Driving License', name: 'License', status: 'Verified', uploadDate: '2025-01-05' }
      ];
      
      res.json(documents);
    } catch (error) {
      console.error('Get documents error:', error.message);
      res.status(500).json({ error: 'Server error fetching documents' });
    }
  },
  
  // Get pending order notifications for delivery agent
  async getOrderNotifications(req, res) {
    try {
      const agent_id = req.user.id;
      
      const notifications = await OrderNotificationModel.getPendingByAgentId(agent_id);
      
      res.json({
        count: notifications.length,
        notifications: notifications
      });
    } catch (error) {
      console.error('Get order notifications error:', error.message);
      res.status(500).json({ error: 'Server error fetching order notifications' });
    }
  },
  
  // Accept an order from notifications
  async acceptOrderFromNotification(req, res) {
    try {
      const agent_id = req.user.id;
      const { notification_id, order_id } = req.params;
      
      if (!notification_id || !order_id) {
        return res.status(400).json({ error: 'Notification ID and Order ID are required' });
      }
      
      // Check if the agent is available
      const agent = await DeliveryModel.findById(agent_id);
      if (agent.availability_status !== 'Available') {
        return res.status(400).json({ error: 'You must be online to accept orders' });
      }
      
      // Check if the order is still available
      const order = await OrderModel.findById(order_id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      if (order.agent_id) {
        // Order already assigned to another agent
        await OrderNotificationModel.updateStatus(notification_id, 'Expired');
        return res.status(400).json({ error: 'Order has already been assigned to another delivery agent' });
      }
      
      // Start transaction: update notification status, assign order to agent, and mark other notifications as expired
      const client = await db.pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Update notification status
        await client.query(
          `UPDATE OrderNotifications 
           SET status = 'Accepted', response_time = CURRENT_TIMESTAMP
           WHERE notification_id = $1 AND agent_id = $2`,
          [notification_id, agent_id]
        );
        
        // Assign agent to order
        await client.query(
          `UPDATE Orders
           SET agent_id = $1, delivery_status = 'Assigned', updated_at = CURRENT_TIMESTAMP
           WHERE order_id = $2 AND agent_id IS NULL`,
          [agent_id, order_id]
        );
        
        // Create delivery tracking entry
        await client.query(
          `INSERT INTO Delivery (order_id, agent_id)
           VALUES ($1, $2)`,
          [order_id, agent_id]
        );
        
        // Mark other pending notifications for this order as expired
        await client.query(
          `UPDATE OrderNotifications
           SET status = 'Expired', response_time = CURRENT_TIMESTAMP
           WHERE order_id = $1 AND notification_id != $2 AND status = 'Pending'`,
          [order_id, notification_id]
        );
        
        await client.query('COMMIT');
        
        // Get updated order
        const updatedOrder = await OrderModel.findById(order_id);
        
        res.json({
          message: 'Order accepted successfully',
          order: updatedOrder
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Accept order notification error:', error.message);
      res.status(500).json({ error: 'Server error accepting order notification' });
    }
  },
  
  // Reject an order notification
  async rejectOrderNotification(req, res) {
    try {
      const agent_id = req.user.id;
      const { notification_id } = req.params;
      
      if (!notification_id) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }
      
      const updatedNotification = await OrderNotificationModel.updateStatus(notification_id, 'Rejected');
      
      if (!updatedNotification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      res.json({
        message: 'Order notification rejected',
        notification: updatedNotification
      });
    } catch (error) {
      console.error('Reject order notification error:', error.message);
      res.status(500).json({ error: 'Server error rejecting order notification' });
    }
  }
};

export default DeliveryController;