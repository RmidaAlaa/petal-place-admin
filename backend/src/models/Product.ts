import { pool } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  vendor_id: string;
  category_id?: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  min_stock_level: number;
  images: string[];
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductData {
  vendor_id: string;
  category_id?: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  original_price?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  images?: string[];
  features?: string[];
  is_featured?: boolean;
}

export interface UpdateProductData {
  name?: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price?: number;
  original_price?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  images?: string[];
  features?: string[];
  is_active?: boolean;
  is_featured?: boolean;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  vendor_id?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_active?: boolean;
  in_stock?: boolean;
  sort_by?: 'name' | 'price' | 'rating' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class ProductModel {
  static async create(productData: CreateProductData): Promise<Product> {
    const id = uuidv4();
    const {
      vendor_id,
      category_id,
      name,
      name_ar,
      description,
      description_ar,
      price,
      original_price,
      stock_quantity = 0,
      min_stock_level = 5,
      images = [],
      features = [],
      is_featured = false
    } = productData;

    const query = `
      INSERT INTO products (
        id, vendor_id, category_id, name, name_ar, description, description_ar,
        price, original_price, stock_quantity, min_stock_level, images, features, is_featured
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      id, vendor_id, category_id, name, name_ar, description, description_ar,
      price, original_price, stock_quantity, min_stock_level, JSON.stringify(images),
      JSON.stringify(features), is_featured
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByVendor(vendor_id: string, limit = 50, offset = 0): Promise<Product[]> {
    const query = `
      SELECT * FROM products 
      WHERE vendor_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [vendor_id, limit, offset]);
    return result.rows;
  }

  static async findWithFilters(filters: ProductFilters): Promise<{ products: Product[], total: number }> {
    const whereConditions = ['1=1'];
    const values: any[] = [];
    let paramCount = 0;

    if (filters.search) {
      paramCount++;
      whereConditions.push(`(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
    }

    if (filters.category_id) {
      paramCount++;
      whereConditions.push(`category_id = $${paramCount}`);
      values.push(filters.category_id);
    }

    if (filters.vendor_id) {
      paramCount++;
      whereConditions.push(`vendor_id = $${paramCount}`);
      values.push(filters.vendor_id);
    }

    if (filters.min_price !== undefined) {
      paramCount++;
      whereConditions.push(`price >= $${paramCount}`);
      values.push(filters.min_price);
    }

    if (filters.max_price !== undefined) {
      paramCount++;
      whereConditions.push(`price <= $${paramCount}`);
      values.push(filters.max_price);
    }

    if (filters.is_featured !== undefined) {
      paramCount++;
      whereConditions.push(`is_featured = $${paramCount}`);
      values.push(filters.is_featured);
    }

    if (filters.is_active !== undefined) {
      paramCount++;
      whereConditions.push(`is_active = $${paramCount}`);
      values.push(filters.is_active);
    }

    if (filters.in_stock) {
      whereConditions.push(`stock_quantity > 0`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Count query
    const countQuery = `SELECT COUNT(*) FROM products WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    paramCount++;
    values.push(limit);
    paramCount++;
    values.push(offset);

    const dataQuery = `
      SELECT * FROM products 
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await pool.query(dataQuery, values);
    return { products: result.rows, total };
  }

  static async update(id: string, productData: UpdateProductData): Promise<Product | null> {
    const fields = Object.keys(productData);
    const values = Object.values(productData);
    const setClause = fields.map((field, index) => {
      if (field === 'images' || field === 'features') {
        return `${field} = $${index + 2}::jsonb`;
      }
      return `${field} = $${index + 2}`;
    }).join(', ');

    const query = `
      UPDATE products 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const processedValues = values.map(value => {
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      return value;
    });

    const result = await pool.query(query, [id, ...processedValues]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM products WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  static async updateStock(id: string, quantity: number): Promise<boolean> {
    const query = 'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await pool.query(query, [quantity, id]);
    return result.rowCount > 0;
  }

  static async getLowStockProducts(vendor_id?: string): Promise<Product[]> {
    let query = `
      SELECT * FROM products 
      WHERE stock_quantity <= min_stock_level AND is_active = true
    `;
    const values: any[] = [];

    if (vendor_id) {
      query += ' AND vendor_id = $1';
      values.push(vendor_id);
    }

    query += ' ORDER BY stock_quantity ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async updateRating(id: string): Promise<void> {
    const query = `
      UPDATE products 
      SET rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = $1
      ),
      review_count = (
        SELECT COUNT(*) FROM reviews WHERE product_id = $1
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(query, [id]);
  }
}
