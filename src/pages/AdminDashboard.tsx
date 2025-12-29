import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import EmailManager from '@/components/EmailManager';
import DiscountsManager from '@/pages/DiscountsManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  Plus,
  Upload,
  Edit,
  Trash2,
  UserPlus,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Truck,
  Calendar,
  Phone,
  Mail,
  Building,
  User,
  RefreshCw,
  FileText,
  Megaphone,
  Percent,
  Bell,
  Settings
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import DeliveryTimeline from '@/components/delivery/DeliveryTimeline';
import AdminOrderManagement from '@/components/AdminOrderManagement';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useDropzone } from 'react-dropzone';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
  image: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive';
  address?: string;
  joinDate: string;
}

interface Partner {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  type: 'supplier' | 'vendor' | 'distributor';
  status: 'active' | 'inactive';
  totalOrders: number;
  totalRevenue: number;
  joinDate: string;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'vendor';
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastLogin?: string;
  permissions: UserPermissions;
}

interface UserPermissions {
  // Dashboard Access
  dashboard: {
    overview: boolean;
    analytics: boolean;
    reports: boolean;
  };

  // User Management
  userManagement: {
    viewUsers: boolean;
    createUsers: boolean;
    editUsers: boolean;
    deleteUsers: boolean;
    manageRoles: boolean;
  };

  // Product Management
  productManagement: {
    viewProducts: boolean;
    createProducts: boolean;
    editProducts: boolean;
    deleteProducts: boolean;
    manageCategories: boolean;
    manageInventory: boolean;
  };

  // Order Management
  orderManagement: {
    viewOrders: boolean;
    processOrders: boolean;
    updateOrderStatus: boolean;
    cancelOrders: boolean;
    viewAllOrders: boolean;
    manageRefunds: boolean;
  };

  // Customer Management
  customerManagement: {
    viewCustomers: boolean;
    editCustomerProfiles: boolean;
    viewCustomerHistory: boolean;
    manageCustomerSupport: boolean;
  };

  // Partner Management
  partnerManagement: {
    viewPartners: boolean;
    addPartners: boolean;
    editPartners: boolean;
    managePartnerPayments: boolean;
  };

  // Financial Features
  financial: {
    viewRevenue: boolean;
    manageInvoices: boolean;
    processPayments: boolean;
    viewFinancialReports: boolean;
    manageDiscounts: boolean;
  };

  // Communication
  communication: {
    sendEmails: boolean;
    manageEmailTemplates: boolean;
    sendAnnouncements: boolean;
    manageNotifications: boolean;
  };

  // System Settings
  systemSettings: {
    manageSettings: boolean;
    uploadLogo: boolean;
    manageIntegrations: boolean;
    viewSystemLogs: boolean;
  };
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  stockQuantity: string;
  images: File[];
  video?: File;
  isFeatured: boolean;
  isActive: boolean;
}

interface AnalyticsData {
  revenue: { date: string; amount: number }[];
  orders: { date: string; count: number }[];
  customers: { date: string; count: number }[];
  topProducts: { name: string; sales: number }[];
  salesByCategory: { name: string; value: number }[];
}

