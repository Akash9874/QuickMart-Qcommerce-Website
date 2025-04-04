'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CreditCard, Check, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    store: {
      id: string;
      name: string;
    };
  };
  quantity: number;
}

interface Cart {
  id?: string;
  items: CartItem[];
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { updateCartCount } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit-card');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const processPayment = async () => {
    setIsProcessing(true);
    try {
      // In a real app, you would call your payment API here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Clear cart after successful order
      await fetch('/api/cart/clear', {
        method: 'POST',
      });
      
      // Update cart count
      await updateCartCount();
      
      // Show success message
      toast({
        title: 'Order Placed Successfully',
        description: 'Thank you for your order!',
        variant: 'success',
      });
      
      // Redirect to success page
      router.push('/checkout/success');
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const validateShippingInfo = () => {
    const { firstName, lastName, email, address, city, state, zipCode } = formData;
    return firstName && lastName && email && address && city && state && zipCode;
  };

  const validatePaymentInfo = () => {
    if (paymentMethod === 'credit-card') {
      const { cardNumber, cardName, expiryDate, cvv } = formData;
      return cardNumber && cardName && expiryDate && cvv;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateShippingInfo()) {
      setCurrentStep(2);
    } else if (currentStep === 1) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required shipping fields.',
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitOrder = () => {
    if (validatePaymentInfo()) {
      processPayment();
    } else {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required payment fields.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading checkout information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchCart}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            You don't have any items in your cart to checkout.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Steps */}
        <div className="lg:w-2/3 space-y-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full 
                ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full
                ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <div className="text-sm font-medium">Shipping</div>
              <div className="text-sm font-medium">Payment</div>
            </div>
          </div>
          
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name*</label>
                  <input
                    type="text"
                    name="firstName"
                    className="w-full p-2 border rounded"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name*</label>
                  <input
                    type="text"
                    name="lastName"
                    className="w-full p-2 border rounded"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Email Address*</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-2 border rounded"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Street Address*</label>
                  <input
                    type="text"
                    name="address"
                    className="w-full p-2 border rounded"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City*</label>
                  <input
                    type="text"
                    name="city"
                    className="w-full p-2 border rounded"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State/Province*</label>
                  <input
                    type="text"
                    name="state"
                    className="w-full p-2 border rounded"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP/Postal Code*</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="w-full p-2 border rounded"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country*</label>
                  <select
                    name="country"
                    className="w-full p-2 border rounded"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={nextStep}>Continue to Payment</Button>
              </div>
            </Card>
          )}
          
          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <input
                    type="radio"
                    id="credit-card"
                    name="paymentMethod"
                    value="credit-card"
                    checked={paymentMethod === 'credit-card'}
                    onChange={() => setPaymentMethod('credit-card')}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor="credit-card" className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-gray-700" />
                    Credit Card
                  </label>
                </div>
                
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor="paypal" className="flex items-center">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#00457C">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42.942 4.316-.136.711-.372 1.467-.696 2.247-.696 1.643-1.904 3.186-3.494 4.466-1.439 1.179-3.14 1.95-5.158 2.32-.71.136-1.45.204-2.212.204h-.055a2.97 2.97 0 0 0-2.926 2.47l-.067.368-.32 1.75c-.05.284-.294.487-.582.487Z" />
                      <path d="M9.825 21.337H5.22a.641.641 0 0 1-.634-.74L7.692.902C7.775.382 8.223 0 8.747 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42.942 4.316-.136.711-.372 1.467-.696 2.247-.696 1.643-1.904 3.186-3.494 4.466-1.439 1.179-3.14 1.95-5.158 2.32-.71.136-1.45.204-2.212.204h-.055a2.97 2.97 0 0 0-2.926 2.47l-.067.368-.32 1.75c-.05.284-.294.487-.582.487Z" fill="#00457C" />
                      <path d="M7.717 21.113 9.77 8.289c.038-.225.234-.38.463-.358h4.18c.962 0 1.632.134 2.06.412.415.269.68.714.782 1.327.053.328.027.6-.008.813l-.016.105a6.495 6.495 0 0 1-.573 1.778 5.834 5.834 0 0 1-1.222 1.479c-.844.766-1.944 1.143-3.36 1.143h-.868c-.388 0-.718.282-.783.665l-.066.39-.906 5.07Z" fill="#0079C1" />
                    </svg>
                    PayPal
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'credit-card' && (
                <div className="mt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Card Number*</label>
                    <input
                      type="text"
                      name="cardNumber"
                      className="w-full p-2 border rounded"
                      placeholder="**** **** **** ****"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Cardholder Name*</label>
                    <input
                      type="text"
                      name="cardName"
                      className="w-full p-2 border rounded"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry Date*</label>
                      <input
                        type="text"
                        name="expiryDate"
                        className="w-full p-2 border rounded"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVV*</label>
                      <input
                        type="text"
                        name="cvv"
                        className="w-full p-2 border rounded"
                        placeholder="***"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'paypal' && (
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <p className="text-sm text-gray-700">
                    You will be redirected to PayPal to complete your payment after reviewing your order.
                  </p>
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back to Shipping
                </Button>
                <Button 
                  onClick={submitOrder} 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card className="p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="divide-y">
              {cart.items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={item.product.image.startsWith('/') ? item.product.image : `/products/${item.product.image}`}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.product.store.name} - Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping:</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                <span>${(cart.total * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t font-semibold">
                <span>Total:</span>
                <span>${(cart.total + 5.99 + cart.total * 0.08).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-600 flex items-center">
              <Lock className="h-4 w-4 mr-2 inline" />
              Your payment information is secured with encryption
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 