import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
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
      <SheetContent 
        side="right" 
        className="w-[100vw] sm:w-[90vw] md:w-[450px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="flex-shrink-0 px-4 py-3 sm:p-6 border-b">
          <SheetTitle className="flex items-center justify-between text-base sm:text-lg">
            <span>Shopping Cart ({cartItemCount} items)</span>
            {cartItemCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="h-8 px-2 text-xs sm:text-sm text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {state.isLoading ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-sm text-muted-foreground">Loading cart...</span>
          </div>
        ) : cartItemCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4">
            <div className="rounded-full bg-muted p-4 sm:p-6">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">Add some items to get started</p>
            </div>
            <Button 
              onClick={() => setIsOpen(false)}
              className="mt-4"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 py-2 sm:py-4">
              <div className="space-y-2 sm:space-y-4 px-4 sm:px-6">
                {state.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-0 shadow-none bg-muted/30">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-2">
                            {item.vendor} • {item.category}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <span className="text-sm sm:text-base font-medium min-w-[2.5rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm sm:text-base">
                                <div className="font-medium">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatPrice(item.price)} each
                                </div>
                              </div>
                              
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted"
                                  onClick={() => handleSaveForLater(item.id)}
                                >
                                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
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
            <div className="flex-shrink-0 p-4 sm:p-6 border-t">
              <div className="space-y-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                    <div className="flex items-center gap-2 text-secondary-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Coupon applied: {appliedCoupon}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAppliedCoupon(null)}
                      className="h-7 w-7 rounded-full hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                      disabled={isApplyingCoupon}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      size="sm"
                      className="min-w-[80px]"
                    >
                      {isApplyingCoupon ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">...</span>
                        </>
                      ) : (
                        <>
                          <Tag className="h-4 w-4 mr-2" />
                          Apply
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="flex-shrink-0 p-4 sm:p-6 space-y-4 border-t bg-muted/30">
              <div className="space-y-1.5 text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(state.summary?.subtotal || state.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {(state.summary?.shipping || 0) === 0 ? (
                      <span className="text-primary font-medium">Free</span>
                    ) : (
                      formatPrice(state.summary?.shipping || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(state.summary?.tax || 0)}</span>
                </div>
                {state.summary?.discount && state.summary.discount > 0 && (
                  <div className="flex justify-between items-center text-primary">
                    <span>Discount</span>
                    <span>-{formatPrice(state.summary.discount)}</span>
                  </div>
                )}
              </div>

              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-semibold">Total</span>
                <span className="text-base sm:text-lg font-semibold">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <Button 
                  onClick={handleCheckout} 
                  size="lg"
                  className="w-full shadow-md"
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
                  className="w-full hover:bg-muted"
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Security Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground pt-2">
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
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