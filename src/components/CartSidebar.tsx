import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  Heart, 
  ArrowRight,
  X,
  Tag,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface CartSidebarProps {
  children?: React.ReactNode;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  
  const { state, removeItemAsync, updateQuantityAsync, applyCoupon, saveForLater, clearCartAsync } = useCart();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeItemAsync(itemId);
      } else {
        await updateQuantityAsync(itemId, newQuantity);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItemAsync(itemId);
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const handleSaveForLater = async (itemId: string) => {
    try {
      await saveForLater(itemId);
      toast.success('Item saved for later');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item for later');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setIsApplyingCoupon(true);
      await applyCoupon(couponCode.trim());
      setAppliedCoupon(couponCode.trim());
      setCouponCode('');
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (authState.isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
    setIsOpen(false);
  };

  const handleClearCart = async () => {
    try {
      await clearCartAsync();
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cart');
    }
  };

  const cartItemCount = state.itemCount;
  const cartTotal = state.summary?.total || state.total;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({cartItemCount})</span>
            {cartItemCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {state.isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading cart..." />
          </div>
        ) : cartItemCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">Add some items to get started</p>
            </div>
            <Button onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {state.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {item.vendor} • {item.category}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-medium text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatPrice(item.price)} each
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveForLater(item.id)}
                                className="text-xs h-6 px-2"
                              >
                                <Heart className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-xs h-6 px-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Coupon Code */}
            <div className="flex-shrink-0 py-4 border-t">
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                    disabled={isApplyingCoupon || !!appliedCoupon}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || isApplyingCoupon || !!appliedCoupon}
                    size="sm"
                  >
                    {isApplyingCoupon ? (
                      <LoadingSpinner size="small" />
                    ) : appliedCoupon ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Tag className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {appliedCoupon && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Coupon "{appliedCoupon}" applied</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAppliedCoupon(null)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="flex-shrink-0 space-y-4">
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(state.summary?.subtotal || state.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {(state.summary?.shipping || 0) === 0 ? 'Free' : formatPrice(state.summary?.shipping || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(state.summary?.tax || 0)}</span>
                </div>
                {state.summary?.discount && state.summary.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(state.summary.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout} 
                  className="w-full"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/');
                  }}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Free Returns</span>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;