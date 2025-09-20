import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Success = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      confirmPayment();
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const confirmPayment = async () => {
    try {
      setIsLoading(true);
      const result = await apiService.confirmPayment(sessionId!);
      setOrder((result as any).order);
      
      toast({
        title: 'Payment Successful!',
        description: 'Your order has been confirmed and will be processed soon.',
      });
    } catch (error: any) {
      toast({
        title: 'Payment Confirmation Failed',
        description: error.message || 'Failed to confirm payment. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-card-foreground">
                Payment Successful!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Confirming your payment...</p>
                </div>
              ) : order ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Order Details</h3>
                    <div className="space-y-1 text-sm text-green-700">
                      <p><strong>Order Number:</strong> {order.order_number}</p>
                      <p><strong>Total Amount:</strong> {order.total_amount} SAR</p>
                      <p><strong>Status:</strong> {order.status}</p>
                      <p><strong>Payment Status:</strong> {order.payment_status}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-card-foreground">What's Next?</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• You will receive an email confirmation shortly</p>
                      <p>• Our team will prepare your order</p>
                      <p>• You'll be notified when your order is ready for delivery</p>
                      <p>• Track your order status in your profile</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link to="/profile">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View Orders
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/">
                        <Home className="h-4 w-4 mr-2" />
                        Continue Shopping
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Thank you for your purchase! Your payment has been processed successfully.
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• You will receive an email confirmation shortly</p>
                      <p>• Our team will prepare your order</p>
                      <p>• You'll be notified when your order is ready for delivery</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link to="/profile">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View Orders
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/">
                        <Home className="h-4 w-4 mr-2" />
                        Continue Shopping
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Success;
