import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { mockProducts, mockStores } from '@/app/lib/mockData';

// Create a test cart using only mock data, without database access
const createMockTestCart = () => {
  const cartId = Math.floor(Math.random() * 10000);
  
  // Create 3 cart items with different products
  const cartItems = [];
  
  // Use the first 3 mock products (or fewer if not available)
  const productsToAdd = Math.min(3, mockProducts.length);
  
  for (let i = 0; i < productsToAdd; i++) {
    const product = mockProducts[i];
    const storeId = mockStores[0]?.id || 1;
    const quantity = i === 0 ? 2 : 1; // First product has quantity 2
    
    const itemId = cartId * 10 + i;
    cartItems.push({
      id: itemId,
      productId: product.id,
      storeId,
      quantity,
      cartId
    });
  }
  
  return {
    success: true,
    cartId,
    itemCount: cartItems.length,
    items: cartItems
  };
};

export async function GET() {
  try {
    console.log('Create Test Cart API - Request received');
    
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      console.log('Create Test Cart API - Finding user with email:', session.user.email);
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          cart: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!user) {
        console.log('Create Test Cart API - User not found in database');
        // Fall back to mock cart instead of returning error
        console.log('Create Test Cart API - Using mock data instead');
        const mockCart = createMockTestCart();
        return NextResponse.json({
          success: true,
          cartId: mockCart.cartId,
          itemCount: mockCart.itemCount,
          message: 'Mock test cart created'
        });
      }

      // Delete existing cart if it exists
      if (user.cart) {
        console.log('Create Test Cart API - Removing existing cart:', user.cart.id);
        await prisma.cart.delete({
          where: { id: user.cart.id },
        });
      }

      // Create new cart
      console.log('Create Test Cart API - Creating new cart for user:', user.id);
      const cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
        include: {
          items: true,
        },
      });

      // Get a sample product
      let product = await prisma.product.findFirst();
      if (!product) {
        console.log('Create Test Cart API - No products in database, using mock product');
        // Create a product with the required Prisma schema
        product = {
          id: mockProducts[0].id,
          name: mockProducts[0].name,
          description: mockProducts[0].description,
          image: mockProducts[0].image,
          categoryId: mockProducts[0].categoryId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Get a store for the product
      let store: any = await prisma.store?.findFirst?.() || null;
      if (!store) {
        console.log('Create Test Cart API - No stores in database, using mock store');
        // Create a store with the required Prisma schema
        store = {
          id: mockStores[0].id,
          name: mockStores[0].name,
          address: mockStores[0].address,
          logo: mockStores[0].logo,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Add sample items to cart - let's add 3 different products
      console.log('Create Test Cart API - Adding items to cart:', cart.id);
      
      const cartItems = [];
      // Add first mock product
      const cartItem1 = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: mockProducts[0].id,
          quantity: 2,
          storeId: store.id,
        },
      });
      cartItems.push(cartItem1);
      console.log('Create Test Cart API - Added item 1:', cartItem1.id);
      
      // Add second mock product (if available)
      if (mockProducts.length > 1) {
        const cartItem2 = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: mockProducts[1].id,
            quantity: 1,
            storeId: store.id,
          },
        });
        cartItems.push(cartItem2);
        console.log('Create Test Cart API - Added item 2:', cartItem2.id);
      }
      
      // Add third mock product (if available)
      if (mockProducts.length > 2) {
        const cartItem3 = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: mockProducts[2].id,
            quantity: 3,
            storeId: store.id,
          },
        });
        cartItems.push(cartItem3);
        console.log('Create Test Cart API - Added item 3:', cartItem3.id);
      }

      console.log('Create Test Cart API - Test cart created successfully');
      return NextResponse.json({
        success: true,
        cartId: cart.id,
        itemCount: cartItems.length
      });
    } catch (dbError) {
      // If there's any database error, fall back to mock data
      console.error('Create Test Cart API - Database error, using mock data instead:', dbError);
      const mockCart = createMockTestCart();
      return NextResponse.json({
        success: true,
        cartId: mockCart.cartId,
        itemCount: mockCart.itemCount,
        message: 'Mock test cart created due to database error'
      });
    }
  } catch (error) {
    console.error('Create Test Cart API - Error creating test cart:', error);
    // Even for unexpected errors, we'll try to create a mock cart
    try {
      const mockCart = createMockTestCart();
      return NextResponse.json({
        success: true,
        cartId: mockCart.cartId,
        itemCount: mockCart.itemCount,
        message: 'Fallback mock test cart created'
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to create test cart' },
        { status: 500 }
      );
    }
  }
} 