import React, { useState } from 'react';
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

const UserProfile = () => {
  const [user, setUser] = useState({
    name: 'Sarah Ahmad',
    email: 'sarah.ahmad@example.com',
    phone: '+966 50 123 4567',
    address: 'Al Malqa, Riyadh, Saudi Arabia',
    joinDate: '2024-01-15',
    avatar: '',
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Profile management will be available after authentication setup.",
    });
  };

  const orderHistory = [
    {
      id: 'ORD-001',
      date: '2024-09-10',
      status: 'Delivered',
      total: 185.00,
      items: [
        { name: 'Wedding Bouquet Package', price: 180.00, quantity: 1 },
        { name: 'Delivery Fee', price: 5.00, quantity: 1 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-09-05',
      status: 'Delivered',
      total: 67.00,
      items: [
        { name: 'Natural Roses (جوري)', price: 24.00, quantity: 3 },
        { name: 'Gift Wrapping', price: 15.00, quantity: 1 }
      ]
    },
    {
      id: 'ORD-003',
      date: '2024-08-28',
      status: 'Delivered',
      total: 45.00,
      items: [
        { name: 'Happiness Gift Box', price: 45.00, quantity: 1 }
      ]
    }
  ];

  const favorites = [
    { id: '1', name: 'Natural Roses (جوري)', price: 8.00, category: 'Natural Roses' },
    { id: '2', name: 'Wedding Bouquet Package', price: 180.00, category: 'Wedding' },
    { id: '3', name: 'Happiness Gift Box', price: 45.00, category: 'Gift Boxes' },
  ];

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

                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Save Changes
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
                        <h3 className="font-semibold text-foreground">Order #{order.id}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-sage text-sage-foreground mb-1">
                          {order.status}
                        </Badge>
                        <p className="text-lg font-semibold text-primary">{order.total.toFixed(2)} SAR</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{item.price.toFixed(2)} SAR</span>
                        </div>
                      ))}
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
                        <Button variant="outline" size="sm" className="border-border">
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