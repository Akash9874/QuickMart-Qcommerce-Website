import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      message: 'Test API endpoint is working',
      authenticated: !!session,
      user: session?.user?.email || 'Not authenticated',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: `Test error: ${error.message || 'Unknown error'}`
    }, { status: 500 });
  }
} 