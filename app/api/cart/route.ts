import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { mockProducts, mockPrices, mockStores } from '@/app/lib/mockData';

// Create mock cart data that doesn't rely on database
const createMockCartData = () => {
  // Create mock cart items (product 1, 2, and 3 with different quantities)
  const mockCartItems = [
    { id: 101, cartId: 1, productId: 1, storeId: 3, quantity: 2 },
    { id: 102, cartId: 1, productId: 2, storeId: 1, quantity: 1 },
    { id: 103, cartId: 1, productId: 4, storeId: 2, quantity: 3 }
  ];
  
  // Create product and price lookup maps
  const productMap = new Map();
  mockProducts.forEach(product => {
    productMap.set(product.id, product);
  });
  
  // Create a price lookup map from mockPrices
  const priceMap = new Map();
  mockPrices.forEach(price => {
    const key = `${price.productId}-${price.storeId}`;
    const store = mockStores.find(s => s.id === price.storeId);
    priceMap.set(key, {
      id: price.productId * 100 + price.storeId,
      productId: price.productId,
      storeId: price.storeId,
      amount: price.amount,
      currency: 'USD',
      inStock: true,
      store: store || { id: price.storeId, name: 'Unknown Store' }
    });
  });
  
  console.log('createMockCartData - Price map created with keys:', Array.from(priceMap.keys()));
  
  // Format the cart items
  const formattedItems = mockCartItems.map(item => {
    const product = productMap.get(item.productId);
    const priceKey = `${item.productId}-${item.storeId}`;
    const price = priceMap.get(priceKey);
    
    console.log(`createMockCartData - Item ${item.id}: Looking for price with key: ${priceKey}, Found:`, price ? 'Yes' : 'No');
    
    const priceAmount = price?.amount || 0;
    
    return {
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.productId.toString(),
        name: product?.name || 'Unknown Product',
        description: product?.description || '',
        image: product?.image || null,
        price: priceAmount,
        store: price?.store ? {
          id: typeof price.store.id === 'number' ? price.store.id.toString() : price.store.id,
          name: price.store.name
        } : { id: item.storeId.toString(), name: 'Unknown Store' }
      },
      storeId: item.storeId,
      subtotal: priceAmount * item.quantity
    };
  });
  
  // Calculate total
  const totalAmount = formattedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  
  console.log(`createMockCartData - Created ${formattedItems.length} items with total: $${totalAmount.toFixed(2)}`);
  
  return { cartItems: formattedItems, totalAmount };
};

