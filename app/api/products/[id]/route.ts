import { NextRequest, NextResponse } from 'next/server';
import { mockProducts, mockPrices, mockStores } from '@/app/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Product API - Request received for ID:', params.id);
    
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      console.error('Product API - Invalid product ID:', params.id);
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    // Find product in mock data
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      console.error('Product API - Product not found:', productId);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Get prices for this product
    const productPrices = mockPrices
      .filter(price => price.productId === productId)
      .map(price => {
        const store = mockStores.find(s => s.id === price.storeId);
        return {
          storeId: price.storeId,
          amount: price.amount,
          store: store || { id: price.storeId, name: 'Unknown Store' }
        };
      })
      // Sort by price ascending so lowest price is first
      .sort((a, b) => a.amount - b.amount);
    
    // Create a complete product with prices
    const productWithPrices = {
      ...product,
      prices: productPrices
    };
    
    console.log('Product API - Found product:', product.name, 'with', productPrices.length, 'prices');
    return NextResponse.json(productWithPrices);
    
  } catch (error: any) {
    console.error('Product API - Unhandled error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
