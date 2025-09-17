import express from 'express';
import { pool } from '../database/connection';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user location
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const query = `
      SELECT * FROM user_locations 
      WHERE user_id = $1 AND is_current = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No location found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user location
router.post('/me', authenticateToken, async (req: any, res) => {
  try {
    const { latitude, longitude, city, country, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Mark all previous locations as not current
    await pool.query(
      'UPDATE user_locations SET is_current = false WHERE user_id = $1',
      [req.user.id]
    );

    // Insert new location
    const query = `
      INSERT INTO user_locations (user_id, latitude, longitude, city, country, address, is_current)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `;

    const values = [req.user.id, latitude, longitude, city, country, address];
    const result = await pool.query(query, values);

    // Create notification for location update
    const notificationQuery = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, 'location_update', 'Location Updated', 'Your location has been updated successfully', $2)
    `;

    const notificationData = {
      latitude,
      longitude,
      city,
      country,
      address,
      timestamp: new Date().toISOString()
    };

    await pool.query(notificationQuery, [req.user.id, JSON.stringify(notificationData)]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Update user location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location history
router.get('/history', authenticateToken, async (req: any, res) => {
  try {
    const query = `
      SELECT * FROM user_locations 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