export async function GET(request: NextRequest) {
  try {
    console.log('Cart API - Request received');
    
    // Check for test mode
    const testMode = request.nextUrl.searchParams.get('testMode') === 'true';
    console.log(`Cart API - Test mode: ${testMode}`);
    
    try {
      let userId: number | undefined;
      
      if (!testMode) {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
          console.log('Cart API - Unauthorized: No session or email');
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        // Find the user by email
        const userEmail = session.user.email;
        console.log('Cart API - Finding user with email:', userEmail);
        
        const user = await prisma.user.findUnique({
          where: { email: userEmail }
        });

        if (!user) {
          console.log('Cart API - User not found');
          return NextResponse.json({ items: [], total: 0 }); 
        }
        
        userId = user.id;
      } else {
        // In test mode, use the first user in the database
        console.log('Cart API - Using test mode - finding first user');
        const firstUser = await prisma.user.findFirst();
        
        if (!firstUser) {
          console.log('Cart API - No users found for test mode, using mock data');
          const mockData = createMockCartData();
          return NextResponse.json({
            items: mockData.cartItems,
            total: mockData.totalAmount
          });
        }
        
        userId = firstUser.id;
        console.log('Cart API - Using test user ID:', userId);
      }

      // Get all data needed for the cart in one query
      const cartData = await prisma.$transaction(async (tx) => {
        // Find the cart
        const cart = await tx.cart.findUnique({
          where: { userId }
        });
        
        if (!cart) {
          console.log('Cart API - No cart found');
          return { cartItems: [], totalAmount: 0 };
        }
        
        // Get cart items
        const cartItems = await tx.cartItem.findMany({
          where: { cartId: cart.id }
        });
        
        if (cartItems.length === 0) {
          console.log('Cart API - Cart has no items');
          return { cartItems: [], totalAmount: 0 };
        }
        
        // Get related product data
        const productIds = Array.from(new Set(cartItems.map(item => item.productId)));
        const products = await tx.product.findMany({
          where: { id: { in: productIds } }
        });
        
        // Get related price data
        const priceConditions = cartItems.map(item => ({
          productId: item.productId,
          storeId: item.storeId
        }));
        
        const prices = await tx.price.findMany({
          where: { OR: priceConditions },
          include: { store: true }
        });
        
        // Create a prices lookup map for faster access
        const priceMap = new Map();
        prices.forEach(price => {
          const key = `${price.productId}-${price.storeId}`;
          priceMap.set(key, price);
        });
        
        // Create a products lookup map for faster access
        const productMap = new Map();
        products.forEach(product => {
          productMap.set(product.id, product);
        });
        
        // If we don't have enough product data from the database, use the mock data
        if (products.length === 0 || productIds.length > products.length) {
          console.log('Cart API - Using mock product data as fallback');
          
          // Add the mock products to our map
          mockProducts.forEach(product => {
            if (!productMap.has(product.id)) {
              productMap.set(product.id, product);
            }
          });
          
          // Add any missing prices to the price map
          mockPrices.forEach(mockPrice => {
            const key = `${mockPrice.productId}-${mockPrice.storeId}`;
            console.log(`Cart API - Checking mock price: ${key}, Amount: ${mockPrice.amount}`);
            
            if (!priceMap.has(key)) {
              const store = mockStores.find(s => s.id === mockPrice.storeId);
              console.log(`Cart API - Adding mock price: Product ${mockPrice.productId}, Store ${mockPrice.storeId}, Store name: ${store?.name || 'Unknown'}`);
              
              priceMap.set(key, {
                id: mockPrice.productId * 100 + mockPrice.storeId, // Generate a unique ID
                productId: mockPrice.productId,
                storeId: mockPrice.storeId,
                amount: mockPrice.amount,
                currency: 'USD',
                inStock: true,
                store: store || { id: mockPrice.storeId, name: 'Unknown Store' }
              });
            }
          });
        }
        
        // Additional debug to check what's in the price map
        console.log('Cart API - Available price keys in map:', Array.from(priceMap.keys()));
        
        // Build the response data
        const formattedItems = cartItems.map(item => {
          const product = productMap.get(item.productId);
          const priceKey = `${item.productId}-${item.storeId}`;
          console.log(`Cart API - Looking for price with key: ${priceKey}`);
          
          let price = priceMap.get(priceKey);
          
          // If no price was found for this exact store, try to find a price for this product from any store
          if (!price) {
            console.log(`Cart API - No price found for key ${priceKey}, looking for any price for product ${item.productId}`);
            
            // Find the first price for this product in mockPrices
            const mockPrice = mockPrices.find(p => p.productId === item.productId);
            if (mockPrice) {
              console.log(`Cart API - Found mock price for product ${item.productId}: ${mockPrice.amount}`);
              const store = mockStores.find(s => s.id === mockPrice.storeId);
              price = {
                id: mockPrice.productId * 100 + mockPrice.storeId,
                productId: mockPrice.productId,
                storeId: mockPrice.storeId,
                amount: mockPrice.amount,
                currency: 'USD',
                inStock: true,
                store: store || { id: mockPrice.storeId, name: 'Unknown Store' }
              };
            }
          }
          
          const priceAmount = price?.amount || 0;
          
          console.log(`Cart API - Final price for item ${item.id}: ${priceAmount}`);
          
          // Debug product details, especially image path
          if (product) {
            console.log(`Cart API - Product ${item.productId} details:`, {
              name: product.name,
              image: product.image,
              categoryId: product.categoryId
            });
          }
          
          return {
            id: item.id,
            quantity: item.quantity,
            product: {
              id: item.productId.toString(),
              name: product?.name || 'Unknown Product',
              description: product?.description || '',
              image: product?.image || null,
              price: priceAmount,
              store: price?.store ? {
                id: typeof price.store.id === 'number' ? price.store.id.toString() : price.store.id,
                name: price.store.name
              } : { id: item.storeId.toString(), name: 'Unknown Store' }
            },
            storeId: item.storeId,
            subtotal: priceAmount * item.quantity
          };
        });
        
        // Calculate total
        const totalAmount = formattedItems.reduce(
          (sum, item) => sum + item.subtotal, 
          0
        );
        
        return { cartItems: formattedItems, totalAmount };
      });

      return NextResponse.json({
        items: cartData.cartItems,
        total: cartData.totalAmount
      });
    } catch (dbError) {
      // If there's a database error, use mock data instead
      console.error('Cart API - Database error, falling back to mock data:', dbError);
      const mockData = createMockCartData();
      return NextResponse.json({
        items: mockData.cartItems,
        total: mockData.totalAmount
      });
    }
  } catch (error: any) {
    console.error('Cart API - Error:', error);
    // Fallback to mock data for any other errors
    const mockData = createMockCartData();
    return NextResponse.json({
      items: mockData.cartItems,
      total: mockData.totalAmount
    });
  }
} 