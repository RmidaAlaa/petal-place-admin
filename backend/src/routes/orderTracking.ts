import express from 'express';
import { pool } from '../database/connection';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get order tracking history
router.get('/:orderId', authenticateToken, async (req: any, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if user owns the order or is admin
    const orderQuery = 'SELECT user_id FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const trackingQuery = `
      SELECT 
        ot.*,
        u.first_name,
        u.last_name
      FROM order_tracking ot
      LEFT JOIN users u ON ot.created_by = u.id
      WHERE ot.order_id = $1
      ORDER BY ot.timestamp ASC
    `;
    
    const result = await pool.query(trackingQuery, [orderId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add tracking update (admin only)
router.post('/:orderId', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { orderId } = req.params;
    const { status, description, location, metadata } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Check if order exists
    const orderQuery = 'SELECT id FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Add tracking entry
    const insertQuery = `
      INSERT INTO order_tracking (order_id, status, description, location, created_by, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      orderId,
      status,
      description,
      location,
      req.user.id,
      JSON.stringify(metadata || {})
    ]);
    
    // Update order status if it's a status change
    if (['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      const updateOrderQuery = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
      await pool.query(updateOrderQuery, [status, orderId]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add tracking update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available delivery time slots
router.get('/delivery-slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const query = `
      SELECT * FROM delivery_time_slots 
      WHERE date = $1 AND is_available = true AND current_orders < max_orders
      ORDER BY time_slot ASC
    `;
    
    const result = await pool.query(query, [date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get delivery slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create delivery time slots (admin only)
router.post('/delivery-slots', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { date, time_slots } = req.body;
    
    if (!date || !time_slots || !Array.isArray(time_slots)) {
      return res.status(400).json({ error: 'Date and time_slots array are required' });
    }
    
    const slots = [];
    for (const slot of time_slots) {
      const query = `
        INSERT INTO delivery_time_slots (date, time_slot, max_orders)
        VALUES ($1, $2, $3)
        ON CONFLICT (date, time_slot) DO UPDATE SET max_orders = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [date, slot.time_slot, slot.max_orders || 10]);
      slots.push(result.rows[0]);
    }
    
    res.json(slots);
  } catch (error) {
    console.error('Create delivery slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel order
router.post('/:orderId/cancel', authenticateToken, async (req: any, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    // Check if user owns the order
    const orderQuery = 'SELECT user_id, status FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }
    
    // Update order status
    const updateQuery = `
      UPDATE orders 
      SET status = 'cancelled', cancellation_reason = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [reason, orderId]);
    
    // Add tracking entry
    const trackingQuery = `
      INSERT INTO order_tracking (order_id, status, description, created_by)
      VALUES ($1, 'cancelled', 'Order cancelled by customer', $2)
    `;
    
    await pool.query(trackingQuery, [orderId, req.user.id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request refund
router.post('/:orderId/refund', authenticateToken, async (req: any, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;
    
    // Check if user owns the order
    const orderQuery = 'SELECT user_id, status, total_amount FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if order can be refunded
    if (!['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Order must be delivered or cancelled to request refund' });
    }
    
    const refundAmount = amount || order.total_amount;
    
    // Update order refund status
    const updateQuery = `
      UPDATE orders 
      SET refund_status = 'requested', refund_amount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [refundAmount, orderId]);
    
    // Add tracking entry
    const trackingQuery = `
      INSERT INTO order_tracking (order_id, status, description, created_by, metadata)
      VALUES ($1, 'refund_requested', $2, $3, $4)
    `;
    
    await pool.query(trackingQuery, [
      orderId, 
      `Refund requested for ${refundAmount} SAR`,
      'Customer',
      JSON.stringify({ refund_amount: refundAmount, reason })
    ]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
