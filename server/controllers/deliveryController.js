import DeliveryModel from '../models/deliveryModel.js';
import OrderModel from '../models/orderModel.js';

// Delivery agent controller for delivery-related operations
const DeliveryController = {
  // Get delivery agent profile
  async getProfile(req, res) {
    try {
      const agent_id = req.user.id;
      
      const agent = await DeliveryModel.findById(agent_id);
      if (!agent) {
        return res.status(404).json({ error: 'Delivery agent not found' });
      }
      
      // Format the profile response
      const profileData = {
        agent_id: agent.agent_id,
        name: agent.name,
        email: agent.email,
        contact_number: agent.contact_number,
        area: agent.area,
        street: agent.street,
        vehicle_type: agent.vehicle_type,
        vehicle_number: agent.vehicle_number,
        license_no: agent.license_no,
        gender: agent.gender || null,
        date_of_birth: agent.date_of_birth || null,
        about: agent.about || null,
        availability_status: agent.availability_status || "Unavailable",
        avg_rating: agent.avg_rating || 0,
        total_deliveries: agent.total_deliveries || 0,
        bank_details: agent.account_holder_name ? {
          account_holder_name: agent.account_holder_name,
          account_number: agent.account_number,
          ifsc_code: agent.ifsc_code,
          bank_name: agent.bank_name,
          branch_name: agent.branch_name
        } : null
      };
      
      res.json(profileData);
    } catch (error) {
      console.error('Get delivery profile error:', error.message);
      res.status(500).json({ error: 'Server error fetching delivery profile' });
    }
  },
  
  // Update delivery agent profile
  async updateProfile(req, res) {
    try {
      const agent_id = req.params.id || req.user.id;
      const updateData = req.body;
      
      // Verify that the user is updating their own profile or is an admin
      if (req.params.id && parseInt(req.params.id) !== parseInt(req.user.id)) {
        return res.status(403).json({ error: 'Not authorized to update another agent\'s profile' });
      }
      
      const agent = await DeliveryModel.update(agent_id, updateData);
      if (!agent) {
        return res.status(404).json({ error: 'Delivery agent not found' });
      }
      
      // Return updated profile without sensitive information
      const { password, ...profileData } = agent;
      
      res.json({
        message: 'Profile updated successfully',
        profile: profileData
      });
    } catch (error) {
      console.error('Update delivery profile error:', error.message);
      res.status(500).json({ error: 'Server error updating delivery profile' });
    }
  },
  
  // Update delivery agent's availability status
  async updateAvailabilityStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const agent_id = req.user.id;
      
      // Check if the user is updating their own status
      if (parseInt(id) !== agent_id) {
        return res.status(403).json({ error: 'Not authorized to update another agent\'s status' });
      }
      
      const agent = await DeliveryModel.updateAvailability(id, status);
      if (!agent) {
        return res.status(404).json({ error: 'Delivery agent not found' });
      }
      
      res.json({
        message: 'Availability status updated successfully',
        status: agent.availability_status
      });
    } catch (error) {
      console.error('Update availability status error:', error.message);
      res.status(500).json({ error: 'Server error updating availability status' });
    }
  },
  
  // Set delivery agent status to offline (special handler for beacon requests)
  async setOfflineStatus(req, res) {
    try {
      const { id } = req.params;
      
      // This endpoint doesn't validate the user token since it's called by navigator.sendBeacon
      // But we should log the attempt for security purposes
      console.log(`Setting delivery agent ${id} status to offline via beacon request`);
      
      // Set status to false (offline)
      const agent = await DeliveryModel.updateAvailability(id, false);
      if (!agent) {
        // Even for beacon requests, try to return proper status codes
        return res.status(404).json({ error: 'Delivery agent not found' });
      }
      
      // Return success response (though beacon doesn't process the response)
      res.status(200).json({
        message: 'Availability status set to offline successfully',
        status: 'Unavailable'
      });
    } catch (error) {
      console.error('Set offline status error:', error.message);
      res.status(500).json({ error: 'Server error setting offline status' });
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
  
  // Get delivery order history
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
      const { period } = req.query; // daily, weekly, monthly
      
      // For a real implementation, this would fetch from a transactions table
      // For now, we'll generate some placeholder data
      const earnings = {
        today: Math.floor(Math.random() * 1000) + 500,
        weekly: Math.floor(Math.random() * 5000) + 2500,
        monthly: Math.floor(Math.random() * 20000) + 10000,
      };
      
      res.json(earnings);
    } catch (error) {
      console.error('Get earnings error:', error.message);
      res.status(500).json({ error: 'Server error fetching earnings data' });
    }
  },
  
  // Update delivery agent location
  async updateLocation(req, res) {
    try {
      const agent_id = req.user.id;
      const { address, latitude, longitude } = req.body;
      
      // In a real implementation, we'd update the location in a database
      // For now, just acknowledge the update
      
      res.json({
        message: 'Location updated successfully',
        location: {
          address,
          coordinates: {
            latitude: latitude || 0,
            longitude: longitude || 0
          }
        }
      });
    } catch (error) {
      console.error('Update location error:', error.message);
      res.status(500).json({ error: 'Server error updating location' });
    }
  },
  
  // Get delivery agent stats
  async getStats(req, res) {
    try {
      const agent_id = req.user.id;
      
      const agent = await DeliveryModel.findById(agent_id);
      if (!agent) {
        return res.status(404).json({ error: 'Delivery agent not found' });
      }
      
      const stats = {
        total_deliveries: agent.total_deliveries || 0,
        avg_rating: agent.avg_rating || 0,
        completed_this_month: Math.floor(Math.random() * 30) + 10, // Placeholder
        on_time_delivery_rate: Math.floor(Math.random() * 20) + 80 // Placeholder percentage
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error.message);
      res.status(500).json({ error: 'Server error fetching stats' });
    }
  }
};

export default DeliveryController;