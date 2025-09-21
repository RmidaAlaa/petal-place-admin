# Roses Garden E-commerce Platform - Architecture & Design Document

## 📋 Overview
This document outlines the current architecture of the Roses Garden e-commerce platform and provides comprehensive recommendations for design patterns, scalability, security, and performance optimizations.

---

## 🏗️ Current Architecture Analysis

### Frontend Architecture
```
Frontend (React + TypeScript + Vite)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── delivery/       # Delivery-specific components
│   │   └── ...             # Feature-specific components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── CurrencyContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ...             # Additional contexts
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── Marketplace.tsx
│   │   ├── ContactUs.tsx
│   │   └── ...             # Additional pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   └── lib/                # Utility functions
```

### Backend Architecture
```
Backend (Node.js + Express + TypeScript)
├── src/
│   ├── database/           # Database configuration
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── types/              # Type definitions
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom design system
- **Internationalization**: Custom i18n solution
- **Authentication**: JWT-based authentication

---

## 🎯 Recommended Architecture Improvements

### 1. State Management Enhancement

#### Current State: Context API Only
```typescript
// Current approach - multiple contexts
const { state: authState } = useAuth();
const { state: cartState } = useCart();
const { language, setLanguage } = useLanguage();
```

#### Recommended: Zustand + React Query
```typescript
// Recommended approach
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useQuery } from '@tanstack/react-query';

const authStore = useAuthStore();
const cartStore = useCartStore();
const { data: products } = useQuery(['products'], fetchProducts);
```

**Benefits:**
- Centralized state management
- Better performance with selective subscriptions
- Built-in persistence
- Type-safe state updates
- Server state management with React Query

### 2. Component Architecture Improvement

#### Current: Mixed Component Patterns
```typescript
// Current mixed patterns
const Component = () => {
  // Mixed logic and presentation
};
```

#### Recommended: Atomic Design + Custom Hooks
```typescript
// Recommended: Atomic Design Pattern
// atoms/Button.tsx
// molecules/ProductCard.tsx
// organisms/ProductGrid.tsx
// templates/MarketplaceTemplate.tsx
// pages/MarketplacePage.tsx

// Custom hooks for logic separation
const useProductSearch = (query: string) => {
  return useQuery(['products', query], () => searchProducts(query));
};
```

### 3. API Layer Enhancement

#### Current: Direct Fetch Calls
```typescript
// Current approach
const response = await fetch('/api/products');
```

#### Recommended: Axios + React Query + Error Handling
```typescript
// Recommended: Centralized API layer
class ApiClient {
  private baseURL: string;

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`);
      return response.data;
    } catch (error) {
      throw new ApiError(error);
    }
  }
}

// React Query integration
const useProducts = () => {
  return useQuery(['products'], () => apiClient.get<Product[]>('/products'), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 4. Database Architecture Improvement

#### Current: Basic Supabase Setup
#### Recommended: Advanced Supabase Architecture
```sql
-- Recommended: Row Level Security (RLS)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Recommended: Database Functions
CREATE OR REPLACE FUNCTION calculate_order_total(order_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM order_items
    WHERE order_id = $1
  );
END;
$$ LANGUAGE plpgsql;
```

### 5. Authentication & Authorization Enhancement

#### Current: Basic JWT
#### Recommended: Role-Based Access Control (RBAC)
```typescript
// Recommended: Permission-based system
interface UserPermissions {
  dashboard: {
    overview: boolean;
    analytics: boolean;
    reports: boolean;
  };
  userManagement: {
    viewUsers: boolean;
    createUsers: boolean;
    editUsers: boolean;
    deleteUsers: boolean;
  };
  // ... other permissions
}

// Middleware for route protection
const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions;
    if (!userPermissions?.[permission]) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
};
```

---

## 🚀 Scalability Recommendations

### 1. Micro-Frontend Architecture
```
Main App (Shell)
├── Marketplace (MFE)
├── Admin Dashboard (MFE)
├── Bouquet Builder (MFE)
└── User Management (MFE)
```

**Benefits:**
- Independent deployment
- Technology flexibility
- Team autonomy
- Performance optimization

### 2. Backend Service Architecture
```
API Gateway
├── Auth Service
├── Product Service
├── Order Service
├── Payment Service
├── Notification Service
└── Analytics Service
```

### 3. Caching Strategy
```typescript
// Multi-level caching
const cacheStrategy = {
  level1: 'Redis (Session data)',      // 1-5 minutes
  level2: 'CDN (Static assets)',       // 1-24 hours
  level3: 'Database (Computed data)',  // 1-7 days
  level4: 'External APIs'              // API-specific
};
```

### 4. Database Optimization
```sql
-- Recommended: Database Indexing Strategy
CREATE INDEX CONCURRENTLY idx_orders_user_status_created
ON orders (user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_products_category_price
ON products (category_id, price) WHERE active = true;

-- Partitioning for large tables
CREATE TABLE orders_2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

---

## 🔒 Security Enhancements

### 1. Advanced Authentication
```typescript
// Multi-factor authentication
interface MFAOptions {
  sms: boolean;
  email: boolean;
  authenticator: boolean;
  biometric: boolean;
}

// Session management
const sessionConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
};
```

### 2. API Security
```typescript
// Rate limiting
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
};

// Input validation
const validationSchema = {
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required(),
  phone: Joi.string().pattern(/^\+966\d{9}$/)
};
```

### 3. Data Protection
```typescript
// Data encryption at rest
const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16
};

// Secure headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

---

## ⚡ Performance Optimizations

### 1. Frontend Performance
```typescript
// Code splitting
const routes = [
  { path: '/admin', component: lazy(() => import('./pages/AdminDashboard')) },
  { path: '/builder', component: lazy(() => import('./components/BouquetBuilder')) }
];

// Image optimization
const ImageComponent = ({ src, alt, width, height }) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    loading="lazy"
    decoding="async"
    srcSet={`${src}?w=400 400w, ${src}?w=800 800w, ${src}?w=1200 1200w`}
  />
);
```

### 2. Backend Performance
```typescript
// Query optimization
const optimizedQuery = `
  SELECT o.id, o.total, o.status, o.created_at,
         json_agg(oi.*) as items
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  WHERE o.user_id = $1 AND o.created_at >= $2
  GROUP BY o.id
  ORDER BY o.created_at DESC
  LIMIT $3
`;

