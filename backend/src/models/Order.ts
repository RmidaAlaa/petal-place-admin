import { pool } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface Address {
  street: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: Address;
  billing_address?: Address;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_intent_id?: string;
  notes?: string;
  tracking_number?: string;
  estimated_delivery?: Date;
  delivered_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface CreateOrderData {
  user_id: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  shipping_address: Address;
  billing_address?: Address;
  payment_method?: string;
  notes?: string;
}

export interface UpdateOrderData {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_intent_id?: string;
  tracking_number?: string;
  estimated_delivery?: Date;
  delivered_at?: Date;
  notes?: string;
}

export class OrderModel {
  static async create(orderData: CreateOrderData): Promise<Order> {
    const { user_id, items, shipping_address, billing_address, payment_method, notes } = orderData;
    const id = uuidv4();
    const order_number = `PP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create order
      const orderQuery = `
        INSERT INTO orders (
          id, user_id, order_number, total_amount, shipping_address, 
          billing_address, payment_method, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const orderValues = [
        id, user_id, order_number, total_amount, 
        JSON.stringify(shipping_address),
        billing_address ? JSON.stringify(billing_address) : null,
        payment_method, notes
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        const itemId = uuidv4();
        const total_price = item.unit_price * item.quantity;

        const itemQuery = `
          INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(itemQuery, [
          itemId, id, item.product_id, item.quantity, item.unit_price, total_price
        ]);
      }

      await client.query('COMMIT');
      return order;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByOrderNumber(order_number: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result = await pool.query(query, [order_number]);
    return result.rows[0] || null;
  }

  static async findByUser(user_id: string, limit = 50, offset = 0): Promise<Order[]> {
    const query = `
      SELECT * FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async getAll(filters: {
    status?: string;
    payment_status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ orders: Order[], total: number }> {
    const whereConditions = ['1=1'];
    const values: (string | number)[] = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      whereConditions.push(`status = $${paramCount}`);
      values.push(filters.status);
    }

    if (filters.payment_status) {
      paramCount++;
      whereConditions.push(`payment_status = $${paramCount}`);
      values.push(filters.payment_status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Count query
    const countQuery = `SELECT COUNT(*) FROM orders WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    paramCount++;
    values.push(limit);
    paramCount++;
    values.push(offset);

    const dataQuery = `
      SELECT * FROM orders 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await pool.query(dataQuery, values);
    return { orders: result.rows, total };
  }

  static async update(id: string, orderData: UpdateOrderData): Promise<Order | null> {
    const fields = Object.keys(orderData);
    const values = Object.values(orderData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const query = `
      UPDATE orders 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  static async getOrderItems(order_id: string): Promise<OrderItem[]> {
    const query = `
      SELECT oi.*, p.name as product_name, p.images
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const result = await pool.query(query, [order_id]);
    return result.rows;
  }

  static async getOrderWithItems(order_id: string): Promise<{ order: Order, items: OrderItem[] } | null> {
    const order = await this.findById(order_id);
    if (!order) return null;

    const items = await this.getOrderItems(order_id);
    return { order, items };
  }

  static async getOrderStats(): Promise<{
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    completed_orders: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN status IN ('pending', 'confirmed', 'processing', 'shipped') THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders
      FROM orders
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async getRecentOrders(limit = 10): Promise<Order[]> {
    const query = `
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}
