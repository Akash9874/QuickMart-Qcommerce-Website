import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';

// Add OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('Profile API - Request received at:', new Date().toISOString());
    console.log('Profile API - Request URL:', request.url);
    
    // Fix for the headers iteration
    const headersList: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersList[key] = value;
    });
    console.log('Profile API - Request headers:', JSON.stringify(headersList));
    
    const session = await getServerSession(authOptions);
    console.log('Profile API - Session found:', !!session);
    
    if (!session || !session.user) {
      console.log('Profile API - Authentication required');
      return NextResponse.json(
        { error: 'Authentication required' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    console.log('Profile API - Session found for user:', session.user.email);

    // Try-catch specifically for the database query
    try {
      // Get user by email
      const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          orders: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
              items: {
                select: {
                  id: true,
                  productId: true,
                  storeId: true,
                  quantity: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        console.log('Profile API - User not found in database');
        return NextResponse.json(
          { error: 'User not found' },
          { 
            status: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }

      console.log('Profile API - User data retrieved successfully');
      return NextResponse.json(
        { profile: user },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    } catch (dbError) {
      console.error('Profile API - Database error:', dbError);
      
      // Return mock data if database is unreachable
      console.log('Profile API - Returning mock data as fallback');
      const mockUser = {
        id: 1,
        name: session.user.name || 'User',
        email: session.user.email,
        address: null,
        orders: []
      };
      
      return NextResponse.json(
        { profile: mockUser },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
} 