import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface OrderStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const Admin = () => {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role === 'admin') {
      loadDashboardData();
    }
  }, [authState.isAuthenticated, authState.user?.role]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, ordersData, lowStockData] = await Promise.all([
        apiService.getOrderStats(),
        apiService.getRecentOrders(10),
        apiService.getLowStockProducts()
      ]);

      setStats(statsData);
      setRecentOrders(ordersData);
      setLowStockProducts(lowStockData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-sage text-sage-foreground";
      case "processing":
      case "confirmed":
        return "bg-accent text-accent-foreground";
      case "shipped":
        return "bg-primary text-primary-foreground";
      case "pending":
        return "bg-yellow-500 text-yellow-foreground";
      case "cancelled":
        return "bg-red-500 text-red-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your flower marketplace efficiently
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading dashboard data...</span>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        ${stats?.total_revenue?.toFixed(2) || '0.00'}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-sage mr-1" />
                        <span className="text-sm text-sage font-medium">
                          All Time
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {stats?.total_orders || 0}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-muted-foreground">
                          {stats?.completed_orders || 0} completed
                        </span>
                      </div>
                    </div>
                    <ShoppingBag className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Pending Orders
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {stats?.pending_orders || 0}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-yellow-600">
                          Needs attention
                        </span>
                      </div>
                    </div>
                    <Package className="h-8 w-8 text-sage" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Low Stock Items
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {lowStockProducts.length}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-red-600">
                          {lowStockProducts.length > 0 ? 'Action needed' : 'All good'}
                        </span>
                      </div>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-coral" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList>
                <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                <TabsTrigger value="inventory">Low Stock Alert</TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No orders found
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/30"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="font-medium text-card-foreground">
                                    {order.order_number}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.first_name} {order.last_name}
                                  </p>
                                </div>
                                <div className="hidden md:block">
                                  <p className="text-sm text-muted-foreground">
                                    {order.email}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <p className="font-semibold text-primary">
                                ${order.total_amount.toFixed(2)}
                              </p>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Low Stock Alert</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lowStockProducts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>All products are well stocked!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {lowStockProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-card-foreground">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Current stock: {product.stock_quantity} units
                              </p>
                              <p className="text-sm text-red-600">
                                Min level: {product.min_stock_level} units
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">
                                Low Stock
                              </Badge>
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Restock
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;