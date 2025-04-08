import { mockProducts, mockPrices } from './mockData';

export interface CartItem {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  product: any;
  price: any;
}

// Function to get cart items from storage
export function getCart(): CartItem[] {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const cartData = localStorage.getItem('quickmart_cart');
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error retrieving cart from localStorage:', error);
    return [];
  }
}

// Function to save cart items to storage
function saveCart(items: CartItem[]): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('quickmart_cart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

export function addToCart(productId: number, storeId: number = 1, quantity: number = 1): CartItem | null {
  // Verify product exists
  const product = mockProducts.find(p => p.id === productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Find price
  const price = mockPrices.find(p => p.productId === productId && p.storeId === storeId);
  if (!price) {
    throw new Error('Price not found for this store');
  }

  // Get current cart
  const cartItems = getCart();
  
  // Check if item already exists in cart
  const existingItemIndex = cartItems.findIndex(
    item => item.productId === productId && item.storeId === storeId
  );
  
  let cartItem: CartItem;
  
  if (existingItemIndex >= 0) {
    // Update existing item quantity
    cartItems[existingItemIndex].quantity += quantity;
    cartItem = cartItems[existingItemIndex];
  } else {
    // Create new cart item
    cartItem = {
      id: Math.floor(Math.random() * 10000),
      productId,
      storeId,
      quantity,
      product,
      price
    };
    
    // Add to cart
    cartItems.push(cartItem);
  }
  
  // Save updated cart
  saveCart(cartItems);

  return cartItem;
}

export function updateCartItemQuantity(itemId: number, quantity: number): CartItem | null {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }
  
  // Get current cart
  const cartItems = getCart();
  
  // Find the item
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  // Update the quantity
  cartItems[itemIndex].quantity = quantity;
  
  // Save updated cart
  saveCart(cartItems);
  
  return cartItems[itemIndex];
}

export function removeCartItem(itemId: number): boolean {
  // Get current cart
  const cartItems = getCart();
  
  // Check if item exists
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return false;
  }
  
  // Remove the item
  cartItems.splice(itemIndex, 1);
  
  // Save updated cart
  saveCart(cartItems);
  
  return true;
}

export function clearCart(): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('quickmart_cart');
}
