import express from 'express';
import { ProductModel } from '../models/Product';
import { authenticateToken, requireVendor, requireAdmin } from '../middleware/auth';
import { validateProduct, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category_id,
      vendor_id,
      min_price,
      max_price,
      is_featured,
      is_active,
      in_stock,
      sort_by,
      sort_order,
      limit,
      offset
    } = req.query;

    const filters = {
      search: search as string,
      category_id: category_id as string,
      vendor_id: vendor_id as string,
      min_price: min_price ? parseFloat(min_price as string) : undefined,
      max_price: max_price ? parseFloat(max_price as string) : undefined,
      is_featured: is_featured ? is_featured === 'true' : undefined,
      is_active: is_active ? is_active === 'true' : undefined,
      in_stock: in_stock === 'true',
      sort_by: sort_by as any,
      sort_order: sort_order as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    };

    const result = await ProductModel.findWithFilters(filters);
    res.json(result);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product (vendor/admin only)
router.post('/', authenticateToken, requireVendor, validateProduct, handleValidationErrors, async (req: any, res) => {
  try {
    const productData = {
      ...req.body,
      vendor_id: req.user.role === 'admin' ? req.body.vendor_id : req.user.id
    };

    const product = await ProductModel.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product (vendor/admin only)
router.put('/:id', authenticateToken, requireVendor, validateProduct, handleValidationErrors, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists and user has permission
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (req.user.role !== 'admin' && existingProduct.vendor_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const product = await ProductModel.update(id, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (vendor/admin only)
router.delete('/:id', authenticateToken, requireVendor, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists and user has permission
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (req.user.role !== 'admin' && existingProduct.vendor_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const success = await ProductModel.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor products
router.get('/vendor/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const products = await ProductModel.findByVendor(
      vendor_id,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(products);
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update stock
router.patch('/:id/stock', authenticateToken, requireVendor, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Check if product exists and user has permission
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (req.user.role !== 'admin' && existingProduct.vendor_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const success = await ProductModel.updateStock(id, quantity);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get low stock products (vendor/admin only)
router.get('/inventory/low-stock', authenticateToken, requireVendor, async (req: any, res) => {
  try {
    const vendor_id = req.user.role === 'admin' ? req.query.vendor_id : req.user.id;
    const products = await ProductModel.getLowStockProducts(vendor_id);
    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
