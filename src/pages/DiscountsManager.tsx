import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Percent,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Tag,
  Copy,
  Pause,
  Play,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minimum_amount: number | null;
  maximum_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const DiscountsManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minimum_amount: 0,
    maximum_discount: 0,
    usage_limit: 100,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading coupons:', error);
        toast.error('Failed to load coupons');
        return;
      }

      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const createCoupon = async () => {
    if (!newCoupon.code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: newCoupon.code.toUpperCase(),
          type: newCoupon.type,
          value: newCoupon.value,
          minimum_amount: newCoupon.minimum_amount || null,
          maximum_discount: newCoupon.maximum_discount || null,
          usage_limit: newCoupon.usage_limit || null,
          expires_at: newCoupon.expires_at || null,
          is_active: newCoupon.is_active
        });

      if (error) {
        console.error('Error creating coupon:', error);
        toast.error('Failed to create coupon');
        return;
      }

      toast.success('Coupon created successfully');
      setIsCreateDialogOpen(false);
      setNewCoupon({
        code: '',
        type: 'percentage',
        value: 0,
        minimum_amount: 0,
        maximum_discount: 0,
        usage_limit: 100,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      });
      loadCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Failed to create coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) {
        console.error('Error updating coupon:', error);
        toast.error('Failed to update coupon');
        return;
      }

      toast.success(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'}`);
      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Failed to update coupon');
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) {
        console.error('Error deleting coupon:', error);
        toast.error('Failed to delete coupon');
        return;
      }

      toast.success('Coupon deleted successfully');
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const duplicateCoupon = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: `${coupon.code}_COPY`,
          type: coupon.type,
          value: coupon.value,
          minimum_amount: coupon.minimum_amount,
          maximum_discount: coupon.maximum_discount,
          usage_limit: coupon.usage_limit,
          expires_at: coupon.expires_at,
          is_active: false
        });

      if (error) {
        console.error('Error duplicating coupon:', error);
        toast.error('Failed to duplicate coupon');
        return;
      }

      toast.success('Coupon duplicated successfully');
      loadCoupons();
    } catch (error) {
      console.error('Error duplicating coupon:', error);
      toast.error('Failed to duplicate coupon');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-800';
      case 'fixed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean, expiresAt: string | null) => {
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return 'bg-red-100 text-red-800';
    }
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (isActive: boolean, expiresAt: string | null) => {
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return 'Expired';
    }
    return isActive ? 'Active' : 'Inactive';
  };

  const getDiscountValue = (coupon: Coupon) => {
    return coupon.type === 'percentage' ? `${coupon.value}%` : `SAR ${coupon.value}`;
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    let status = 'active';
    if (isExpired) status = 'expired';
    else if (!coupon.is_active) status = 'inactive';
    
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesType = typeFilter === 'all' || coupon.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discounts & Coupons</h1>
          <p className="text-muted-foreground mt-1">Manage promotional coupons and discounts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g. SUMMER20"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Discount Type</Label>
                    <Select value={newCoupon.type} onValueChange={(value) => setNewCoupon({...newCoupon, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Discount</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">
                      {newCoupon.type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (SAR)'}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({...newCoupon, value: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="usage-limit">Usage Limit</Label>
                    <Input
                      id="usage-limit"
                      type="number"
                      value={newCoupon.usage_limit}
                      onChange={(e) => setNewCoupon({...newCoupon, usage_limit: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="min-order">Minimum Order Value (SAR)</Label>
                    <Input
                      id="min-order"
                      type="number"
                      value={newCoupon.minimum_amount}
                      onChange={(e) => setNewCoupon({...newCoupon, minimum_amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-discount">Maximum Discount (SAR)</Label>
                    <Input
                      id="max-discount"
                      type="number"
                      value={newCoupon.maximum_discount}
                      onChange={(e) => setNewCoupon({...newCoupon, maximum_discount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires-at">Expiry Date</Label>
                    <Input
                      id="expires-at"
                      type="date"
                      value={newCoupon.expires_at}
                      onChange={(e) => setNewCoupon({...newCoupon, expires_at: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={newCoupon.is_active}
                      onCheckedChange={(checked) => setNewCoupon({...newCoupon, is_active: checked})}
                    />
                    <Label htmlFor="is-active">Active immediately</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={createCoupon} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Coupon
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
                <p className="text-2xl font-bold">{coupons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {coupons.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Percent className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + (c.used_count || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">
                  {coupons.filter(c => c.expires_at && new Date(c.expires_at) < new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No coupons found. Create your first coupon to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(coupon.type)}>
                        {coupon.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getDiscountValue(coupon)}</TableCell>
                    <TableCell>
                      {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                    </TableCell>
                    <TableCell>
                      {coupon.minimum_amount ? `SAR ${coupon.minimum_amount}` : '-'}
                    </TableCell>
                    <TableCell>
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(coupon.is_active, coupon.expires_at)}>
                        {getStatusText(coupon.is_active, coupon.expires_at)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setIsPreviewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCouponStatus(coupon)}
                        >
                          {coupon.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateCoupon(coupon)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coupon Details</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-mono font-bold text-lg">{selectedCoupon.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge className={getTypeColor(selectedCoupon.type)}>{selectedCoupon.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="font-bold">{getDiscountValue(selectedCoupon)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedCoupon.is_active, selectedCoupon.expires_at)}>
                    {getStatusText(selectedCoupon.is_active, selectedCoupon.expires_at)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min Order</p>
                  <p>{selectedCoupon.minimum_amount ? `SAR ${selectedCoupon.minimum_amount}` : 'None'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Discount</p>
                  <p>{selectedCoupon.maximum_discount ? `SAR ${selectedCoupon.maximum_discount}` : 'Unlimited'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usage</p>
                  <p>{selectedCoupon.used_count || 0} / {selectedCoupon.usage_limit || '∞'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p>{selectedCoupon.expires_at ? new Date(selectedCoupon.expires_at).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscountsManager;
