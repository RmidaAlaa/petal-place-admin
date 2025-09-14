import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

const Admin = () => {
  const stats = [
    {
      title: "Total Sales",
      value: "$12,345",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Orders",
      value: "164",
      change: "+8.2%",
      icon: ShoppingBag,
      color: "text-accent",
    },
    {
      title: "Vendors",
      value: "24",
      change: "+4.1%",
      icon: Users,
      color: "text-sage",
    },
    {
      title: "Products",
      value: "312",
      change: "+15.3%",
      icon: Package,
      color: "text-coral",
    },
  ];

  const recentOrders = [
    {
      id: "#12345",
      customer: "Emma Johnson",
      product: "Spring Rose Bouquet",
      amount: "$89.99",
      status: "Delivered",
      date: "2024-01-15",
    },
    {
      id: "#12346",
      customer: "Michael Chen",
      product: "White Peonies Arrangement",
      amount: "$124.50",
      status: "Processing",
      date: "2024-01-15",
    },
    {
      id: "#12347",
      customer: "Sarah Williams",
      product: "Wildflower Mix",
      amount: "$67.00",
      status: "Shipped",
      date: "2024-01-14",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-sage text-sage-foreground";
      case "Processing":
        return "bg-accent text-accent-foreground";
      case "Shipped":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flower marketplace efficiently
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-sage mr-1" />
                        <span className="text-sm text-sage font-medium">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Orders */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-card-foreground">
                          {order.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium text-card-foreground">
                          {order.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="font-semibold text-primary">
                      {order.amount}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;