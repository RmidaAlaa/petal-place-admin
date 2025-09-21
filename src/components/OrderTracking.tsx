import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  XCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface TrackingEntry {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  created_by?: string;
  first_name?: string;
  last_name?: string;
  metadata?: Record<string, unknown>;
}

interface OrderTrackingProps {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, orderNumber, currentStatus }) => {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [trackingEntries, setTrackingEntries] = useState<TrackingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: ''
  });

  const loadTrackingHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getOrderTracking(orderId);
      setTrackingEntries(data as TrackingEntry[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load tracking information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    loadTrackingHistory();
  }, [loadTrackingHistory]);

  const handleCancelOrder = async () => {
    try {
      await apiService.cancelOrder(orderId, cancelReason);
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully',
      });
      setShowCancelDialog(false);
      setCancelReason('');
      loadTrackingHistory();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const handleRequestRefund = async () => {
    try {
      await apiService.requestRefund(orderId, refundData);
      toast({
        title: 'Refund Requested',
        description: 'Your refund request has been submitted',
      });
      setShowRefundDialog(false);
      setRefundData({ amount: '', reason: '' });
      loadTrackingHistory();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to request refund',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'refund_requested':
        return <RefreshCw className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refund_requested':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = ['pending', 'confirmed', 'processing'].includes(currentStatus.toLowerCase());
  const canRefund = ['delivered', 'cancelled'].includes(currentStatus.toLowerCase());

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading tracking information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Tracking - #{orderNumber}
            </span>
            <Badge className={getStatusColor(currentStatus)}>
              {currentStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackingEntries.length === 0 ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                No tracking information available yet. Your order is being processed.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {trackingEntries.map((entry, index) => (
                <div key={entry.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(entry.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm capitalize">
                        {entry.status.replace('_', ' ')}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {entry.description}
                    </p>
                    {entry.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </div>
                    )}
                    {entry.first_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        Updated by {entry.first_name} {entry.last_name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {canCancel && (
          <Button 
            variant="destructive" 
            onClick={() => setShowCancelDialog(true)}
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Order
          </Button>
        )}
        
        {canRefund && (
          <Button 
            variant="outline" 
            onClick={() => setShowRefundDialog(true)}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Request Refund
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={loadTrackingHistory}
          size="icon"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Reason for cancellation</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this order..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
              >
                Keep Order
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim()}
                className="flex-1"
              >
                Cancel Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Submit a refund request for this order. Our team will review your request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount (SAR)</Label>
              <Input
                id="refundAmount"
                type="number"
                value={refundData.amount}
                onChange={(e) => setRefundData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter refund amount"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refundReason">Reason for refund</Label>
              <Textarea
                id="refundReason"
                value={refundData.reason}
                onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please explain why you need a refund..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowRefundDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRequestRefund}
                disabled={!refundData.amount || !refundData.reason.trim()}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderTracking;
