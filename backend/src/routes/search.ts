import express from 'express';
import { pool } from '../database/connection';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Advanced search
router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      category, 
      min_price, 
      max_price, 
      rating, 
      in_stock, 
      featured, 
      vendor,
      sort_by = 'relevance',
      sort_order = 'desc',
      page = 1,
      limit = 20
    } = req.query;
    
    const offset = (page - 1) * limit;
    const userId = req.user?.id;
    
    // Build search query
    let query = `
      SELECT DISTINCT
        p.*,
        c.name as category_name,
        v.business_name as vendor_name,
        CASE 
          WHEN $1 IS NOT NULL THEN 
            ts_rank(
              to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || c.name),
              plainto_tsquery('english', $1)
            )
          ELSE 0
        END as relevance_score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.is_active = true
    `;
    
    const params = [q];
    let paramCount = 1;
    
    // Add search conditions
    if (q) {
      query += ` AND (
        to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || c.name) 
        @@ plainto_tsquery('english', $${paramCount})
      )`;
    }
    
    if (category) {
      paramCount++;
      query += ` AND c.slug = $${paramCount}`;
      params.push(category);
    }
    
    if (min_price) {
      paramCount++;
      query += ` AND p.price >= $${paramCount}`;
      params.push(min_price);
    }
    
    if (max_price) {
      paramCount++;
      query += ` AND p.price <= $${paramCount}`;
      params.push(max_price);
    }
    
    if (rating) {
      paramCount++;
      query += ` AND p.rating >= $${paramCount}`;
      params.push(rating);
    }
    
    if (in_stock === 'true') {
      query += ` AND p.stock_quantity > 0`;
    }
    
    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }
    
    if (vendor) {
      paramCount++;
      query += ` AND v.business_name ILIKE $${paramCount}`;
      params.push(`%${vendor}%`);
    }
    
    // Add sorting
    switch (sort_by) {
      case 'price':
        query += ` ORDER BY p.price ${sort_order}`;
        break;
      case 'rating':
        query += ` ORDER BY p.rating ${sort_order}`;
        break;
      case 'newest':
        query += ` ORDER BY p.created_at ${sort_order}`;
        break;
      case 'popular':
        query += ` ORDER BY p.sold_count ${sort_order}`;
        break;
      case 'name':
        query += ` ORDER BY p.name ${sort_order}`;
        break;
      default:
        query += ` ORDER BY relevance_score DESC, p.rating DESC, p.created_at DESC`;
    }
    
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT p.id)
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.is_active = true
    `;
    
    const countParams = [q];
    let countParamCount = 1;
    
    if (q) {
      countQuery += ` AND (
        to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || c.name) 
        @@ plainto_tsquery('english', $${countParamCount})
      )`;
    }
    
    if (category) {
      countParamCount++;
      countQuery += ` AND c.slug = $${countParamCount}`;
      countParams.push(category);
    }
    
    if (min_price) {
      countParamCount++;
      countQuery += ` AND p.price >= $${countParamCount}`;
      countParams.push(min_price);
    }
    
    if (max_price) {
      countParamCount++;
      countQuery += ` AND p.price <= $${countParamCount}`;
      countParams.push(max_price);
    }
    
    if (rating) {
      countParamCount++;
      countQuery += ` AND p.rating >= $${countParamCount}`;
      countParams.push(rating);
    }
    
    if (in_stock === 'true') {
      countQuery += ` AND p.stock_quantity > 0`;
    }
    
    if (featured === 'true') {
      countQuery += ` AND p.is_featured = true`;
    }
    
    if (vendor) {
      countParamCount++;
      countQuery += ` AND v.business_name ILIKE $${countParamCount}`;
      countParams.push(`%${vendor}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    // Save search history if user is authenticated
    if (userId && q) {
      const searchHistoryQuery = `
        INSERT INTO search_history (user_id, search_query, filters, results_count)
        VALUES ($1, $2, $3, $4)
      `;
      
      const filters = {
        category,
        min_price,
        max_price,
        rating,
        in_stock,
        featured,
        vendor
      };
      
      await pool.query(searchHistoryQuery, [
        userId,
        q,
        JSON.stringify(filters),
        parseInt(countResult.rows[0].count)
      ]);
    }
    
    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      },
      filters: {
        q, category, min_price, max_price, rating, in_stock, featured, vendor
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const query = `
      SELECT DISTINCT
        p.name as product_name,
        c.name as category_name,
        v.business_name as vendor_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.is_active = true AND (
        p.name ILIKE $1 OR
        c.name ILIKE $1 OR
        v.business_name ILIKE $1
      )
      LIMIT 10
    `;
    
    const result = await pool.query(query, [`%${q}%`]);
    
    const suggestions = result.rows.map(row => ({
      type: 'product',
      text: row.product_name,
      category: row.category_name,
      vendor: row.vendor_name
    }));
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get popular searches
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const query = `
      SELECT 
        search_query,
        COUNT(*) as search_count,
        AVG(results_count) as avg_results
      FROM search_history
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user search history
router.get('/history', authenticateToken, async (req: any, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const query = `
      SELECT 
        search_query,
        filters,
        results_count,
        created_at
      FROM search_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [req.user.id, limit]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear search history
router.delete('/history', authenticateToken, async (req: any, res) => {
  try {
    const query = 'DELETE FROM search_history WHERE user_id = $1';
    await pool.query(query, [req.user.id]);
    
    res.json({ message: 'Search history cleared successfully' });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get search analytics (admin only)
router.get('/analytics', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { days = 30 } = req.query;
    
    // Popular searches
    const popularQuery = `
      SELECT 
        search_query,
        COUNT(*) as search_count,
        AVG(results_count) as avg_results
      FROM search_history
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT 20
    `;
    
    const popularResult = await pool.query(popularQuery);
    
    // Search trends
    const trendsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as searches,
        COUNT(DISTINCT user_id) as unique_users
      FROM search_history
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    const trendsResult = await pool.query(trendsQuery);
    
    // Zero result searches
    const zeroResultsQuery = `
      SELECT 
        search_query,
        COUNT(*) as count
      FROM search_history
      WHERE results_count = 0 AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY search_query
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const zeroResultsResult = await pool.query(zeroResultsQuery);
    
    res.json({
      popular_searches: popularResult.rows,
      search_trends: trendsResult.rows,
      zero_result_searches: zeroResultsResult.rows
    });
  } catch (error) {
    console.error('Get search analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
