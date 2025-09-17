import express from 'express';
import { pool } from '../database/connection';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get all partners
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM partners 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get partner by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM partners WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create partner (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      name_ar,
      description,
      description_ar,
      logo_url,
      website_url,
      contact_email,
      contact_phone
    } = req.body;

    const query = `
      INSERT INTO partners (name, name_ar, description, description_ar, logo_url, website_url, contact_email, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [name, name_ar, description, description_ar, logo_url, website_url, contact_email, contact_phone];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update partner (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      name_ar,
      description,
      description_ar,
      logo_url,
      website_url,
      contact_email,
      contact_phone,
      is_active
    } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (name_ar !== undefined) {
      fields.push(`name_ar = $${paramCount++}`);
      values.push(name_ar);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (description_ar !== undefined) {
      fields.push(`description_ar = $${paramCount++}`);
      values.push(description_ar);
    }
    if (logo_url !== undefined) {
      fields.push(`logo_url = $${paramCount++}`);
      values.push(logo_url);
    }
    if (website_url !== undefined) {
      fields.push(`website_url = $${paramCount++}`);
      values.push(website_url);
    }
    if (contact_email !== undefined) {
      fields.push(`contact_email = $${paramCount++}`);
      values.push(contact_email);
    }
    if (contact_phone !== undefined) {
      fields.push(`contact_phone = $${paramCount++}`);
      values.push(contact_phone);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE partners 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete partner (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM partners WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
