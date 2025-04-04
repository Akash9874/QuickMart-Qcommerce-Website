import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// Workaround for Next.js 15 type issue with route parameters
export async function GET(request: NextRequest) {
  try {
    // Extract orderId from URL path manually
    const url = request.url;
    const segments = url.split('/');
    const idSegment = segments[segments.length - 1]; // Get the last segment
    const orderId = parseInt(idSegment);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required to access order details' },
        { status: 401 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get the order including items, making sure it belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      // Check if the order exists but belongs to someone else
      const anyOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (anyOrder) {
        return NextResponse.json(
          { error: 'You do not have permission to view this order' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch additional details for each order item
    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        // Get product details
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, image: true },
        });

        // Get store details
        const store = await prisma.store.findUnique({
          where: { id: item.storeId },
          select: { id: true, name: true },
        });

        return {
          ...item,
          product,
          store,
        };
      })
    );

    // Return the order with enriched items
    return NextResponse.json({
      order: {
        ...order,
        items: enrichedItems,
      }
    });
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
} 