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
  FileText,
  Download,
  Send,
  Plus,
  Search,
  Eye,
  Trash2,
  Mail,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_address: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  status: string;
  delivery_address: any;
  created_at: string;
}

const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState({
    order_id: '',
    customer_name: '',
    customer_email: '',
    customer_address: '',
    items: [] as InvoiceItem[],
    tax_amount: 0,
    discount_amount: 0,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadInvoices();
    loadOrders();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading invoices:', error);
        toast.error('Failed to load invoices');
        return;
      }

      const formattedInvoices: Invoice[] = (data || []).map(inv => ({
        ...inv,
        items: Array.isArray(inv.items) ? inv.items as unknown as InvoiceItem[] : []
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading orders:', error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}-${random}`;
  };

  const createInvoiceFromOrder = async (order: Order) => {
    // Fetch order items
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order.id);

    if (error) {
      console.error('Error fetching order items:', error);
      toast.error('Failed to load order items');
      return;
    }

    const address = order.delivery_address as any;
    const customerName = address?.name || 'Customer';
    const customerEmail = address?.email || '';
    const customerAddress = address ? `${address.street || ''}, ${address.city || ''}, ${address.country || ''}` : '';

    const items: InvoiceItem[] = (orderItems || []).map((item: any) => ({
      id: item.id,
      name: item.products?.name || 'Product',
      description: '',
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      total: Number(item.total_price)
    }));

    setNewInvoice({
      order_id: order.id,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_address: customerAddress,
      items,
      tax_amount: Number(order.tax_amount) || 0,
      discount_amount: 0,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
  };

  const createInvoice = async () => {
    if (!newInvoice.customer_name.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setIsSaving(true);
    try {
      const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal + newInvoice.tax_amount - newInvoice.discount_amount;

      const { error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: generateInvoiceNumber(),
          order_id: newInvoice.order_id || null,
          customer_name: newInvoice.customer_name,
          customer_email: newInvoice.customer_email,
          customer_address: newInvoice.customer_address || null,
          items: newInvoice.items as unknown as any,
          subtotal,
          tax_amount: newInvoice.tax_amount,
          discount_amount: newInvoice.discount_amount,
          total_amount: total,
          status: 'draft',
          due_date: newInvoice.due_date || null,
          notes: newInvoice.notes || null
        });

      if (error) {
        console.error('Error creating invoice:', error);
        toast.error('Failed to create invoice');
        return;
      }

      toast.success('Invoice created successfully');
      setIsCreateDialogOpen(false);
      resetNewInvoice();
      loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const resetNewInvoice = () => {
    setNewInvoice({
      order_id: '',
      customer_name: '',
      customer_email: '',
      customer_address: '',
      items: [],
      tax_amount: 0,
      discount_amount: 0,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
  };

  const updateInvoiceStatus = async (invoice: Invoice, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoice.id);

      if (error) {
        console.error('Error updating invoice:', error);
        toast.error('Failed to update invoice');
        return;
      }

      toast.success(`Invoice marked as ${newStatus}`);
      loadInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Failed to delete invoice');
        return;
      }

      toast.success('Invoice deleted successfully');
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage invoices for your customers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="from-order" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="from-order">From Order</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>
                <TabsContent value="from-order" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Select Order</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {orders.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No orders available</p>
                          ) : (
                            orders.map((order) => (
                              <div
                                key={order.id}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-muted ${newInvoice.order_id === order.id ? 'border-primary bg-muted' : ''}`}
                                onClick={() => createInvoiceFromOrder(order)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{order.order_number}</div>
                                    <div className="text-sm text-muted-foreground">{formatPrice(Number(order.total_amount))}</div>
                                  </div>
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Invoice Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {newInvoice.order_id ? (
                          <div className="space-y-4">
                            <div>
                              <Label>Customer</Label>
                              <div className="text-sm">{newInvoice.customer_name}</div>
                              <div className="text-sm text-muted-foreground">{newInvoice.customer_email}</div>
                            </div>
                            <div>
                              <Label>Items</Label>
                              <div className="space-y-2">
                                {newInvoice.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>{formatPrice(item.total)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>{formatPrice(newInvoice.items.reduce((sum, item) => sum + item.total, 0) + newInvoice.tax_amount - newInvoice.discount_amount)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Select an order to preview</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="manual" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customer-name">Customer Name</Label>
                        <Input
                          id="customer-name"
                          value={newInvoice.customer_name}
                          onChange={(e) => setNewInvoice({...newInvoice, customer_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-email">Customer Email</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          value={newInvoice.customer_email}
                          onChange={(e) => setNewInvoice({...newInvoice, customer_email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-address">Customer Address</Label>
                        <Textarea
                          id="customer-address"
                          value={newInvoice.customer_address}
                          onChange={(e) => setNewInvoice({...newInvoice, customer_address: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input
                          id="due-date"
                          type="date"
                          value={newInvoice.due_date}
                          onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tax">Tax Amount</Label>
                        <Input
                          id="tax"
                          type="number"
                          value={newInvoice.tax_amount}
                          onChange={(e) => setNewInvoice({...newInvoice, tax_amount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount">Discount Amount</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={newInvoice.discount_amount}
                          onChange={(e) => setNewInvoice({...newInvoice, discount_amount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newInvoice.notes}
                          onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetNewInvoice(); }}>Cancel</Button>
                <Button onClick={createInvoice} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Invoice
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
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">
                  {formatPrice(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total_amount), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{invoices.filter(i => i.status === 'sent').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{invoices.filter(i => i.status === 'overdue').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(Number(invoice.total_amount))}</TableCell>
                    <TableCell>
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsPreviewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateInvoiceStatus(invoice, 'sent')}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === 'sent' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateInvoiceStatus(invoice, 'paid')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteInvoice(invoice.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">{selectedInvoice.invoice_number}</h3>
                  <p className="text-muted-foreground">
                    Created: {new Date(selectedInvoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedInvoice.status)}>
                  {selectedInvoice.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bill To</p>
                  <p className="font-medium">{selectedInvoice.customer_name}</p>
                  <p className="text-sm">{selectedInvoice.customer_email}</p>
                  {selectedInvoice.customer_address && (
                    <p className="text-sm">{selectedInvoice.customer_address}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatPrice(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(Number(selectedInvoice.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(Number(selectedInvoice.tax_amount))}</span>
                </div>
                {Number(selectedInvoice.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatPrice(Number(selectedInvoice.discount_amount))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(Number(selectedInvoice.total_amount))}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManager;
