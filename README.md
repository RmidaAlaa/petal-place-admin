# Petal Place - Flower Marketplace Admin

A comprehensive flower marketplace application with admin dashboard, built with React, TypeScript, and Node.js.

## 🌸 Features

### Core Features
- **🔐 Authentication System**: Login, register, forgot password with role-based access
- **👤 User Management**: Admin and user roles with profile management
- **🛒 Shopping Cart**: Add to cart, checkout with Stripe payment integration
- **💳 Payment Processing**: Stripe integration with webhook support
- **📦 Product Management**: CRUD operations for products, categories, vendors
- **🤝 Partners Management**: Manage business partners and suppliers
- **📍 Location Services**: Automatic geolocation with user consent
- **📸 Image Upload**: Product images, partner logos, user avatars
- **📊 Admin Dashboard**: Analytics, order management, user overview
- **🎨 Bouquet Builder**: Drag-and-drop bouquet creation tool
- **⭐ Favorites System**: Save favorite products
- **🔍 Search & Filters**: Advanced product filtering and search
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS

### Admin Features
- **📈 Analytics Dashboard**: Sales metrics, order statistics, user analytics
- **📋 Order Management**: View, update, and track orders
- **👥 User Management**: Manage customer accounts and admin users
- **📦 Product Import**: CSV import system for bulk product uploads
- **🏪 Vendor Management**: Manage flower suppliers and vendors
- **🤝 Partner Management**: Manage business partners
- **🖼️ Media Management**: Upload and manage product images

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RmidaAlaa/petal-place-admin.git
   cd petal-place-admin
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb petal_place
   
   # Run the schema
   psql petal_place < backend/src/database/schema.sql
   ```

4. **Configure environment variables**
   ```bash
   # Copy environment files
   cp env.example .env
   cp backend/env.example backend/.env
   
   # Edit the .env files with your configuration
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Admin Dashboard: http://localhost:5173/admin

## 👥 Default Users

The system comes with pre-configured users:

- **Admin**: `admin@admin.com` / `0000`
- **User**: `user@user.com` / `1111`

## 📁 Project Structure

```
petal-place-admin/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── AuthModal.tsx        # Authentication modal
│   │   ├── BouquetBuilder.tsx   # Bouquet creation tool
│   │   ├── CartSidebar.tsx      # Shopping cart
│   │   └── ...
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── CartContext.tsx      # Shopping cart state
│   ├── pages/                   # Page components
│   │   ├── Admin.tsx            # Admin dashboard
│   │   ├── Marketplace.tsx      # Product marketplace
│   │   └── ...
│   ├── services/                # API services
│   │   └── api.ts               # API client
│   └── ...
├── backend/                     # Backend source code
│   ├── src/
│   │   ├── database/            # Database configuration
│   │   ├── models/              # Data models
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Express middleware
│   │   └── server.ts            # Main server file
│   └── ...
└── ...
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Petal Place
```

#### Backend (backend/.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/petal_place
DB_HOST=localhost
DB_PORT=5432
DB_NAME=petal_place
DB_USER=username
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (vendor/admin)
- `PUT /api/products/:id` - Update product (vendor/admin)
- `DELETE /api/products/:id` - Delete product (vendor/admin)
- `PATCH /api/products/:id/stock` - Update stock
- `GET /api/products/inventory/low-stock` - Get low stock products

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (admin)
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `PATCH /api/orders/:id/payment` - Update payment status (admin)
- `GET /api/orders/stats/overview` - Get order statistics (admin)

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript
npm start            # Start production server
npm test             # Run tests
```

### Database Migrations

The database schema is defined in `backend/src/database/schema.sql`. To apply changes:

```bash
psql petal_place < backend/src/database/schema.sql
```

## 🧪 Testing

### Frontend Testing
```bash
npm run test         # Run frontend tests
npm run test:coverage # Run tests with coverage
```

### Backend Testing
```bash
cd backend
npm test             # Run backend tests
npm run test:watch   # Run tests in watch mode
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in your hosting platform

### Backend Deployment (Railway/Heroku)
1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy the backend folder
4. Run database migrations

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📊 Admin Features

### Dashboard
- Real-time order statistics
- Revenue tracking
- Low stock alerts
- Recent orders management

### Product Management
- Add/edit/delete products
- Inventory tracking
- Image upload
- Category management

### Order Management
- View all orders
- Update order status
- Track shipments
- Handle refunds

## 🔐 User Roles

### Customer
- Browse products
- Create custom bouquets
- Place orders
- Manage profile

### Vendor
- Manage products
- View orders
- Update inventory
- Access vendor dashboard

### Admin
- Full system access
- User management
- Order management
- Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@petalplace.com or create an issue in the repository.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Express.js](https://expressjs.com/) - Backend framework
- [PostgreSQL](https://www.postgresql.org/) - Database