import express, { Request, Response } from 'express';
import { pool } from '../database/connection';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { PoolClient } from 'pg';

const router = express.Router();

// Get inventory transactions for a product
router.get('/transactions/:productId', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '50' } = req.query as { page?: string; limit?: string };
    
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        it.*,
        u.first_name,
        u.last_name,
        p.name as product_name
      FROM inventory_transactions it
      LEFT JOIN users u ON it.created_by = u.id
      LEFT JOIN products p ON it.product_id = p.id
      WHERE it.product_id = $1
      ORDER BY it.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [productId, limit, offset]);
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM inventory_transactions WHERE product_id = $1';
    const countResult = await pool.query(countQuery, [productId]);
    
    res.json({
      transactions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get inventory transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add inventory transaction
router.post('/transactions', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      product_id, 
      transaction_type, 
      quantity, 
      reason, 
      reference_id, 
      reference_type 
    } = req.body;
    
    if (!product_id || !transaction_type || !quantity) {
      return res.status(400).json({ error: 'Product ID, transaction type, and quantity are required' });
    }
    
    // Check if product exists
    const productQuery = 'SELECT id, name, stock_quantity FROM products WHERE id = $1';
    const productResult = await pool.query(productQuery, [product_id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    const newStock = product.stock_quantity + (transaction_type === 'in' ? quantity : -quantity);
    
    if (newStock < 0) {
      return res.status(400).json({ error: 'Insufficient stock for this transaction' });
    }
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Add inventory transaction
      const insertQuery = `
        INSERT INTO inventory_transactions (
          product_id, transaction_type, quantity, reason, reference_id, reference_type, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const transactionResult = await client.query(insertQuery, [
        product_id, transaction_type, quantity, reason, reference_id, reference_type, req.user.id
      ]);
      
      // Update product stock
      const updateQuery = 'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
      await client.query(updateQuery, [newStock, product_id]);
      
      // Check for stock alerts
      await checkStockAlerts(client, product_id, newStock);
      
      await client.query('COMMIT');
      
      res.json(transactionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Add inventory transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stock alerts
router.get('/alerts', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { alert_type, is_active = true } = req.query;
    
    let query = `
      SELECT 
        sa.*,
        p.name as product_name,
        p.sku,
        p.stock_quantity,
        c.name as category_name
      FROM stock_alerts sa
      JOIN products p ON sa.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE sa.is_active = $1
    `;
    
    const params = [is_active];
    
    if (alert_type) {
      query += ' AND sa.alert_type = $2';
      params.push(alert_type);
    }
    
    query += ' ORDER BY sa.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get stock alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create stock alert
router.post('/alerts', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { product_id, alert_type, threshold_quantity } = req.body;
    
    if (!product_id || !alert_type || !threshold_quantity) {
      return res.status(400).json({ error: 'Product ID, alert type, and threshold quantity are required' });
    }
    
    // Check if product exists
    const productQuery = 'SELECT id, name, stock_quantity FROM products WHERE id = $1';
    const productResult = await pool.query(productQuery, [product_id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    
    // Check if alert already exists
    const existingQuery = 'SELECT id FROM stock_alerts WHERE product_id = $1 AND alert_type = $2 AND is_active = true';
    const existingResult = await pool.query(existingQuery, [product_id, alert_type]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Alert already exists for this product and type' });
    }
    
    // Create alert
    const insertQuery = `
      INSERT INTO stock_alerts (product_id, alert_type, threshold_quantity, current_quantity)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      product_id, alert_type, threshold_quantity, product.stock_quantity
    ]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create stock alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve stock alert
router.patch('/alerts/:alertId/resolve', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    
    const query = `
      UPDATE stock_alerts 
      SET is_active = false, resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [alertId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Resolve stock alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk stock update
router.post('/bulk-update', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      
      for (const update of updates) {
        const { product_id, new_quantity, reason } = update;
        
        if (!product_id || new_quantity === undefined) {
          continue;
        }
        
        // Get current stock
        const productQuery = 'SELECT stock_quantity FROM products WHERE id = $1';
        const productResult = await client.query(productQuery, [product_id]);
        
        if (productResult.rows.length === 0) {
          continue;
        }
        
        const currentStock = productResult.rows[0].stock_quantity;
        const difference = new_quantity - currentStock;
        
        if (difference === 0) {
          continue;
        }
        
        // Add inventory transaction
        const transactionQuery = `
          INSERT INTO inventory_transactions (
            product_id, transaction_type, quantity, reason, created_by
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        
        const transactionResult = await client.query(transactionQuery, [
          product_id,
          difference > 0 ? 'adjustment' : 'adjustment',
          Math.abs(difference),
          reason || 'Bulk stock update',
          req.user.id
        ]);
        
        // Update product stock
        const updateQuery = 'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
        await client.query(updateQuery, [new_quantity, product_id]);
        
        // Check for stock alerts
        await checkStockAlerts(client, product_id, new_quantity);
        
        results.push(transactionResult.rows[0]);
      }
      
      await client.query('COMMIT');
      res.json(results);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Bulk stock update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check stock alerts
async function checkStockAlerts(client: PoolClient, productId: string, currentStock: number) {
  const alertsQuery = 'SELECT * FROM stock_alerts WHERE product_id = $1 AND is_active = true';
  const alertsResult = await client.query(alertsQuery, [productId]);
  
  for (const alert of alertsResult.rows) {
    let shouldTrigger = false;
    
    switch (alert.alert_type) {
      case 'low_stock':
        shouldTrigger = currentStock <= alert.threshold_quantity;
        break;
      case 'out_of_stock':
        shouldTrigger = currentStock === 0;
        break;
      case 'overstock':
        shouldTrigger = currentStock >= alert.threshold_quantity;
        break;
    }
    
    if (shouldTrigger) {
      // Update alert with current quantity
      const updateAlertQuery = 'UPDATE stock_alerts SET current_quantity = $1 WHERE id = $2';
      await client.query(updateAlertQuery, [currentStock, alert.id]);
      
      // Create notification (if notifications table exists)
      // This would be implemented based on your notification system
    }
  }
}

export default router;
