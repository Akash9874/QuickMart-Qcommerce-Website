import { NextRequest, NextResponse } from 'next/server';
import { addToCart } from '@/app/lib/cart';

export async function POST(request: NextRequest) {
  try {
    console.log('Cart Add API - Request received');
    
    // Get the request body
    let body: any;
    try {
      body = await request.json();
      console.log('Cart Add API - Request body:', JSON.stringify(body));
    } catch (error) {
      console.error('Cart Add API - Invalid request body:', error);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { productId, quantity = 1, storeId = 1 } = body;
    
    // Validate product ID exists
    if (!productId) {
      console.log('Cart Add API - Missing productId');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    try {
      // Add item to cart - this will now work with localStorage on the client side
      // On the server this just validates that the product exists in mockProducts
      const cartItem = addToCart(parseInt(productId), parseInt(String(storeId)), quantity);
      if (!cartItem) {
        throw new Error('Failed to add item to cart');
      }
      
      console.log('Cart Add API - Item added with ID:', cartItem.id);
      
      return NextResponse.json({
        success: true,
        message: 'Item added to cart',
        cartItem
      });
      
    } catch (error: any) {
      console.error('Cart Add API - Error adding item:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('Cart Add API - Unhandled error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}