// Connection pooling
const poolConfig = {
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

### 3. Monitoring & Analytics
```typescript
// Performance monitoring
const monitoringConfig = {
  metrics: ['response_time', 'error_rate', 'throughput'],
  alerts: {
    errorRate: { threshold: 0.05, window: '5m' },
    responseTime: { threshold: 1000, window: '1m' }
  }
};

// Real user monitoring (RUM)
const rumConfig = {
  sampleRate: 0.1,
  enabled: true,
  trackComponents: true
};
```

---

## 🛠️ Development Workflow Improvements

### 1. CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v2
      - run: aws s3 sync dist/ s3://roses-garden-app
```

### 2. Code Quality Tools
```json
// .eslintrc.js
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    '@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'prefer-const': 'error'
  }
};
```

### 3. Testing Strategy
```typescript
// Testing structure
describe('ProductCard Component', () => {
  test('renders product information correctly', () => {
    // Arrange
    const product = { id: 1, name: 'Rose Bouquet', price: 50 };

    // Act
    render(<ProductCard product={product} />);

    // Assert
    expect(screen.getByText('Rose Bouquet')).toBeInTheDocument();
  });

  test('handles add to cart click', () => {
    // Integration test with context
  });

  test('displays loading state', () => {
    // Component state testing
  });
});
```

---

## 📊 Monitoring & Analytics Architecture

### 1. Application Performance Monitoring (APM)
```typescript
// APM Integration
const apmConfig = {
  serviceName: 'roses-garden-frontend',
  serverUrl: 'https://apm-server.example.com',
  environment: process.env.NODE_ENV
};
```

### 2. Error Tracking
```typescript
// Error boundary with reporting
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    errorTracker.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
}
```

### 3. User Analytics
```typescript
// User behavior tracking
const analytics = {
  trackPageView: (page: string) => {
    analytics.track('page_view', { page });
  },

  trackUserAction: (action: string, properties: Record<string, any>) => {
    analytics.track('user_action', { action, ...properties });
  },

  trackConversion: (conversionType: string, value: number) => {
    analytics.track('conversion', { conversionType, value });
  }
};
```

---

## 🚀 Deployment Architecture

### 1. Containerization Strategy
```dockerfile
# Multi-stage Docker build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Infrastructure as Code
```terraform
# AWS Infrastructure
resource "aws_s3_bucket" "app_bucket" {
  bucket = "roses-garden-app"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_cloudfront_distribution" "app_distribution" {
  origin {
    domain_name = aws_s3_bucket.app_bucket.website_endpoint
    origin_id   = "S3-roses-garden-app"
  }

  enabled             = true
  default_root_object = "index.html"
}
```

### 3. Environment Configuration
```yaml
# Docker Compose for development
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
      - REACT_APP_ENVIRONMENT=development

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@localhost:5432/roses_garden
      - JWT_SECRET=development-secret

  database:
    image: postgres:14
    environment:
      - POSTGRES_DB=roses_garden
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
```

---

## 📈 Success Metrics & KPIs

### Performance Metrics
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 500KB gzipped

### User Experience Metrics
- **User Satisfaction Score**: > 4.5/5
- **Task Completion Rate**: > 95%
- **Error Rate**: < 1%
- **Mobile Usage**: > 60% of traffic

### Business Metrics
- **Conversion Rate**: > 3%
- **Average Order Value**: > SAR 150
- **Customer Retention**: > 70%
- **Load Time Impact**: < 0.5% conversion loss per 1s delay

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Implement state management improvements
- [ ] Add error boundaries and error tracking
- [ ] Set up monitoring and analytics
- [ ] Implement basic performance optimizations

