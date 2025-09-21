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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Percent,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Tag,
  Gift,
  Zap,
  Target,
  Users,
  Copy,
  Pause,
  Play,
  Archive
} from 'lucide-react';

interface Discount {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy-one-get-one' | 'free-shipping';
  value: number;
  code?: string;
  status: 'active' | 'inactive' | 'expired' | 'draft';
  usageLimit: number;
  usedCount: number;
  minOrderValue?: number;
  maxDiscount?: number;
  applicableProducts: string[];
  applicableCategories: string[];
  targetCustomers: 'all' | 'new' | 'returning' | 'vip';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isAutoApplied: boolean;
  priority: number;
}

const DiscountsManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newDiscount, setNewDiscount] = useState({
    name: '',
    description: '',
    type: 'percentage' as const,
    value: 0,
    code: '',
    usageLimit: 100,
    minOrderValue: 0,
    maxDiscount: 0,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    targetCustomers: 'all' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isAutoApplied: false,
    priority: 1
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    // Mock data - in real app, this would be an API call
    const mockDiscounts: Discount[] = [
      {
        id: '1',
        name: 'Valentine\'s Day Sale',
        description: '20% off on all rose bouquets for Valentine\'s Day',
        type: 'percentage',
        value: 20,
        code: 'VALENTINE20',
        status: 'active',
        usageLimit: 500,
        usedCount: 127,
        minOrderValue: 50,
        maxDiscount: 100,
        applicableProducts: ['roses', 'bouquets'],
        applicableCategories: ['flowers'],
        targetCustomers: 'all',
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        createdAt: '2024-01-25',
        updatedAt: '2024-01-25',
        createdBy: 'Admin',
        isAutoApplied: false,
        priority: 1
      },
      {
        id: '2',
        name: 'New Customer Discount',
        description: '15% off for first-time customers',
        type: 'percentage',
        value: 15,
        code: 'WELCOME15',
        status: 'active',
        usageLimit: 1000,
        usedCount: 89,
        applicableProducts: [],
        applicableCategories: [],
        targetCustomers: 'new',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: 'Admin',
        isAutoApplied: true,
        priority: 2
      },
      {
        id: '3',
        name: 'Free Shipping',
        description: 'Free shipping on orders over SAR 100',
        type: 'free-shipping',
        value: 0,
        status: 'active',
        usageLimit: 0,
        usedCount: 234,
        minOrderValue: 100,
        applicableProducts: [],
        applicableCategories: [],
        targetCustomers: 'all',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: 'Admin',
        isAutoApplied: true,
        priority: 3
      }
    ];
    setDiscounts(mockDiscounts);
  };

  const createDiscount = () => {
    const discount: Discount = {
      id: Date.now().toString(),
      name: newDiscount.name,
      description: newDiscount.description,
      type: newDiscount.type,
      value: newDiscount.value,
      code: newDiscount.code || undefined,
      status: 'draft',
      usageLimit: newDiscount.usageLimit,
      usedCount: 0,
      minOrderValue: newDiscount.minOrderValue || undefined,
      maxDiscount: newDiscount.maxDiscount || undefined,
      applicableProducts: newDiscount.applicableProducts,
      applicableCategories: newDiscount.applicableCategories,
      targetCustomers: newDiscount.targetCustomers,
      startDate: newDiscount.startDate,
      endDate: newDiscount.endDate,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
      isAutoApplied: newDiscount.isAutoApplied,
      priority: newDiscount.priority
    };

    setDiscounts([...discounts, discount]);
    setIsCreateDialogOpen(false);
    setNewDiscount({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      code: '',
      usageLimit: 100,
      minOrderValue: 0,
      maxDiscount: 0,
      applicableProducts: [],
      applicableCategories: [],
      targetCustomers: 'all',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isAutoApplied: false,
      priority: 1
    });
  };

  const activateDiscount = (discount: Discount) => {
    const updatedDiscounts = discounts.map(disc =>
      disc.id === discount.id ? { ...disc, status: 'active' as const } : disc
    );
    setDiscounts(updatedDiscounts);
  };

  const deactivateDiscount = (discount: Discount) => {
    const updatedDiscounts = discounts.map(disc =>
      disc.id === discount.id ? { ...disc, status: 'inactive' as const } : disc
    );
    setDiscounts(updatedDiscounts);
  };

  const deleteDiscount = (discountId: string) => {
    setDiscounts(discounts.filter(disc => disc.id !== discountId));
  };

  const duplicateDiscount = (discount: Discount) => {
    const duplicated: Discount = {
      ...discount,
      id: Date.now().toString(),
      name: `${discount.name} (Copy)`,
      code: discount.code ? `${discount.code}_COPY` : undefined,
      status: 'draft',
      usedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setDiscounts([...discounts, duplicated]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-800';
      case 'fixed':
        return 'bg-green-100 text-green-800';
      case 'buy-one-get-one':
        return 'bg-purple-100 text-purple-800';
      case 'free-shipping':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDiscountValue = (discount: Discount) => {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}%`;
      case 'fixed':
        return `SAR ${discount.value}`;
      case 'buy-one-get-one':
        return 'BOGO';
      case 'free-shipping':
        return 'Free Shipping';
      default:
        return '';
    }
  };

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discount.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (discount.code && discount.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || discount.status === statusFilter;
    const matchesType = typeFilter === 'all' || discount.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discounts & Offers Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage promotional discounts and special offers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discounts..."
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
              <SelectItem value="draft">Draft</SelectItem>
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
              <SelectItem value="buy-one-get-one">BOGO</SelectItem>
              <SelectItem value="free-shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Discount
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Discount</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Discount Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Summer Sale 2024"
                      value={newDiscount.name}
                      onChange={(e) => setNewDiscount({...newDiscount, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the discount offer"
                      rows={3}
                      value={newDiscount.description}
                      onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Discount Type</Label>
                    <Select value={newDiscount.type} onValueChange={(value) => setNewDiscount({...newDiscount, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Discount</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="buy-one-get-one">Buy One Get One</SelectItem>
                        <SelectItem value="free-shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">
                      {newDiscount.type === 'percentage' ? 'Discount Percentage (%)' :
                       newDiscount.type === 'fixed' ? 'Discount Amount (SAR)' :
                       newDiscount.type === 'buy-one-get-one' ? 'BOGO Details' :
                       'Free Shipping Threshold (SAR)'}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder={newDiscount.type === 'percentage' ? '20' :
                                 newDiscount.type === 'fixed' ? '50' :
                                 newDiscount.type === 'free-shipping' ? '100' : 'Details'}
                      value={newDiscount.value}
                      onChange={(e) => setNewDiscount({...newDiscount, value: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Promo Code (Optional)</Label>
                    <Input
                      id="code"
                      placeholder="e.g. SUMMER20"
                      value={newDiscount.code}
                      onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="usage-limit">Usage Limit</Label>
                    <Input
                      id="usage-limit"
                      type="number"
                      placeholder="100"
                      value={newDiscount.usageLimit}
                      onChange={(e) => setNewDiscount({...newDiscount, usageLimit: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-customers">Target Customers</Label>
                    <Select value={newDiscount.targetCustomers} onValueChange={(value) => setNewDiscount({...newDiscount, targetCustomers: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="new">New Customers</SelectItem>
                        <SelectItem value="returning">Returning Customers</SelectItem>
                        <SelectItem value="vip">VIP Customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newDiscount.startDate}
                      onChange={(e) => setNewDiscount({...newDiscount, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newDiscount.endDate}
                      onChange={(e) => setNewDiscount({...newDiscount, endDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-order">Minimum Order Value (SAR)</Label>
                    <Input
                      id="min-order"
                      type="number"
                      placeholder="0"
                      value={newDiscount.minOrderValue}
                      onChange={(e) => setNewDiscount({...newDiscount, minOrderValue: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-discount">Maximum Discount (SAR)</Label>
                    <Input
                      id="max-discount"
                      type="number"
                      placeholder="0"
                      value={newDiscount.maxDiscount}
                      onChange={(e) => setNewDiscount({...newDiscount, maxDiscount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-applied"
                      checked={newDiscount.isAutoApplied}
                      onChange={(e) => setNewDiscount({...newDiscount, isAutoApplied: e.target.checked})}
                    />
                    <Label htmlFor="auto-applied">Auto-apply discount</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={createDiscount}>Create Discount</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.filter(d => d.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.reduce((sum, d) => sum + d.usedCount, 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discounts.length > 0 ?
                Math.round((discounts.filter(d => d.usedCount > 0).length / discounts.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Discounts & Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{discount.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {discount.code && `Code: ${discount.code}`} • {discount.targetCustomers}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(discount.type)}>
                      {discount.type.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getDiscountValue(discount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(discount.status)}>
                      {discount.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{discount.usedCount} / {discount.usageLimit || '∞'}</div>
                      <div className="text-muted-foreground">
                        {discount.usageLimit > 0 ?
                          Math.round((discount.usedCount / discount.usageLimit) * 100) : 100}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(discount.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDiscount(discount);
                          setIsPreviewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateDiscount(discount)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {discount.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => activateDiscount(discount)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {discount.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deactivateDiscount(discount)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDiscount(discount.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Discount Details</DialogTitle>
          </DialogHeader>
          {selectedDiscount && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(selectedDiscount.type)}>
                    {selectedDiscount.type.replace('-', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(selectedDiscount.status)}>
                    {selectedDiscount.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Priority: {selectedDiscount.priority}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">{selectedDiscount.name}</h3>
                <p className="text-muted-foreground">{selectedDiscount.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Discount Value</Label>
                  <div className="text-lg font-semibold">{getDiscountValue(selectedDiscount)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Usage</Label>
                  <div className="text-lg font-semibold">
                    {selectedDiscount.usedCount} / {selectedDiscount.usageLimit || '∞'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Target Customers</Label>
                  <div className="text-sm">{selectedDiscount.targetCustomers}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Auto Applied</Label>
                  <div className="text-sm">{selectedDiscount.isAutoApplied ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {selectedDiscount.code && (
                <div>
                  <Label className="text-sm font-medium">Promo Code</Label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm">{selectedDiscount.code}</code>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Valid: {new Date(selectedDiscount.startDate).toLocaleDateString()} - {new Date(selectedDiscount.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Created by {selectedDiscount.createdBy}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Discount
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscountsManager;