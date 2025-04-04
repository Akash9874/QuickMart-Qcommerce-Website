import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  console.log('DB Test - Starting database connection test');
  
  try {
    // Test database connection with a simple query
    console.log('DB Test - Checking database connection');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('DB Test - Connection successful:', result);
    
    // Try to count users
    console.log('DB Test - Counting users');
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "User"`;
    console.log('DB Test - User count:', userCount);
    
    // Try to fetch first product
    console.log('DB Test - Fetching first product');
    const product = await prisma.$queryRaw`SELECT * FROM "Product" LIMIT 1`;
    console.log('DB Test - Product:', product);
    
    // Check environment variables
    console.log('DB Test - Checking environment variables');
    const databaseUrl = process.env.DATABASE_URL || 'Not set';
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      databaseConnected: true,
      testQuery: result,
      userCount,
      product: Array.isArray(product) && product.length > 0 ? 
        { id: product[0].id, name: product[0].name } : 
        'No products found',
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      databaseUrlPrefix: databaseUrl.substring(0, 20) + '...' // Don't show full URL for security
    });
  } catch (error: any) {
    console.error('DB Test - Error:', error);
    
    // Try to get more detailed error information
    let errorDetails = {
      message: error.message || 'Unknown error',
      code: error.code,
      meta: error.meta,
      stack: error.stack
    };
    
    return NextResponse.json({
      success: false,
      message: 'Database connection test failed',
      databaseConnected: false,
      error: errorDetails,
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 20) + '...' : 
        'Not set'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 