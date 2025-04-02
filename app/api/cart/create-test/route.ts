import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete existing cart if it exists
    if (user.cart) {
      await prisma.cart.delete({
        where: { id: user.cart.id },
      });
    }

    // Create new cart
    const cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Get a sample product with store information
    const product = await prisma.product.findFirst({
      include: {
        store: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'No products available' },
        { status: 404 }
      );
    }

    // Add sample item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: 2,
        storeId: product.storeId,
      },
    });

    return NextResponse.json({
      success: true,
      cartId: cart.id,
      itemId: cartItem.id,
    });
  } catch (error) {
    console.error('Error creating test cart:', error);
    return NextResponse.json(
      { error: 'Failed to create test cart' },
      { status: 500 }
    );
  }
} 