### Phase 2: Enhancement (Weeks 5-8)
- [ ] Add advanced caching strategies
- [ ] Implement security enhancements
- [ ] Add comprehensive testing
- [ ] Optimize database queries

### Phase 3: Scale (Weeks 9-12)
- [ ] Implement micro-frontend architecture
- [ ] Add service decomposition
- [ ] Set up CI/CD pipeline
- [ ] Implement monitoring and alerting

### Phase 4: Optimization (Weeks 13-16)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Scalability testing
- [ ] Documentation completion

---

## 📝 Best Practices Checklist

### Frontend Development
- [ ] Use TypeScript for type safety
- [ ] Implement proper error boundaries
- [ ] Use React.memo for performance
- [ ] Implement lazy loading for routes
- [ ] Use custom hooks for logic separation
- [ ] Follow atomic design principles
- [ ] Implement proper loading states
- [ ] Use CSS-in-JS or styled-components
- [ ] Implement proper accessibility
- [ ] Use proper SEO meta tags

### Backend Development
- [ ] Use proper HTTP status codes
- [ ] Implement input validation
- [ ] Use proper error handling
- [ ] Implement rate limiting
- [ ] Use proper logging
- [ ] Implement health checks
- [ ] Use environment variables
- [ ] Implement proper authentication
- [ ] Use proper authorization
- [ ] Implement proper testing

### Database Design
- [ ] Use proper indexing
- [ ] Implement proper relationships
- [ ] Use proper data types
- [ ] Implement proper constraints
- [ ] Use proper naming conventions
- [ ] Implement proper backup strategy
- [ ] Use proper migration strategy
- [ ] Implement proper security
- [ ] Use proper performance optimization
- [ ] Implement proper monitoring

### DevOps & Deployment
- [ ] Use proper CI/CD pipeline
- [ ] Implement proper testing
- [ ] Use proper containerization
- [ ] Implement proper orchestration
- [ ] Use proper monitoring
- [ ] Implement proper logging
- [ ] Use proper backup strategy
- [ ] Implement proper security
- [ ] Use proper scalability
- [ ] Implement proper disaster recovery

---

## 🏗️ Architecture Diagrams

### Current System Architecture
```mermaid
graph TB
    A[Frontend - React] --> B[Backend - Express]
    B --> C[Database - Supabase]
    A --> D[External APIs]
    B --> D

    subgraph Frontend
        A1[Components] --> A2[Context API]
        A2 --> A3[Services]
        A3 --> A4[API Calls]
    end

    subgraph Backend
        B1[Routes] --> B2[Controllers]
        B2 --> B3[Services]
        B3 --> B4[Database]
    end
```

### Recommended System Architecture
```mermaid
graph TB
    A[Frontend - React] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[Product Service]
    B --> E[Order Service]
    B --> F[Payment Service]
    B --> G[Notification Service]

    C --> H[(User DB)]
    D --> I[(Product DB)]
    E --> J[(Order DB)]
    F --> K[(Payment DB)]
    G --> L[(Notification DB)]

    M[Admin Dashboard] --> B
    N[Mobile App] --> B
    O[External APIs] --> B

    subgraph Caching
        P[Redis Cache]
        Q[CDN]
    end

    subgraph Monitoring
        R[APM]
        S[Error Tracking]
        T[Analytics]
    end
```

### Data Flow Architecture
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Cache
    participant A as API Gateway
    participant S as Services
    participant D as Database

    U->>F: User Action
    F->>C: Check Cache
    C-->>F: Cache Hit/Miss
    F->>A: API Request
    A->>S: Route to Service
    S->>D: Database Query
    D-->>S: Query Result
    S-->>A: Service Response
    A-->>F: API Response
    F->>C: Update Cache
    F-->>U: UI Update
```

### Deployment Architecture
```mermaid
graph TB
    A[Git Repository] --> B[CI/CD Pipeline]
    B --> C[Build & Test]
    C --> D{Environment}
    D -->|Development| E[Dev Server]
    D -->|Staging| F[Staging Server]
    D -->|Production| G[Production Server]

    G --> H[Load Balancer]
    H --> I[App Server 1]
    H --> J[App Server 2]
    H --> K[App Server 3]

    I --> L[(Database)]
    J --> L
    K --> L

    M[CDN] --> H
    N[Monitoring] --> H
```

---

## 🎯 Conclusion

This architecture document provides a comprehensive roadmap for scaling the Roses Garden e-commerce platform from its current state to a production-ready, enterprise-grade application. The recommendations focus on performance, security, scalability, and maintainability while maintaining the current feature set and user experience.

**Key Priorities:**
1. **State Management**: Migrate to Zustand + React Query
2. **Performance**: Implement caching and optimization strategies
3. **Security**: Add comprehensive security measures
4. **Scalability**: Prepare for future growth with microservices
5. **Monitoring**: Implement comprehensive monitoring and analytics

The implementation should follow the phased approach outlined above, starting with foundation improvements and gradually moving to more advanced optimizations.

---

*This document will be updated as the platform evolves and new requirements emerge.*