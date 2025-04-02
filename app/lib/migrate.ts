/**
 * Helper function to run database migrations in sequence
 */
export async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // 1. Fix product IDs
    console.log('Step 1: Running product ID fixes...');
    const productFixResponse = await fetch('/api/migrations/fix-product-ids-database');
    
    if (!productFixResponse.ok) {
      throw new Error(`Failed to run product ID migration: ${productFixResponse.status}`);
    }
    
    const productFixResult = await productFixResponse.json();
    console.log('Product ID fix result:', productFixResult);
    
    // 2. Fix cart data
    console.log('Step 2: Running cart database fixes...');
    const cartFixResponse = await fetch('/api/migrations/fix-cart-database');
    
    if (!cartFixResponse.ok) {
      throw new Error(`Failed to run cart fix migration: ${cartFixResponse.status}`);
    }
    
    const cartFixResult = await cartFixResponse.json();
    console.log('Cart fix result:', cartFixResult);
    
    console.log('All migrations completed successfully');
    return { 
      success: true,
      productFix: productFixResult,
      cartFix: cartFixResult
    };
    
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 