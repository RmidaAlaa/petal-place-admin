import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV !== 'production';

let pool: any;

if (isDevelopment) {
  console.log('Using in-memory database for development');

  // Create default admin user for testing
  const defaultAdmin = {
    id: 'admin-1',
    email: 'admin@rosesgarden.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // This is bcrypt hash for 'admin123'
    first_name: 'Admin',
    last_name: 'User',
    phone: '+966501234567',
    role: 'admin',
    is_active: true,
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Mock pool object for compatibility
  pool = {
    query: async (text: string, params: any[] = []) => {
      console.log('Mock query:', text.substring(0, 100) + '...');

      // Handle user queries
      if (text.includes('SELECT') && text.includes('users') && text.includes('email =')) {
        const email = params[0];
        if (email === 'admin@rosesgarden.com') {
          return { rows: [defaultAdmin] };
        }
        return { rows: [] };
      }

      if (text.includes('SELECT') && text.includes('users') && text.includes('id =')) {
        const id = params[0];
        if (id === 'admin-1') {
          return { rows: [defaultAdmin] };
        }
        return { rows: [] };
      }

      // Simple mock responses for common queries
      if (text.includes('SELECT') && text.includes('COUNT(*)')) {
        return { rows: [{ count: '0' }] };
      }

      if (text.includes('SELECT') && text.includes('products')) {
        return { rows: [] };
      }

      if (text.includes('INSERT')) {
        return { rows: [{ id: Date.now().toString() }] };
      }

      if (text.includes('UPDATE')) {
        return { rows: [{ id: params[params.length - 1] }] };
      }

      return { rows: [] };
    },
    connect: () => Promise.resolve(),
    end: () => Promise.resolve()
  };

  console.log('Default admin user created: admin@rosesgarden.com / admin123');

} else {
  // PostgreSQL setup for production
  const { Pool } = require('pg');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'petal_place',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  pool = new Pool(config);

  // Test the connection
  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
  });

  pool.on('error', (err: any) => {
    console.error('Database connection error:', err);
  });
}

export { pool };
export default pool;
