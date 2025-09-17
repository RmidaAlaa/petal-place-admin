import express from 'express';
import { pool } from '../database/connection';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, approved_only = true } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.avatar_url,
        o.order_number
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN orders o ON r.order_id = o.id
      WHERE r.product_id = $1
    `;
    
    const params = [productId];
    let paramCount = 1;
    
    if (approved_only === 'true') {
      query += ` AND r.is_approved = true`;
    }
    
    if (rating) {
      paramCount++;
      query += ` AND r.rating = $${paramCount}`;
      params.push(rating);
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM reviews WHERE product_id = $1';
    const countParams = [productId];
    
    if (approved_only === 'true') {
      countQuery += ' AND is_approved = true';
    }
    
    if (rating) {
      countQuery += ' AND rating = $2';
      countParams.push(rating);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    // Get rating statistics
    const statsQuery = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews 
      WHERE product_id = $1 AND is_approved = true
      GROUP BY rating
      ORDER BY rating DESC
    `;
    
    const statsResult = await pool.query(statsQuery, [productId]);
    
    const ratingStats = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    statsResult.rows.forEach(row => {
      ratingStats[row.rating] = parseInt(row.count);
    });
    
    const totalReviews = Object.values(ratingStats).reduce((sum, count) => sum + count, 0);
    const averageRating = totalReviews > 0 
      ? Object.entries(ratingStats).reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0) / totalReviews
      : 0;
    
    res.json({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      },
      statistics: {
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingStats
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create review
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { product_id, order_id, rating, title, comment, images } = req.body;
    
    if (!product_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Product ID and valid rating (1-5) are required' });
    }
    
    // Check if user has ordered this product
    if (order_id) {
      const orderQuery = `
        SELECT o.id 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1 AND o.user_id = $2 AND oi.product_id = $3
      `;
      
      const orderResult = await pool.query(orderQuery, [order_id, req.user.id, product_id]);
      
      if (orderResult.rows.length === 0) {
        return res.status(400).json({ error: 'You can only review products you have ordered' });
      }
    }
    
    // Check if user already reviewed this product
    const existingQuery = 'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2';
    const existingResult = await pool.query(existingQuery, [req.user.id, product_id]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    
    // Create review
    const insertQuery = `
      INSERT INTO reviews (
        user_id, product_id, order_id, rating, title, comment, images, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      req.user.id,
      product_id,
      order_id,
      rating,
      title,
      comment,
      JSON.stringify(images || []),
      !!order_id // Verified if from order
    ]);
    
    // Update product rating
    await updateProductRating(product_id);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update review
router.put('/:reviewId', authenticateToken, async (req: any, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;
    
    // Check if user owns the review
    const reviewQuery = 'SELECT user_id, product_id FROM reviews WHERE id = $1';
    const reviewResult = await pool.query(reviewQuery, [reviewId]);
    
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const review = reviewResult.rows[0];
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update review
    const updateQuery = `
      UPDATE reviews 
      SET rating = $1, title = $2, comment = $3, images = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      rating,
      title,
      comment,
      JSON.stringify(images || []),
      reviewId
    ]);
    
    // Update product rating
    await updateProductRating(review.product_id);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete review
router.delete('/:reviewId', authenticateToken, async (req: any, res) => {
  try {
    const { reviewId } = req.params;
    
    // Check if user owns the review or is admin
    const reviewQuery = 'SELECT user_id, product_id FROM reviews WHERE id = $1';
    const reviewResult = await pool.query(reviewQuery, [reviewId]);
    
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const review = reviewResult.rows[0];
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete review
    const deleteQuery = 'DELETE FROM reviews WHERE id = $1';
    await pool.query(deleteQuery, [reviewId]);
    
    // Update product rating
    await updateProductRating(review.product_id);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/reject review (admin only)
router.patch('/:reviewId/approve', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { reviewId } = req.params;
    const { is_approved, admin_response } = req.body;
    
    const updateQuery = `
      UPDATE reviews 
      SET is_approved = $1, admin_response = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [is_approved, admin_response, reviewId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', authenticateToken, async (req: any, res) => {
  try {
    const { reviewId } = req.params;
    
    // Check if review exists
    const reviewQuery = 'SELECT id FROM reviews WHERE id = $1';
    const reviewResult = await pool.query(reviewQuery, [reviewId]);
    
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Increment helpful count
    const updateQuery = 'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING helpful_count';
    const result = await pool.query(updateQuery, [reviewId]);
    
    res.json({ helpful_count: result.rows[0].helpful_count });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending reviews (admin only)
router.get('/pending', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        p.name as product_name,
        p.image_url as product_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.is_approved = false
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM reviews WHERE is_approved = false';
    const countResult = await pool.query(countQuery);
    
    res.json({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to update product rating
async function updateProductRating(productId: string) {
  const statsQuery = `
    SELECT 
      COUNT(*) as review_count,
      AVG(rating) as average_rating
    FROM reviews 
    WHERE product_id = $1 AND is_approved = true
  `;
  
  const statsResult = await pool.query(statsQuery, [productId]);
  
  const reviewCount = parseInt(statsResult.rows[0].review_count);
  const averageRating = parseFloat(statsResult.rows[0].average_rating) || 0;
  
  const updateQuery = `
    UPDATE products 
    SET rating = $1, review_count = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `;
  
  await pool.query(updateQuery, [averageRating, reviewCount, productId]);
}

export default router;
