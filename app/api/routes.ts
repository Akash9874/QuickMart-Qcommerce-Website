import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { fixProductIds } from './migrations/fix-product-ids';

// This route will only be accessible by authorized admin users
// and will run the fix-product-ids migration
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow authenticated users (in a real app, you'd check for admin role)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Run the migration
    await fixProductIds();
    
    return NextResponse.json({
      success: true,
      message: 'Product IDs migration completed successfully'
    });
  } catch (error) {
    console.error('Error running migration:', error);
    return NextResponse.json(
      { error: 'Failed to run migration' },
      { status: 500 }
    );
  }
} 