interface OrderDetails {
  id: string;
  customer: Customer;
  items: any[];
  total: number;
  status: string;
  tracking: {
    status: string;
    location: string;
    estimatedDelivery: string;
    updates: { timestamp: string; status: string; description: string }[];
  };
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  orderDate: string;
}

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/placeholder.svg');
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    // Profile Settings
    adminName: 'Admin User',
    adminEmail: 'admin@rosesgarden.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',

    // Website Settings
    siteName: 'Roses Garden',
    siteDescription: 'Premium Flowers & Gifts',
    contactEmail: 'info@rosesgarden.com',
    contactPhone: '+966 50 123 4567',
    address: 'Riyadh, Saudi Arabia',

    // Language & Currency
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar'],
    defaultCurrency: 'SAR',
    supportedCurrencies: ['SAR', 'USD', 'EUR'],

    // Business Settings
    businessHours: '9:00 AM - 10:00 PM',
    deliveryFee: '25',
    minimumOrder: '50',
    taxRate: '15',

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceMode: false
  });
  const [newUserPermissions, setNewUserPermissions] = useState<UserPermissions>({
    dashboard: { overview: true, analytics: false, reports: false },
    userManagement: { viewUsers: false, createUsers: false, editUsers: false, deleteUsers: false, manageRoles: false },
    productManagement: { viewProducts: false, createProducts: false, editProducts: false, deleteProducts: false, manageCategories: false, manageInventory: false },
    orderManagement: { viewOrders: false, processOrders: false, updateOrderStatus: false, cancelOrders: false, viewAllOrders: false, manageRefunds: false },
    customerManagement: { viewCustomers: false, editCustomerProfiles: false, viewCustomerHistory: false, manageCustomerSupport: false },
    partnerManagement: { viewPartners: false, addPartners: false, editPartners: false, managePartnerPayments: false },
    financial: { viewRevenue: false, manageInvoices: false, processPayments: false, viewFinancialReports: false, manageDiscounts: false },
    communication: { sendEmails: false, manageEmailTemplates: false, sendAnnouncements: false, manageNotifications: false },
    systemSettings: { manageSettings: false, uploadLogo: false, manageIntegrations: false, viewSystemLogs: false }
  });
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stockQuantity: '',
    images: [],
    isFeatured: false,
    isActive: true
  });

  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }

      // Fetch real data from admin-analytics edge function
      const { data, error } = await supabase.functions.invoke('admin-analytics', {
        body: {},
        headers: {},
      });

      // If edge function fails, use the URL params approach
      if (error || !data?.success) {
        console.log('Falling back to direct query for analytics');
        // Fallback: fetch directly from Supabase
        const periodMultiplier = selectedPeriod === '24h' ? 0.1 :
                                selectedPeriod === '7d' ? 1 :
                                selectedPeriod === '30d' ? 4.3 :
                                selectedPeriod === '90d' ? 13 : 1;

        // Fetch orders
        const { data: ordersData, count: ordersCount } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at, order_number', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('is_active', true);

        // Fetch customers count
        const { count: customersCount } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact' });

        const totalRevenue = (ordersData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);

        setStats({
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders: ordersCount || 0,
          totalCustomers: customersCount || 0,
          totalProducts: productsCount || 0,
          revenueGrowth: 0,
          ordersGrowth: 0,
          customersGrowth: 0,
          productsGrowth: 0
        });

        setRecentOrders((ordersData || []).map(o => ({
          id: o.order_number || o.id,
          customer: 'Customer',
          total: o.total_amount || 0,
          status: o.status as any,
          date: o.created_at,
          items: 1
        })));

        // Fetch top products
        const { data: topProductsData } = await supabase
          .from('products')
          .select('id, name, price, rating, review_count, images')
          .eq('is_active', true)
          .order('review_count', { ascending: false })
          .limit(5);

        setTopProducts((topProductsData || []).map(p => ({
          id: p.id,
          name: p.name,
          sales: p.review_count || 0,
          revenue: (p.price || 0) * (p.review_count || 1),
          rating: p.rating || 0,
          reviews: p.review_count || 0,
          image: Array.isArray(p.images) && p.images.length > 0 ? String(p.images[0]) : ''
        })));
      } else {
        // Use data from edge function
        setStats(data.stats);
        setRecentOrders(data.recentOrders.map((o: any) => ({
          ...o,
          items: 1
        })));
        setTopProducts(data.topProducts);
        
        if (data.analyticsData) {
          setAnalyticsData({
            revenue: data.analyticsData.revenue || [],
            orders: [],
            customers: [],
            topProducts: data.topProducts.map((p: any) => ({ name: p.name, sales: p.sales })),
            salesByCategory: data.analyticsData.salesByCategory || []
          });
        }
      }

      setCustomers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+966501234567',
          totalOrders: 12,
          totalSpent: 1250.00,
          lastOrder: '2024-01-15',
          status: 'active',
          address: '123 Main St, Riyadh',
          joinDate: '2023-06-15'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+966509876543',
          totalOrders: 8,
          totalSpent: 890.50,
          lastOrder: '2024-01-14',
          status: 'active',
          address: '456 Oak Ave, Jeddah',
          joinDate: '2023-08-22'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+966507654321',
          totalOrders: 3,
          totalSpent: 245.00,
          lastOrder: '2024-01-10',
          status: 'inactive',
          address: '789 Pine St, Dammam',
          joinDate: '2023-11-05'
        }
      ]);

      setPartners([
        {
          id: '1',
          name: 'Ahmed Al-Rashid',
          businessName: 'Flower Wholesale Co.',
          email: 'ahmed@flowerswholesale.com',
          phone: '+966501112233',
          address: 'Industrial Area, Riyadh',
          type: 'supplier',
          status: 'active',
          totalOrders: 45,
          totalRevenue: 125000.00,
          joinDate: '2023-03-15'
        },
        {
          id: '2',
          name: 'Fatima Al-Zahra',
          businessName: 'Elegant Arrangements',
          email: 'fatima@elegantarrangements.com',
          phone: '+966504445566',
          address: 'Business District, Jeddah',
          type: 'vendor',
          status: 'active',
          totalOrders: 28,
          totalRevenue: 89000.00,
          joinDate: '2023-07-22'
        }
      ]);

      setStaffUsers([
        {
          id: '1',
          name: 'Sarah Al-Mansouri',
          email: 'sarah@rosesgarden.com',
          role: 'manager',
          department: 'Operations',
          status: 'active',
          joinDate: '2023-01-15',
          lastLogin: '2024-01-15T10:30:00Z',
          permissions: {
            dashboard: { overview: true, analytics: true, reports: true },
            userManagement: { viewUsers: true, createUsers: true, editUsers: true, deleteUsers: false, manageRoles: false },
            productManagement: { viewProducts: true, createProducts: true, editProducts: true, deleteProducts: false, manageCategories: true, manageInventory: true },
            orderManagement: { viewOrders: true, processOrders: true, updateOrderStatus: true, cancelOrders: true, viewAllOrders: true, manageRefunds: false },
            customerManagement: { viewCustomers: true, editCustomerProfiles: true, viewCustomerHistory: true, manageCustomerSupport: true },
            partnerManagement: { viewPartners: true, addPartners: true, editPartners: true, managePartnerPayments: false },
            financial: { viewRevenue: true, manageInvoices: true, processPayments: false, viewFinancialReports: true, manageDiscounts: true },
            communication: { sendEmails: true, manageEmailTemplates: true, sendAnnouncements: true, manageNotifications: true },
            systemSettings: { manageSettings: false, uploadLogo: false, manageIntegrations: false, viewSystemLogs: false }
          }
        },
        {
          id: '2',
          name: 'Omar Al-Harbi',
          email: 'omar@rosesgarden.com',
          role: 'staff',
          department: 'Customer Service',
          status: 'active',
          joinDate: '2023-05-10',
          lastLogin: '2024-01-14T15:45:00Z',
          permissions: {
            dashboard: { overview: true, analytics: false, reports: false },
            userManagement: { viewUsers: false, createUsers: false, editUsers: false, deleteUsers: false, manageRoles: false },
            productManagement: { viewProducts: true, createProducts: false, editProducts: false, deleteProducts: false, manageCategories: false, manageInventory: true },
            orderManagement: { viewOrders: true, processOrders: true, updateOrderStatus: true, cancelOrders: false, viewAllOrders: false, manageRefunds: false },
            customerManagement: { viewCustomers: true, editCustomerProfiles: false, viewCustomerHistory: true, manageCustomerSupport: true },
            partnerManagement: { viewPartners: false, addPartners: false, editPartners: false, managePartnerPayments: false },
            financial: { viewRevenue: false, manageInvoices: false, processPayments: false, viewFinancialReports: false, manageDiscounts: false },
            communication: { sendEmails: true, manageEmailTemplates: false, sendAnnouncements: false, manageNotifications: true },
            systemSettings: { manageSettings: false, uploadLogo: false, manageIntegrations: false, viewSystemLogs: false }
          }
        }
      ]);

      // Generate dynamic analytics data based on period
      const dataPoints = selectedPeriod === '24h' ? 24 :
                        selectedPeriod === '7d' ? 7 :
                        selectedPeriod === '30d' ? 30 :
                        selectedPeriod === '90d' ? 12 : 7;

      const baseRevenue = selectedPeriod === '24h' ? 850 :
                         selectedPeriod === '7d' ? 8500 :
                         selectedPeriod === '30d' ? 35000 :
                         selectedPeriod === '90d' ? 105000 : 8500;

      const baseOrders = selectedPeriod === '24h' ? 1 :
                        selectedPeriod === '7d' ? 12 :
                        selectedPeriod === '30d' ? 50 :
                        selectedPeriod === '90d' ? 150 : 12;

      const generateDataPoints = (baseValue: number, variance: number = 0.2) => {
        return Array.from({ length: dataPoints }, (_, i) => {
          const variation = (Math.random() - 0.5) * variance * 2;
          return Math.round(baseValue * (1 + variation));
        });
      };

      const generateDateLabels = () => {
        const now = new Date();
        return Array.from({ length: dataPoints }, (_, i) => {
          const date = new Date(now);
          if (selectedPeriod === '24h') {
            date.setHours(now.getHours() - (dataPoints - 1 - i));
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          } else if (selectedPeriod === '7d') {
            date.setDate(now.getDate() - (dataPoints - 1 - i));
            return date.toISOString().split('T')[0];
          } else if (selectedPeriod === '30d') {
            date.setDate(now.getDate() - (dataPoints - 1 - i));
            return date.toISOString().split('T')[0];
          } else {
            date.setMonth(now.getMonth() - (dataPoints - 1 - i));
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          }
        });
      };

      const dateLabels = generateDateLabels();

      setAnalyticsData({
        revenue: dateLabels.map((date, i) => ({
          date,
          amount: generateDataPoints(baseRevenue)[i]
        })),
        orders: dateLabels.map((date, i) => ({
          date,
          count: generateDataPoints(baseOrders)[i]
        })),
        customers: dateLabels.map((date, i) => ({
          date,
          count: Math.round(generateDataPoints(baseOrders * 0.3)[i])
        })),
        topProducts: [
          { name: 'Red Rose Bouquet', sales: 145 },
          { name: 'Mixed Flower Arrangement', sales: 98 },
          { name: 'White Lily Bouquet', sales: 76 },
          { name: 'Tulip Collection', sales: 54 },
          { name: 'Orchid Special', sales: 43 }
        ],
        salesByCategory: [
          { name: 'Roses', value: 35 },
          { name: 'Mixed Bouquets', value: 28 },
          { name: 'Lilies', value: 20 },
          { name: 'Tulips', value: 12 },
          { name: 'Others', value: 5 }
        ]
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'shipped':
        return <Package className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
                <DialogTrigger asChild>
                  <button className="cursor-pointer">
                    <img
                      src={logoUrl}
                      alt="Company Logo"
                      className="h-10 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Logo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Upload new logo
                            </span>
                          </label>
                          <input
                            id="logo-upload"
                            name="logo-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setLogoUrl(url);
                                setIsLogoDialogOpen(false);
                              }
                            }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsLogoDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => setIsLogoDialogOpen(false)}>Save Logo</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={(value) => {
                setSelectedPeriod(value);
                loadDashboardData(); // Reload data when period changes
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stats.revenueGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={stats.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(stats.revenueGrowth)}%
                    </span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stats.ordersGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={stats.ordersGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(stats.ordersGrowth)}%
                    </span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stats.customersGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={stats.customersGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(stats.customersGrowth)}%
                    </span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stats.productsGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={stats.productsGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(stats.productsGrowth)}%
                    </span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-12">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="discounts">Discounts</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="partners">Partners</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <div className="font-medium">{order.id}</div>
                              <div className="text-sm text-muted-foreground">{order.customer}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatPrice(order.total)}</div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.sales} sales • {formatPrice(product.revenue)} revenue
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {analyticsData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Revenue Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={analyticsData.revenue}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`SAR ${value}`, 'Revenue']} />
                          <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Orders Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Orders Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.orders}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Sales by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Sales by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={analyticsData.salesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analyticsData.salesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.topProducts.map((product, index) => (
                          <div key={product.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">{product.sales} units sold</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatPrice(product.sales * 50)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Invoice Management</h3>
                <p className="text-muted-foreground mb-4">Create and manage invoices for your customers</p>
                <Button onClick={() => window.open('/invoice-manager', '_blank')}>
                  Open Invoice Manager
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="discounts" className="space-y-6">
              <DiscountsManager />
            </TabsContent>

            <TabsContent value="announcements" className="space-y-6">
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Announcements Management</h3>
                <p className="text-muted-foreground mb-4">Create and manage announcements for your website</p>
                <Button onClick={() => window.open('/announcements-manager', '_blank')}>
                  Open Announcements Manager
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <AdminOrderManagement />
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Product Management</CardTitle>
                    <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Product</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="product-name">Product Name</Label>
                              <Input
                                id="product-name"
                                placeholder="Enter product name"
                                value={productForm.name}
                                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="product-price">Price (SAR)</Label>
                              <Input
                                id="product-price"
                                type="number"
                                placeholder="0.00"
                                value={productForm.price}
                                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="product-original-price">Original Price (SAR)</Label>
                              <Input
                                id="product-original-price"
                                type="number"
                                placeholder="0.00"
                                value={productForm.originalPrice}
                                onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="product-category">Category</Label>
                              <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="roses">Roses</SelectItem>
                                  <SelectItem value="lilies">Lilies</SelectItem>
                                  <SelectItem value="tulips">Tulips</SelectItem>
                                  <SelectItem value="mixed">Mixed Bouquets</SelectItem>
                                  <SelectItem value="occasions">Occasions</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="product-stock">Stock Quantity</Label>
                              <Input
                                id="product-stock"
                                type="number"
                                placeholder="0"
                                value={productForm.stockQuantity}
                                onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="featured"
                                checked={productForm.isFeatured}
                                onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})}
                              />
                              <Label htmlFor="featured">Featured Product</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="active"
                                checked={productForm.isActive}
                                onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})}
                              />
                              <Label htmlFor="active">Active Product</Label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="product-description">Description</Label>
                              <Textarea
                                id="product-description"
                                placeholder="Enter product description"
                                rows={4}
                                value={productForm.description}
                                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              />
                            </div>

                            <div>
                              <Label>Product Images</Label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <div className="text-center">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <div className="mt-4">
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                      <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Upload product images
                                      </span>
                                    </label>
                                    <input
                                      id="image-upload"
                                      name="image-upload"
                                      type="file"
                                      className="sr-only"
                                      multiple
                                      accept="image/*"
                                      onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setProductForm({...productForm, images: files});
                                      }}
                                    />
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB each
                                  </p>
                                </div>
                                {productForm.images.length > 0 && (
                                  <div className="mt-4 grid grid-cols-2 gap-2">
                                    {productForm.images.map((file, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt={`Preview ${index + 1}`}
                                          className="w-full h-20 object-cover rounded"
                                        />
                                        <button
                                          type="button"
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                          onClick={() => {
                                            const newImages = productForm.images.filter((_, i) => i !== index);
                                            setProductForm({...productForm, images: newImages});
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label>Product Video (Optional)</Label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <div className="text-center">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <div className="mt-4">
                                    <label htmlFor="video-upload" className="cursor-pointer">
                                      <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Upload product video
                                      </span>
                                    </label>
                                    <input
                                      id="video-upload"
                                      name="video-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="video/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setProductForm({...productForm, video: file});
                                        }
                                      }}
                                    />
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    MP4, MOV up to 50MB
                                  </p>
                                </div>
                                {productForm.video && (
                                  <div className="mt-4">
                                    <video
                                      src={URL.createObjectURL(productForm.video)}
                                      controls
                                      className="w-full h-32 object-cover rounded"
                                    />
                                    <button
                                      type="button"
                                      className="mt-2 text-red-500 text-sm"
                                      onClick={() => setProductForm({...productForm, video: undefined})}
                                    >
                                      Remove video
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>Cancel</Button>
                          <Button onClick={() => setIsProductDialogOpen(false)}>Create Product</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                <Package className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">ID: {product.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>Roses</TableCell>
                          <TableCell>{formatPrice(product.revenue / product.sales)}</TableCell>
                          <TableCell>50</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Customer Management</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search customers..."
                          className="pl-8 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.totalOrders}</TableCell>
                          <TableCell>{formatPrice(customer.totalSpent)}</TableCell>
                          <TableCell>{new Date(customer.lastOrder).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="partners" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Partner Management</CardTitle>
                    <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Partner
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Partner</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="partner-name">Full Name</Label>
                            <Input id="partner-name" placeholder="Enter full name" />
                          </div>
                          <div>
                            <Label htmlFor="business-name">Business Name</Label>
                            <Input id="business-name" placeholder="Enter business name" />
                          </div>
                          <div>
                            <Label htmlFor="partner-email">Email</Label>
                            <Input id="partner-email" type="email" placeholder="Enter email" />
                          </div>
                          <div>
                            <Label htmlFor="partner-phone">Phone</Label>
                            <Input id="partner-phone" placeholder="Enter phone number" />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="partner-address">Address</Label>
                            <Textarea id="partner-address" placeholder="Enter business address" />
                          </div>
                          <div>
                            <Label htmlFor="partner-type">Partner Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="supplier">Supplier</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="distributor">Distributor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button variant="outline" onClick={() => setIsPartnerDialogOpen(false)}>Cancel</Button>
                          <Button onClick={() => setIsPartnerDialogOpen(false)}>Add Partner</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{partner.name}</div>
                              <div className="text-sm text-muted-foreground">ID: {partner.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {partner.businessName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">{partner.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {partner.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {partner.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{partner.totalOrders}</TableCell>
                          <TableCell>{formatPrice(partner.totalRevenue)}</TableCell>
                          <TableCell>
                            <Badge className={partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {partner.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Interactive Location Map</h3>
                    <p className="text-muted-foreground mb-4">
                      Manage all your store locations, galleries, warehouses, and offices from one central location.
                      Users can click on locations to get directions and view details.
                    </p>
                    <Button onClick={() => window.open('/contact', '_blank')}>
                      Open Location Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Staff & User Management</CardTitle>
                    <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New User Account</DialogTitle>
                        </DialogHeader>

                        <Tabs defaultValue="basic" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic Information</TabsTrigger>
                            <TabsTrigger value="permissions">Permissions</TabsTrigger>
                            <TabsTrigger value="features">Feature Access</TabsTrigger>
                          </TabsList>

                          <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="user-name">Full Name</Label>
                                <Input id="user-name" placeholder="Enter full name" />
                              </div>
                              <div>
                                <Label htmlFor="user-email">Email Address</Label>
                                <Input id="user-email" type="email" placeholder="Enter email address" />
                              </div>
                              <div>
                                <Label htmlFor="user-role">Role</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="staff">Staff Member</SelectItem>
                                    <SelectItem value="vendor">Vendor</SelectItem>
                                    <SelectItem value="florist">Florist</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="user-department">Department</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="operations">Operations</SelectItem>
                                    <SelectItem value="customer-service">Customer Service</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                    <SelectItem value="it">IT</SelectItem>
                                    <SelectItem value="warehouse">Warehouse</SelectItem>
                                    <SelectItem value="floristry">Floristry</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2">
                                <Label htmlFor="user-password">Initial Password</Label>
                                <Input id="user-password" type="password" placeholder="Enter initial password" />
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="permissions" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Dashboard Permissions */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Dashboard Access</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="dashboard-overview">Overview Dashboard</Label>
                                    <input
                                      type="checkbox"
                                      id="dashboard-overview"
                                      checked={newUserPermissions.dashboard.overview}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        dashboard: { ...newUserPermissions.dashboard, overview: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="dashboard-analytics">Analytics & Reports</Label>
                                    <input
                                      type="checkbox"
                                      id="dashboard-analytics"
                                      checked={newUserPermissions.dashboard.analytics}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        dashboard: { ...newUserPermissions.dashboard, analytics: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="dashboard-reports">Advanced Reports</Label>
                                    <input
                                      type="checkbox"
                                      id="dashboard-reports"
                                      checked={newUserPermissions.dashboard.reports}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        dashboard: { ...newUserPermissions.dashboard, reports: e.target.checked }
                                      })}
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              {/* User Management */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">User Management</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="user-view">View Users</Label>
                                    <input
                                      type="checkbox"
                                      id="user-view"
                                      checked={newUserPermissions.userManagement.viewUsers}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        userManagement: { ...newUserPermissions.userManagement, viewUsers: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="user-create">Create Users</Label>
                                    <input
                                      type="checkbox"
                                      id="user-create"
                                      checked={newUserPermissions.userManagement.createUsers}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        userManagement: { ...newUserPermissions.userManagement, createUsers: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="user-edit">Edit Users</Label>
                                    <input
                                      type="checkbox"
                                      id="user-edit"
                                      checked={newUserPermissions.userManagement.editUsers}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        userManagement: { ...newUserPermissions.userManagement, editUsers: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="user-delete">Delete Users</Label>
                                    <input
                                      type="checkbox"
                                      id="user-delete"
                                      checked={newUserPermissions.userManagement.deleteUsers}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        userManagement: { ...newUserPermissions.userManagement, deleteUsers: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="user-roles">Manage Roles</Label>
                                    <input
                                      type="checkbox"
                                      id="user-roles"
                                      checked={newUserPermissions.userManagement.manageRoles}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        userManagement: { ...newUserPermissions.userManagement, manageRoles: e.target.checked }
                                      })}
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Product Management */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Product Management</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="product-view">View Products</Label>
                                    <input
                                      type="checkbox"
                                      id="product-view"
                                      checked={newUserPermissions.productManagement.viewProducts}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        productManagement: { ...newUserPermissions.productManagement, viewProducts: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="product-create">Create Products</Label>
                                    <input
                                      type="checkbox"
                                      id="product-create"
                                      checked={newUserPermissions.productManagement.createProducts}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        productManagement: { ...newUserPermissions.productManagement, createProducts: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="product-edit">Edit Products</Label>
                                    <input
                                      type="checkbox"
                                      id="product-edit"
                                      checked={newUserPermissions.productManagement.editProducts}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        productManagement: { ...newUserPermissions.productManagement, editProducts: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="product-delete">Delete Products</Label>
                                    <input
                                      type="checkbox"
                                      id="product-delete"
                                      checked={newUserPermissions.productManagement.deleteProducts}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        productManagement: { ...newUserPermissions.productManagement, deleteProducts: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="product-categories">Manage Categories</Label>
                                    <input
                                      type="checkbox"
                                      id="product-categories"
                                      checked={newUserPermissions.productManagement.manageCategories}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        productManagement: { ...newUserPermissions.productManagement, manageCategories: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="product-inventory">Manage Inventory</Label>
                                    <input
                                      type="checkbox"
                                      id="product-inventory"
                                      checked={newUserPermissions.productManagement.manageInventory}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        productManagement: { ...newUserPermissions.productManagement, manageInventory: e.target.checked }
                                      })}
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Order Management */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Order Management</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="order-view">View Orders</Label>
                                    <input
                                      type="checkbox"
                                      id="order-view"
                                      checked={newUserPermissions.orderManagement.viewOrders}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        orderManagement: { ...newUserPermissions.orderManagement, viewOrders: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="order-process">Process Orders</Label>
                                    <input
                                      type="checkbox"
                                      id="order-process"
                                      checked={newUserPermissions.orderManagement.processOrders}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        orderManagement: { ...newUserPermissions.orderManagement, processOrders: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="order-status">Update Order Status</Label>
                                    <input
                                      type="checkbox"
                                      id="order-status"
                                      checked={newUserPermissions.orderManagement.updateOrderStatus}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        orderManagement: { ...newUserPermissions.orderManagement, updateOrderStatus: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="order-cancel">Cancel Orders</Label>
                                    <input
                                      type="checkbox"
                                      id="order-cancel"
                                      checked={newUserPermissions.orderManagement.cancelOrders}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        orderManagement: { ...newUserPermissions.orderManagement, cancelOrders: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="order-all">View All Orders</Label>
                                    <input
                                      type="checkbox"
                                      id="order-all"
                                      checked={newUserPermissions.orderManagement.viewAllOrders}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        orderManagement: { ...newUserPermissions.orderManagement, viewAllOrders: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="order-refunds">Manage Refunds</Label>
                                    <input
                                      type="checkbox"
                                      id="order-refunds"
                                      checked={newUserPermissions.orderManagement.manageRefunds}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        orderManagement: { ...newUserPermissions.orderManagement, manageRefunds: e.target.checked }
                                      })}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="features" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Customer Management */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Customer Management</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="customer-view">View Customers</Label>
                                    <input
                                      type="checkbox"
                                      id="customer-view"
                                      checked={newUserPermissions.customerManagement.viewCustomers}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        customerManagement: { ...newUserPermissions.customerManagement, viewCustomers: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="customer-edit">Edit Customer Profiles</Label>
                                    <input
                                      type="checkbox"
                                      id="customer-edit"
                                      checked={newUserPermissions.customerManagement.editCustomerProfiles}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        customerManagement: { ...newUserPermissions.customerManagement, editCustomerProfiles: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="customer-history">View Customer History</Label>
                                    <input
                                      type="checkbox"
                                      id="customer-history"
                                      checked={newUserPermissions.customerManagement.viewCustomerHistory}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        customerManagement: { ...newUserPermissions.customerManagement, viewCustomerHistory: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="customer-support">Manage Customer Support</Label>
                                    <input
                                      type="checkbox"
                                      id="customer-support"
                                      checked={newUserPermissions.customerManagement.manageCustomerSupport}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        customerManagement: { ...newUserPermissions.customerManagement, manageCustomerSupport: e.target.checked }
                                      })}
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Financial Features */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Financial Features</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="financial-revenue">View Revenue</Label>
                                    <input
                                      type="checkbox"
                                      id="financial-revenue"
                                      checked={newUserPermissions.financial.viewRevenue}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        financial: { ...newUserPermissions.financial, viewRevenue: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="financial-invoices">Manage Invoices</Label>
                                    <input
                                      type="checkbox"
                                      id="financial-invoices"
                                      checked={newUserPermissions.financial.manageInvoices}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        financial: { ...newUserPermissions.financial, manageInvoices: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="financial-payments">Process Payments</Label>
                                    <input
                                      type="checkbox"
                                      id="financial-payments"
                                      checked={newUserPermissions.financial.processPayments}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        financial: { ...newUserPermissions.financial, processPayments: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="financial-reports">View Financial Reports</Label>
                                    <input
                                      type="checkbox"
                                      id="financial-reports"
                                      checked={newUserPermissions.financial.viewFinancialReports}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        financial: { ...newUserPermissions.financial, viewFinancialReports: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="financial-discounts">Manage Discounts</Label>
                                    <input
                                      type="checkbox"
                                      id="financial-discounts"
                                      checked={newUserPermissions.financial.manageDiscounts}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        financial: { ...newUserPermissions.financial, manageDiscounts: e.target.checked }
                                      })}
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Communication */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Communication</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="comm-emails">Send Emails</Label>
                                    <input
                                      type="checkbox"
                                      id="comm-emails"
                                      checked={newUserPermissions.communication.sendEmails}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        communication: { ...newUserPermissions.communication, sendEmails: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="comm-templates">Manage Email Templates</Label>
                                    <input
                                      type="checkbox"
                                      id="comm-templates"
                                      checked={newUserPermissions.communication.manageEmailTemplates}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        communication: { ...newUserPermissions.communication, manageEmailTemplates: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="comm-announcements">Send Announcements</Label>
                                    <input
                                      type="checkbox"
                                      id="comm-announcements"
                                      checked={newUserPermissions.communication.sendAnnouncements}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        communication: { ...newUserPermissions.communication, sendAnnouncements: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="comm-notifications">Manage Notifications</Label>
                                    <input
                                      type="checkbox"
                                      id="comm-notifications"
                                      checked={newUserPermissions.communication.manageNotifications}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        communication: { ...newUserPermissions.communication, manageNotifications: e.target.checked }
                                      })}
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              {/* System Settings */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">System Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="system-settings">Manage Settings</Label>
                                    <input
                                      type="checkbox"
                                      id="system-settings"
                                      checked={newUserPermissions.systemSettings.manageSettings}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        systemSettings: { ...newUserPermissions.systemSettings, manageSettings: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="system-logo">Upload Logo</Label>
                                    <input
                                      type="checkbox"
                                      id="system-logo"
                                      checked={newUserPermissions.systemSettings.uploadLogo}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        systemSettings: { ...newUserPermissions.systemSettings, uploadLogo: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="system-integrations">Manage Integrations</Label>
                                    <input
                                      type="checkbox"
                                      id="system-integrations"
                                      checked={newUserPermissions.systemSettings.manageIntegrations}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        systemSettings: { ...newUserPermissions.systemSettings, manageIntegrations: e.target.checked }
                                      })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="system-logs">View System Logs</Label>
                                    <input
                                      type="checkbox"
                                      id="system-logs"
                                      checked={newUserPermissions.systemSettings.viewSystemLogs}
                                      onChange={(e) => setNewUserPermissions({
                                        ...newUserPermissions,
                                        systemSettings: { ...newUserPermissions.systemSettings, viewSystemLogs: e.target.checked }
                                      })}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                          <Button onClick={() => {
                            // Handle user creation with permissions
                            console.log('Creating user with permissions:', newUserPermissions);
                            setIsUserDialogOpen(false);
                          }}>Create User Account</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.dashboard.overview && <Badge variant="outline" className="text-xs">Dashboard</Badge>}
                              {user.permissions.userManagement.createUsers && <Badge variant="outline" className="text-xs">User Mgmt</Badge>}
                              {user.permissions.productManagement.createProducts && <Badge variant="outline" className="text-xs">Products</Badge>}
                              {user.permissions.orderManagement.viewOrders && <Badge variant="outline" className="text-xs">Orders</Badge>}
                              {user.permissions.financial.viewRevenue && <Badge variant="outline" className="text-xs">Finance</Badge>}
                              {user.permissions.communication.sendEmails && <Badge variant="outline" className="text-xs">Email</Badge>}
                              {user.permissions.systemSettings.manageSettings && <Badge variant="outline" className="text-xs">Admin</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Edit Permissions">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emails" className="space-y-6">
              <EmailManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Admin Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Settings
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="website">Website</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admin-name">Full Name</Label>
                      <Input
                        id="admin-name"
                        value={adminSettings.adminName}
                        onChange={(e) => setAdminSettings({...adminSettings, adminName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-email">Email Address</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={adminSettings.adminEmail}
                        onChange={(e) => setAdminSettings({...adminSettings, adminEmail: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="admin-phone">Phone Number</Label>
                    <Input
                      id="admin-phone"
                      value={adminSettings.contactPhone}
                      onChange={(e) => setAdminSettings({...adminSettings, contactPhone: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={adminSettings.currentPassword}
                      onChange={(e) => setAdminSettings({...adminSettings, currentPassword: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={adminSettings.newPassword}
                      onChange={(e) => setAdminSettings({...adminSettings, newPassword: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={adminSettings.confirmPassword}
                      onChange={(e) => setAdminSettings({...adminSettings, confirmPassword: e.target.value})}
                    />
                  </div>
                  <Button className="w-full">Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-muted-foreground">Receive codes via SMS</p>
                    </div>
                    <input type="checkbox" checked={adminSettings.smsNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Authentication</p>
                      <p className="text-sm text-muted-foreground">Receive codes via email</p>
                    </div>
                    <input type="checkbox" checked={adminSettings.emailNotifications} />
                  </div>
                  <Button variant="outline">Setup 2FA</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Website Settings */}
            <TabsContent value="website" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Website Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="site-name">Website Name</Label>
                    <Input
                      id="site-name"
                      value={adminSettings.siteName}
                      onChange={(e) => setAdminSettings({...adminSettings, siteName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="site-description">Website Description</Label>
                    <Textarea
                      id="site-description"
                      value={adminSettings.siteDescription}
                      onChange={(e) => setAdminSettings({...adminSettings, siteDescription: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={adminSettings.contactEmail}
                      onChange={(e) => setAdminSettings({...adminSettings, contactEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={adminSettings.address}
                      onChange={(e) => setAdminSettings({...adminSettings, address: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Language & Currency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="default-language">Default Language</Label>
                      <Select value={adminSettings.defaultLanguage} onValueChange={(value) => setAdminSettings({...adminSettings, defaultLanguage: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="default-currency">Default Currency</Label>
                      <Select value={adminSettings.defaultCurrency} onValueChange={(value) => setAdminSettings({...adminSettings, defaultCurrency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Settings */}
            <TabsContent value="business" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-hours">Business Hours</Label>
                      <Input
                        id="business-hours"
                        value={adminSettings.businessHours}
                        onChange={(e) => setAdminSettings({...adminSettings, businessHours: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery-fee">Delivery Fee (SAR)</Label>
                      <Input
                        id="delivery-fee"
                        type="number"
                        value={adminSettings.deliveryFee}
                        onChange={(e) => setAdminSettings({...adminSettings, deliveryFee: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minimum-order">Minimum Order (SAR)</Label>
                      <Input
                        id="minimum-order"
                        type="number"
                        value={adminSettings.minimumOrder}
                        onChange={(e) => setAdminSettings({...adminSettings, minimumOrder: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        value={adminSettings.taxRate}
                        onChange={(e) => setAdminSettings({...adminSettings, taxRate: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={adminSettings.emailNotifications}
                      onChange={(e) => setAdminSettings({...adminSettings, emailNotifications: e.target.checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={adminSettings.smsNotifications}
                      onChange={(e) => setAdminSettings({...adminSettings, smsNotifications: e.target.checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={adminSettings.pushNotifications}
                      onChange={(e) => setAdminSettings({...adminSettings, pushNotifications: e.target.checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Put the website in maintenance mode</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={adminSettings.maintenanceMode}
                      onChange={(e) => setAdminSettings({...adminSettings, maintenanceMode: e.target.checked})}
                    />
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="logo-upload-settings" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload Company Logo
                          </span>
                        </label>
                        <input
                          id="logo-upload-settings"
                          name="logo-upload-settings"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setLogoUrl(url);
                            }
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setAdminSettings({
                        // Profile Settings
                        adminName: 'Admin User',
                        adminEmail: 'admin@rosesgarden.com',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',

                        // Website Settings
                        siteName: 'Roses Garden',
                        siteDescription: 'Premium Flowers & Gifts',
                        contactEmail: 'info@rosesgarden.com',
                        contactPhone: '+966 50 123 4567',
                        address: 'Riyadh, Saudi Arabia',

                        // Language & Currency
                        defaultLanguage: 'en',
                        supportedLanguages: ['en', 'ar'],
                        defaultCurrency: 'SAR',
                        supportedCurrencies: ['SAR', 'USD', 'EUR'],

                        // Business Settings
                        businessHours: '9:00 AM - 10:00 PM',
                        deliveryFee: '25',
                        minimumOrder: '50',
                        taxRate: '15',

                        // Notification Settings
                        emailNotifications: true,
                        smsNotifications: false,
                        pushNotifications: true,
                        maintenanceMode: false
                      });
                    }}>Reset to Default</Button>
                    <Button className="flex-1" onClick={() => {
                      // Save admin settings to localStorage
                      localStorage.setItem('admin-settings', JSON.stringify(adminSettings));

                      // Show success message
                      alert('Settings saved successfully! The website will now use the new default language and currency settings.');
                    }}>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
