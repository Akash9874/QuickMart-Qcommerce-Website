import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters - comma separated product IDs
    const searchParams = request.nextUrl.searchParams;
    const productIdsParam = searchParams.get('productIds');
    
    if (!productIdsParam) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    // Parse product IDs
    const productIds = productIdsParam.split(',').map(id => parseInt(id));

    // Get products with their prices across all stores
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        prices: {
          include: {
            store: true,
          },
        },
      },
    });

    // Get all stores for comparison
    const stores = await prisma.store.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Format comparison data
    const comparisonData = {
      products,
      stores,
      // Calculate total prices by store
      storeTotals: stores.map(store => {
        let total = 0;
        let availableProducts = 0;

        products.forEach(product => {
          const priceForStore = product.prices.find(p => p.storeId === store.id);
          if (priceForStore && priceForStore.inStock) {
            total += priceForStore.amount;
            availableProducts++;
          }
        });

        return {
          storeId: store.id,
          storeName: store.name,
          total,
          availableProducts,
          hasAllProducts: availableProducts === products.length,
        };
      }),
    };

    return NextResponse.json(comparisonData);
  } catch (error: any) {
    console.error('Error comparing prices:', error);
    return NextResponse.json(
      { error: 'Failed to compare prices' },
      { status: 500 }
    );
  }
} 