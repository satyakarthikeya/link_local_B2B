import db from '../config/db.js';

// Order Notification model with CRUD operations
const OrderNotificationModel = {
  // Create notifications for multiple delivery agents
  async createNotifications(orderId, agentIds) {
    try {
      // Prepare values for bulk insert
      const values = agentIds.map(agentId => `(${orderId}, ${agentId})`).join(', ');
      
      if (!values.length) return [];
      
      const result = await db.query(
        `INSERT INTO OrderNotifications (order_id, agent_id)
         VALUES ${values}
         RETURNING *`
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error creating order notifications:', error);
      throw new Error('Failed to create order notifications');
    }
  },
  
  // Get pending notifications for a delivery agent
  async getPendingByAgentId(agentId) {
    try {
      const result = await db.query(
        `SELECT n.*, o.*,
           bp_ord.business_name as ordering_business_name, bp_ord.area as ordering_area, 
           bp_ord.street as ordering_street, bp_ord.city as ordering_city,
           bp_sup.business_name as supplying_business_name, bp_sup.area as supplying_area, 
           bp_sup.street as supplying_street, bp_sup.city as supplying_city,
           p.product_name, op.quantity_requested, o.total_amount
         FROM OrderNotifications n
         JOIN Orders o ON n.order_id = o.order_id
         JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
         JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
         JOIN OrderProducts op ON o.order_id = op.order_id
         JOIN Product p ON op.product_id = p.product_id
         WHERE n.agent_id = $1 AND n.status = 'Pending'
         AND o.agent_id IS NULL
         ORDER BY n.created_at DESC`,
        [agentId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      throw new Error('Failed to get pending notifications');
    }
  },
  
  // Update notification status
  async updateStatus(notificationId, status) {
    try {
      const result = await db.query(
        `UPDATE OrderNotifications
         SET status = $1, response_time = CURRENT_TIMESTAMP
         WHERE notification_id = $2
         RETURNING *`,
        [status, notificationId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating notification status:', error);
      throw new Error('Failed to update notification status');
    }
  },
  
  // Mark all notifications for an order as expired or rejected (except the accepted one)
  async markOtherNotificationsAs(orderId, status, exceptNotificationId = null) {
    try {
      let query = `
        UPDATE OrderNotifications
        SET status = $1, response_time = CURRENT_TIMESTAMP
        WHERE order_id = $2 AND status = 'Pending'
      `;
      
      const params = [status, orderId];
      
      if (exceptNotificationId) {
        query += ` AND notification_id != $3`;
        params.push(exceptNotificationId);
      }
      
      await db.query(query, params);
    } catch (error) {
      console.error('Error updating other notifications:', error);
      throw new Error('Failed to update other notifications');
    }
  },
  
  // Find nearby delivery agents for an order
  async findNearbyAgentsForOrder(orderId, limit = 10) {
    try {
      // Get the order's city
      const orderResult = await db.query(
        `SELECT 
           bp_ord.city as ordering_city,
           bp_sup.city as supplying_city
         FROM Orders o
         JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
         JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
         WHERE o.order_id = $1`,
        [orderId]
      );
      
      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }
      
      const { ordering_city, supplying_city } = orderResult.rows[0];
      
      // Find available agents in the same city
      const result = await db.query(
        `SELECT da.agent_id
         FROM DeliveryAgent da
         JOIN DeliveryProfile dp ON da.agent_id = dp.agent_id
         WHERE dp.availability_status = 'Available'
         AND (dp.city = $1 OR dp.city = $2)
         LIMIT $3`,
        [ordering_city, supplying_city, limit]
      );
      
      return result.rows.map(row => row.agent_id);
    } catch (error) {
      console.error('Error finding nearby agents:', error);
      throw new Error('Failed to find nearby agents');
    }
  }
};

export default OrderNotificationModel;