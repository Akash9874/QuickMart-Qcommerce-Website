import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Auth Test - Checking authentication');
    const session = await getServerSession(authOptions);
    
    // Basic authentication check
    if (!session) {
      console.log('Auth Test - No session found');
      return NextResponse.json({
        authenticated: false,
        message: 'Not authenticated - no session',
        sessionExists: false
      });
    }
    
    if (!session.user?.email) {
      console.log('Auth Test - Session exists but no email');
      return NextResponse.json({
        authenticated: false,
        message: 'Session exists but no email',
        sessionExists: true,
        sessionData: JSON.stringify(session)
      });
    }
    
    // Try to find the user in the database
    console.log(`Auth Test - Looking up user with email: ${session.user.email}`);
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email
        },
        select: {
          id: true,
          email: true,
          name: true,
          cart: {
            select: {
              id: true,
              _count: {
                select: {
                  items: true
                }
              }
            }
          }
        }
      });
      
      if (!user) {
        console.log('Auth Test - User not found in database');
        return NextResponse.json({
          authenticated: true,
          userFound: false,
          message: 'Session valid but user not found in database',
          email: session.user.email
        });
      }
      
      console.log('Auth Test - User found', user);
      return NextResponse.json({
        authenticated: true,
        userFound: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        hasCart: !!user.cart,
        cartId: user.cart?.id,
        cartItemCount: user.cart?._count.items || 0,
        sessionData: {
          expires: session.expires,
          userId: session.user.id
        }
      });
    } catch (dbError: any) {
      console.error('Auth Test - Database error:', dbError);
      return NextResponse.json({
        authenticated: true,
        userFound: false,
        databaseError: true,
        message: `Error looking up user: ${dbError.message}`,
        email: session.user.email
      });
    }
  } catch (error: any) {
    console.error('Auth Test - Error:', error);
    return NextResponse.json({
      error: `Authentication test error: ${error.message || 'Unknown error'}`
    }, { status: 500 });
  }
} 