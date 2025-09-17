import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { pool } from '../database/connection';

const router = express.Router();

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Import products from CSV
router.post('/products', authenticateToken, requireAdmin, upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const results: any[] = [];
    const stream = Readable.from(req.file.buffer);
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let importedCount = 0;
          let errorCount = 0;
          const errors: string[] = [];

          for (const row of results) {
            try {
              // Validate required fields
              if (!row.name || !row.price || !row.category) {
                errors.push(`Row ${importedCount + errorCount + 1}: Missing required fields (name, price, category)`);
                errorCount++;
                continue;
              }

              // Create or get category
              const categoryQuery = `
                INSERT INTO categories (name, slug, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (slug) DO UPDATE SET name = $1, description = $3
                RETURNING id
              `;
              const categorySlug = row.category.toLowerCase().replace(/\s+/g, '-');
              const categoryResult = await pool.query(categoryQuery, [
                row.category,
                categorySlug,
                row.category_description || `Products in ${row.category} category`
              ]);
              const categoryId = categoryResult.rows[0].id;

              // Create or get vendor if specified
              let vendorId = null;
              if (row.vendor) {
                const vendorQuery = `
                  INSERT INTO vendors (business_name, contact_email, contact_phone, address, city, is_verified)
                  VALUES ($1, $2, $3, $4, $5, $6)
                  ON CONFLICT (business_name) DO UPDATE SET contact_email = $2, contact_phone = $3
                  RETURNING id
                `;
                const vendorResult = await pool.query(vendorQuery, [
                  row.vendor,
                  row.vendor_email || null,
                  row.vendor_phone || null,
                  row.vendor_address || null,
                  row.vendor_city || 'Riyadh',
                  true
                ]);
                vendorId = vendorResult.rows[0].id;
              }

              // Create product
              const productSlug = row.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              const productQuery = `
                INSERT INTO products (
                  name, slug, description, price, original_price, currency,
                  image_url, images, category_id, vendor_id, stock_quantity,
                  is_featured, is_active, rating, review_count
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (slug) DO UPDATE SET
                  description = $3, price = $4, original_price = $5, image_url = $7,
                  images = $8, stock_quantity = $11, is_featured = $12, is_active = $13
                RETURNING id
              `;

              const productResult = await pool.query(productQuery, [
                row.name,
                productSlug,
                row.description || '',
                parseFloat(row.price),
                row.original_price ? parseFloat(row.original_price) : null,
                row.currency || 'SAR',
                row.image_url || null,
                row.images ? JSON.parse(row.images) : null,
                categoryId,
                vendorId,
                parseInt(row.stock_quantity || '10'),
                row.is_featured === 'true' || row.featured === 'true',
                row.is_active !== 'false' && row.active !== 'false',
                parseFloat(row.rating || '0'),
                parseInt(row.review_count || '0')
              ]);

              importedCount++;
            } catch (error: any) {
              errors.push(`Row ${importedCount + errorCount + 1}: ${error.message}`);
              errorCount++;
            }
          }

          res.json({
            message: 'Import completed',
            imported: importedCount,
            errors: errorCount,
            errorDetails: errors
          });
        } catch (error: any) {
          res.status(500).json({ error: 'Failed to process CSV data: ' + error.message });
        }
      })
      .on('error', (error) => {
        res.status(500).json({ error: 'Failed to parse CSV: ' + error.message });
      });
  } catch (error: any) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed: ' + error.message });
  }
});

// Get import template
router.get('/template', authenticateToken, requireAdmin, (req, res) => {
  const template = `name,description,price,original_price,currency,image_url,images,category,category_description,vendor,vendor_email,vendor_phone,vendor_address,vendor_city,stock_quantity,is_featured,is_active,rating,review_count
"Red Roses Bouquet","Beautiful red roses arranged in a stunning bouquet",150.00,200.00,SAR,"https://example.com/red-roses.jpg","[""https://example.com/red-roses.jpg"",""https://example.com/red-roses-2.jpg""]","Roses","Fresh and beautiful roses","Roses Garden","info@rosesgarden.com","+966501234567","123 Flower Street","Riyadh",50,true,true,4.5,120
"White Peonies","Elegant white peonies for special occasions",120.00,,SAR,"https://example.com/white-peonies.jpg","[""https://example.com/white-peonies.jpg""]","Peonies","Delicate and elegant peonies","Flower Paradise","contact@flowerparadise.com","+966509876543","456 Garden Ave","Jeddah",30,false,true,4.2,85
"Mixed Spring Flowers","Colorful mix of spring flowers",80.00,100.00,SAR,"https://example.com/spring-mix.jpg","[""https://example.com/spring-mix.jpg""]","Mixed Bouquets","Beautiful mixed flower arrangements","Bloom Studio","hello@bloomstudio.com","+966507654321","789 Nature St","Dammam",25,true,true,4.3,95`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products_template.csv"');
  res.send(template);
});

export default router;
