import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CreditCard, 
  MapPin, 
  Calendar,
  Clock,
  Gift,
  Shield,
  Truck,
  User,
  Mail,
  Phone,
  Lock
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

interface DeliveryAddress {
  id?: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last_four?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
}

interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
  price: number;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: cartState, refreshCart } = useCart();
  const { state: authState } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form data
  const [customerInfo, setCustomerInfo] = useState({
    email: authState.user?.email || '',
    phone: authState.user?.phone || '',
    first_name: authState.user?.first_name || '',
    last_name: authState.user?.last_name || '',
  });

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    first_name: authState.user?.first_name || '',
    last_name: authState.user?.last_name || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: authState.user?.phone || '',
    is_default: true,
  });

  const [billingAddress, setBillingAddress] = useState<DeliveryAddress>({
    first_name: authState.user?.first_name || '',
    last_name: authState.user?.last_name || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: authState.user?.phone || '',
    is_default: true,
  });

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Time slots
  const timeSlots: TimeSlot[] = [
    { id: 'morning', label: '9:00 AM - 12:00 PM', available: true, price: 0 },
    { id: 'afternoon', label: '12:00 PM - 3:00 PM', available: true, price: 0 },
    { id: 'evening', label: '3:00 PM - 6:00 PM', available: true, price: 0 },
    { id: 'night', label: '6:00 PM - 9:00 PM', available: true, price: 5 },
  ];

  // Get available delivery dates (next 30 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return dates;
  };

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartState.itemCount === 0) {
      navigate('/');
      return;
    }

    refreshCart();
  }, [authState.isAuthenticated, cartState.itemCount, navigate, refreshCart]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, you would:
      // 1. Create order in database
      // 2. Process payment
      // 3. Send confirmation email
      // 4. Clear cart
      
      toast.success('Order placed successfully!');
      navigate('/success');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, title: 'Customer Info', icon: User },
    { number: 2, title: 'Delivery Details', icon: MapPin },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Review & Confirm', icon: Check },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading checkout..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shopping
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your order securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Steps */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = currentStep === step.number;
                      const isCompleted = currentStep > step.number;
                      
                      return (
                        <div key={step.number} className="flex items-center">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            isActive 
                              ? 'border-primary bg-primary text-primary-foreground' 
                              : isCompleted 
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-muted-foreground text-muted-foreground'
                          }`}>
                            {isCompleted ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <Icon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${
                              isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              {step.title}
                            </div>
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`w-16 h-0.5 mx-4 ${
                              isCompleted ? 'bg-green-500' : 'bg-muted'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Step 1: Customer Information */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                          id="first_name"
                          value={customerInfo.first_name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, first_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                          id="last_name"
                          value={customerInfo.last_name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, last_name: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Delivery Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="delivery_first_name">First Name *</Label>
                          <Input
                            id="delivery_first_name"
                            value={deliveryAddress.first_name}
                            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, first_name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="delivery_last_name">Last Name *</Label>
                          <Input
                            id="delivery_last_name"
                            value={deliveryAddress.last_name}
                            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, last_name: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="address_line_1">Address Line 1 *</Label>
                        <Input
                          id="address_line_1"
                          value={deliveryAddress.address_line_1}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address_line_2">Address Line 2</Label>
                        <Input
                          id="address_line_2"
                          value={deliveryAddress.address_line_2}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={deliveryAddress.city}
                            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={deliveryAddress.state}
                            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="postal_code">Postal Code *</Label>
                          <Input
                            id="postal_code"
                            value={deliveryAddress.postal_code}
                            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="delivery_phone">Phone Number *</Label>
                        <Input
                          id="delivery_phone"
                          type="tel"
                          value={deliveryAddress.phone}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Delivery Date & Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="delivery_date">Delivery Date *</Label>
                        <Select value={deliveryDate} onValueChange={setDeliveryDate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery date" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableDates().map((date) => (
                              <SelectItem key={date.value} value={date.value}>
                                {date.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Time Slot *</Label>
                        <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                          {timeSlots.map((slot) => (
                            <div key={slot.id} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={slot.id} 
                                id={slot.id}
                                disabled={!slot.available}
                              />
                              <Label 
                                htmlFor={slot.id} 
                                className={`flex-1 flex items-center justify-between ${
                                  !slot.available ? 'text-muted-foreground' : ''
                                }`}
                              >
                                <span>{slot.label}</span>
                                <span className="text-sm">
                                  {slot.price === 0 ? 'Free' : `+${formatPrice(slot.price)}`}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Gift className="h-5 w-5 mr-2" />
                        Gift Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="gift_message">Gift Message (Optional)</Label>
                        <Textarea
                          id="gift_message"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Add a personal message..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="special_instructions">Special Delivery Instructions</Label>
                        <Textarea
                          id="special_instructions"
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="Any special instructions for delivery..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                        onClick={() => setPaymentMethod({ id: 'card', type: 'card', is_default: true })}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span>Credit/Debit Card</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                        onClick={() => setPaymentMethod({ id: 'paypal', type: 'paypal', is_default: true })}
                      >
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span>PayPal</span>
                      </Button>
                    </div>

                    {paymentMethod?.type === 'card' && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">Card Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="card_number">Card Number</Label>
                            <Input
                              id="card_number"
                              placeholder="1234 5678 9012 3456"
                              className="font-mono"
                            />
                          </div>
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              className="font-mono"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              className="font-mono"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="save_payment"
                            checked={savePaymentMethod}
                            onCheckedChange={(checked) => setSavePaymentMethod(checked === true)}
                          />
                          <Label htmlFor="save_payment" className="text-sm">
                            Save this payment method for future purchases
                          </Label>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Your payment information is secure and encrypted</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {cartState.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4">
                            <div className="w-16 h-16 overflow-hidden rounded-md bg-muted">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} • {formatPrice(item.price)} each
                              </p>
                            </div>
                            <div className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">
                          {deliveryAddress.first_name} {deliveryAddress.last_name}
                        </p>
                        <p className="text-muted-foreground">
                          {deliveryAddress.address_line_1}
                          {deliveryAddress.address_line_2 && `, ${deliveryAddress.address_line_2}`}
                        </p>
                        <p className="text-muted-foreground">
                          {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.postal_code}
                        </p>
                        <p className="text-muted-foreground">{deliveryAddress.phone}</p>
                        <p className="text-sm text-muted-foreground">
                          Delivery: {deliveryDate && new Date(deliveryDate).toLocaleDateString()} - {timeSlots.find(s => s.id === selectedTimeSlot)?.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={setTermsAccepted}
                          />
                          <Label htmlFor="terms" className="text-sm leading-relaxed">
                            I agree to the Terms of Service and Privacy Policy. I understand that my order is subject to availability and delivery times may vary.
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button onClick={handleNextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={!termsAccepted || isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartState.itemCount} items)</span>
                      <span>{formatPrice(cartState.summary?.subtotal || cartState.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {(cartState.summary?.shipping || 0) === 0 ? 'Free' : formatPrice(cartState.summary?.shipping || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatPrice(cartState.summary?.tax || 0)}</span>
                    </div>
                    {selectedTimeSlot && timeSlots.find(s => s.id === selectedTimeSlot)?.price > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee</span>
                        <span>{formatPrice(timeSlots.find(s => s.id === selectedTimeSlot)?.price || 0)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>
                        {formatPrice(
                          (cartState.summary?.total || cartState.total) + 
                          (timeSlots.find(s => s.id === selectedTimeSlot)?.price || 0)
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-3 w-3" />
                      <span>Free shipping on orders over $100</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-3 w-3" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>30-day return policy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CheckoutPage;
