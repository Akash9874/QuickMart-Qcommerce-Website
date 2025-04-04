import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug API - Starting tests');
    const results = {
      tests: [] as any[],
      success: true,
      timestamp: new Date().toISOString()
    };

    // Test 1: Check all product endpoints
    for (let i = 1; i <= 5; i++) {
      try {
        console.log(`Debug API - Testing product ID ${i}`);
        const productResponse = await fetch(`${request.nextUrl.origin}/api/products/${i}`);
        const productSuccess = productResponse.ok;
        const productStatus = productResponse.status;
        let productData = null;
        
        try {
          productData = await productResponse.json();
        } catch (e) {
          console.error(`Debug API - Error parsing product ${i} response:`, e);
        }
        
        results.tests.push({
          name: `Product ${i} API Test`,
          success: productSuccess,
          status: productStatus,
          data: productSuccess ? productData?.name : null,
          error: !productSuccess ? productData?.error : null
        });
        
        if (!productSuccess) {
          results.success = false;
        }
      } catch (productError: any) {
        console.error(`Debug API - Error testing product ${i}:`, productError);
        results.tests.push({
          name: `Product ${i} API Test`,
          success: false,
          error: productError.message
        });
        results.success = false;
      }
    }

    // Test 2: Try to add a product to cart
    try {
      console.log('Debug API - Testing cart add functionality');
      const cartAddResponse = await fetch(`${request.nextUrl.origin}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: 1,
          quantity: 1,
          storeId: 1,
          testMode: true
        })
      });
      
      const cartAddSuccess = cartAddResponse.ok;
      const cartAddStatus = cartAddResponse.status;
      let cartAddData = null;
      
      try {
        cartAddData = await cartAddResponse.json();
      } catch (e) {
        console.error('Debug API - Error parsing cart add response:', e);
      }
      
      results.tests.push({
        name: 'Cart Add Test',
        success: cartAddSuccess,
        status: cartAddStatus,
        data: cartAddSuccess ? 'Successfully added to cart' : null,
        error: !cartAddSuccess ? cartAddData?.error : null
      });
      
      if (!cartAddSuccess) {
        results.success = false;
      }
    } catch (cartAddError: any) {
      console.error('Debug API - Error testing cart add:', cartAddError);
      results.tests.push({
        name: 'Cart Add Test',
        success: false,
        error: cartAddError.message
      });
      results.success = false;
    }

    console.log('Debug API - Tests completed');
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Debug API - Unhandled error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 