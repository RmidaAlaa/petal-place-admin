import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, Package, Heart, MapPin, Phone, Mail, Calendar, Star, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import apiService from '@/services/api';

const UserProfile = () => {
  const { state: authState, updateProfile } = useAuth();
  const { state: favoritesState, removeFavorite } = useFavorites();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    avatar: '',
  });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      setUser({
        name: `${authState.user.first_name} ${authState.user.last_name}`,
        email: authState.user.email,
        phone: authState.user.phone || '',
        address: '',
        joinDate: authState.user.created_at,
        avatar: '',
      });
      loadUserData();
    }
  }, [authState.isAuthenticated, authState.user]);

  const loadUserData = async () => {
    try {
      const [ordersData] = await Promise.all([
        apiService.getMyOrders(10, 0),
        // Add other API calls for favorites, etc.
      ]);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSave = async () => {
    if (!authState.isAuthenticated) return;

    setIsLoading(true);
    try {
      const [firstName, ...lastNameParts] = user.name.split(' ');
      const lastName = lastNameParts.join(' ');

      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: user.phone,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use real order data from API
  const orderHistory = orders.length > 0 ? orders : [
    {
      id: 'ORD-001',
      order_number: 'ORD-001',
      created_at: '2024-09-10',
      status: 'Delivered',
      total_amount: 185.00,
      items: [
        { name: 'Wedding Bouquet Package', price: 180.00, quantity: 1 },
        { name: 'Delivery Fee', price: 5.00, quantity: 1 }
      ]
    }
  ];

  const favorites = favoritesState.items;

  const loyaltyPoints = {
    current: 1250,
    totalEarned: 2840,
    nextReward: 1750,
    tier: 'Gold Member'
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account, orders, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted mb-8">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-background">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-background">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="data-[state=active]:bg-background">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-center">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Avatar className="w-32 h-32 mx-auto">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="border-border">Upload New Photo</Button>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={user.phone}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      className="border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Member Since</Label>
                    <Input
                      id="joinDate"
                      value={new Date(user.joinDate).toLocaleDateString()}
                      readOnly
                      className="border-border bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={user.address}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                    className="border-border"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View and track your previous orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {orderHistory.map((order) => (
                  <div key={order.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">Order #{order.order_number || order.id}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.created_at || order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-sage text-sage-foreground mb-1">
                          {order.status}
                        </Badge>
                        <p className="text-lg font-semibold text-primary">{(order.total_amount || order.total).toFixed(2)} SAR</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      {order.items ? order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{item.price.toFixed(2)} SAR</span>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">No items available</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="border-border">View Details</Button>
                      <Button variant="outline" size="sm" className="border-border">Reorder</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Items</CardTitle>
              <CardDescription>Your saved flowers and arrangements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {favorites.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-primary">{item.price.toFixed(2)} SAR</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-border"
                          onClick={() => removeFavorite(item.id)}
                        >
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Loyalty Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground text-lg px-4 py-2 mb-4">
                    {loyaltyPoints.tier}
                  </Badge>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-primary">{loyaltyPoints.current} Points</p>
                    <p className="text-sm text-muted-foreground">
                      {loyaltyPoints.nextReward - loyaltyPoints.current} points to next reward
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Earned:</span>
                    <span className="font-medium">{loyaltyPoints.totalEarned} points</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Reward At:</span>
                    <span className="font-medium">{loyaltyPoints.nextReward} points</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
                <CardDescription>Redeem your points for exclusive benefits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-muted-foreground">500 points</p>
                  </div>
                  <Button variant="outline" size="sm" disabled={loyaltyPoints.current < 500}>
                    {loyaltyPoints.current >= 500 ? 'Redeem' : 'Locked'}
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">10% Discount</p>
                    <p className="text-sm text-muted-foreground">1000 points</p>
                  </div>
                  <Button variant="outline" size="sm" disabled={loyaltyPoints.current < 1000}>
                    {loyaltyPoints.current >= 1000 ? 'Redeem' : 'Locked'}
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Premium Bouquet</p>
                    <p className="text-sm text-muted-foreground">2000 points</p>
                  </div>
                  <Button variant="outline" size="sm" disabled={loyaltyPoints.current < 2000}>
                    {loyaltyPoints.current >= 2000 ? 'Redeem' : 'Locked'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;