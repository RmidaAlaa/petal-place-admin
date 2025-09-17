import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import apiService from '../services/api';

interface CartSidebarProps {
  children: React.ReactNode;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ children }) => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityUpdate = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!authState.isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      return;
    }

    if (state.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add some items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const defaultShippingAddress = {
        street: 'Default Street',
        city: 'Default City',
        state: 'Default State', 
        zipCode: '12345',
        country: 'Default Country'
      };

      const orderData = {
        items: state.items.map(item => ({
          product_id: item.id.split('-')[0],
          quantity: item.quantity,
          unit_price: item.price
        })),
        shipping_address: {
          firstName: authState.user?.first_name || 'Guest',
          lastName: authState.user?.last_name || 'User',
          address: defaultShippingAddress.street,
          city: defaultShippingAddress.city,
          state: defaultShippingAddress.state,
          zipCode: defaultShippingAddress.zipCode,
          country: defaultShippingAddress.country,
        }
      };

      const order = await apiService.createOrder(orderData) as { order_number: string };
      
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.order_number} has been created.`,
      });

      clearCart();
      setShowCheckout(false);
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {state.itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {state.itemCount}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({state.itemCount} items)
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground">Add some beautiful flowers to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-muted/30 p-3 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                    {item.vendor && (
                      <p className="text-xs text-muted-foreground">by {item.vendor}</p>
                    )}
                    <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>${state.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={isLoading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isLoading ? "Processing..." : "Proceed to Checkout"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;