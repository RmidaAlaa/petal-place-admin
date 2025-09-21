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
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  Printer,
  Calendar,
  DollarSign,
  User,
  Building
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  dueDate: string;
  notes?: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  total: number;
  status: string;
  createdAt: string;
}

const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newInvoice, setNewInvoice] = useState({
    orderId: '',
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    items: [] as InvoiceItem[],
    tax: 0,
    discount: 0,
    dueDate: '',
    notes: ''
  });

  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadInvoices();
    loadOrders();
  }, []);

  const loadInvoices = async () => {
    // Mock data - in real app, this would be an API call
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        orderId: 'ORD-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerAddress: '123 Main St, Riyadh, Saudi Arabia',
        items: [
          { id: '1', name: 'Red Rose Bouquet', description: 'Beautiful red roses', quantity: 2, unitPrice: 45, total: 90 },
          { id: '2', name: 'Greeting Card', description: 'Custom message card', quantity: 1, unitPrice: 5, total: 5 }
        ],
        subtotal: 95,
        tax: 7.13,
        discount: 0,
        total: 102.13,
        status: 'sent',
        createdAt: '2024-01-15',
        dueDate: '2024-02-15',
        notes: 'Thank you for your business!'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        orderId: 'ORD-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerAddress: '456 Oak Ave, Jeddah, Saudi Arabia',
        items: [
          { id: '3', name: 'Mixed Flower Arrangement', description: 'Seasonal mixed flowers', quantity: 1, unitPrice: 75, total: 75 },
          { id: '4', name: 'Vase', description: 'Crystal vase', quantity: 1, unitPrice: 25, total: 25 }
        ],
        subtotal: 100,
        tax: 7.5,
        discount: 10,
        total: 97.5,
        status: 'paid',
        createdAt: '2024-01-14',
        dueDate: '2024-02-14'
      }
    ];
    setInvoices(mockInvoices);
  };

  const loadOrders = async () => {
    // Mock data - in real app, this would be an API call
    const mockOrders: Order[] = [
      {
        id: 'ORD-001',
        orderNumber: 'PP-001',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          address: '123 Main St, Riyadh, Saudi Arabia'
        },
        items: [
          { id: '1', name: 'Red Rose Bouquet', quantity: 2, unitPrice: 45 },
          { id: '2', name: 'Greeting Card', quantity: 1, unitPrice: 5 }
        ],
        total: 95,
        status: 'delivered',
        createdAt: '2024-01-15'
      },
      {
        id: 'ORD-002',
        orderNumber: 'PP-002',
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          address: '456 Oak Ave, Jeddah, Saudi Arabia'
        },
        items: [
          { id: '3', name: 'Mixed Flower Arrangement', quantity: 1, unitPrice: 75 },
          { id: '4', name: 'Vase', quantity: 1, unitPrice: 25 }
        ],
        total: 100,
        status: 'delivered',
        createdAt: '2024-01-14'
      }
    ];
    setOrders(mockOrders);
  };

  const createInvoiceFromOrder = (order: Order) => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const tax = subtotal * 0.075; // 7.5% tax

    setNewInvoice({
      orderId: order.id,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerAddress: order.customer.address,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        description: '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.quantity
      })),
      tax,
      discount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      notes: ''
    });
    setIsCreateDialogOpen(true);
  };

  const createInvoice = () => {
    const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + newInvoice.tax - newInvoice.discount;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      orderId: newInvoice.orderId,
      customerName: newInvoice.customerName,
      customerEmail: newInvoice.customerEmail,
      customerAddress: newInvoice.customerAddress,
      items: newInvoice.items,
      subtotal,
      tax: newInvoice.tax,
      discount: newInvoice.discount,
      total,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate,
      notes: newInvoice.notes
    };

    setInvoices([...invoices, invoice]);
    setIsCreateDialogOpen(false);
    setNewInvoice({
      orderId: '',
      customerName: '',
      customerEmail: '',
      customerAddress: '',
      items: [],
      tax: 0,
      discount: 0,
      dueDate: '',
      notes: ''
    });
  };

  const sendInvoice = (invoice: Invoice) => {
    // Mock send functionality
    const updatedInvoices = invoices.map(inv =>
      inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
    );
    setInvoices(updatedInvoices);
  };

  const markAsPaid = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv =>
      inv.id === invoice.id ? { ...inv, status: 'paid' as const } : inv
    );
    setInvoices(updatedInvoices);
  };

  const deleteInvoice = (invoiceId: string) => {
    setInvoices(invoices.filter(inv => inv.id !== invoiceId));
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
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                        <div className="space-y-2">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                              onClick={() => createInvoiceFromOrder(order)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{order.orderNumber}</div>
                                  <div className="text-sm text-muted-foreground">{order.customer.name}</div>
                                  <div className="text-sm text-muted-foreground">{formatPrice(order.total)}</div>
                                </div>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Invoice Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {newInvoice.orderId && (
                          <div className="space-y-4">
                            <div>
                              <Label>Customer</Label>
                              <div className="text-sm">{newInvoice.customerName}</div>
                              <div className="text-sm text-muted-foreground">{newInvoice.customerEmail}</div>
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
                                <span>{formatPrice(newInvoice.items.reduce((sum, item) => sum + item.total, 0) + newInvoice.tax - newInvoice.discount)}</span>
                              </div>
                            </div>
                          </div>
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
                          value={newInvoice.customerName}
                          onChange={(e) => setNewInvoice({...newInvoice, customerName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-email">Customer Email</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          value={newInvoice.customerEmail}
                          onChange={(e) => setNewInvoice({...newInvoice, customerEmail: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-address">Customer Address</Label>
                        <Textarea
                          id="customer-address"
                          value={newInvoice.customerAddress}
                          onChange={(e) => setNewInvoice({...newInvoice, customerAddress: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input
                          id="due-date"
                          type="date"
                          value={newInvoice.dueDate}
                          onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tax">Tax (%)</Label>
                        <Input
                          id="tax"
                          type="number"
                          value={newInvoice.tax}
                          onChange={(e) => setNewInvoice({...newInvoice, tax: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount">Discount</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={newInvoice.discount}
                          onChange={(e) => setNewInvoice({...newInvoice, discount: parseFloat(e.target.value) || 0})}
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
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={createInvoice}>Create Invoice</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-sm text-muted-foreground">{invoice.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(invoice.total)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
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
                          onClick={() => sendInvoice(invoice)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {invoice.status === 'sent' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsPaid(invoice)}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInvoice(invoice.id)}
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

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-b pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">INVOICE</h2>
                    <p className="text-muted-foreground">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground mt-2">Due Date</div>
                    <div className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Bill To:</h3>
                  <div>
                    <div className="font-medium">{selectedInvoice.customerName}</div>
                    <div className="text-sm text-muted-foreground">{selectedInvoice.customerEmail}</div>
                    <div className="text-sm text-muted-foreground">{selectedInvoice.customerAddress}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">From:</h3>
                  <div>
                    <div className="font-medium">Roses Garden</div>
                    <div className="text-sm text-muted-foreground">123 Flower Street</div>
                    <div className="text-sm text-muted-foreground">Riyadh, Saudi Arabia</div>
                    <div className="text-sm text-muted-foreground">info@rosesgarden.com</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatPrice(selectedInvoice.tax)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes:</h3>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManager;