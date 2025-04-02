import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required to access orders' },
        { status: 401 }
      );
    }
    
    const userEmail = session.user.email;
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail as string },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // Get all orders for the user with count of items
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Transform the orders to include itemCount
    const transformedOrders = orders.map(order => ({
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      userId: order.userId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      itemCount: order._count.items,
    }));
    
    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 