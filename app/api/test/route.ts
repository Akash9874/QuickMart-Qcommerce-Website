import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    console.log('Test API endpoint called');
    
    // Try to fetch a simple count from each table
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const storeCount = await prisma.store.count();
    
    // Check if we can find any user
    const anyUser = await prisma.user.findFirst();
    const userId = anyUser?.id;
    
    // Try to directly access the database connection
    const databaseUrl = process.env.DATABASE_URL || 'Not configured';
    const isDatabaseUrlSet = !!process.env.DATABASE_URL;
    
    console.log('Database tests completed successfully');
    
    return NextResponse.json({
      success: true,
      counts: {
        users: userCount,
        products: productCount,
        stores: storeCount
      },
      foundUser: userId ? true : false,
      databaseInfo: {
        isDatabaseUrlSet,
        databaseUrl: databaseUrl.substring(0, 15) + '...' // Just show beginning for security
      }
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 