const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * This is a migration script to fix product IDs in the database,
 * ensuring they match the expected values in the application.
 */

async function fixProductIds() {
  console.log('Starting product ID migration...');

  try {
    // 1. First, let's ensure we have the current state of products
    const products = await prisma.product.findMany();
    console.log('Current products:', products.map(p => `${p.id}: ${p.name}`));

    // 2. First, let's delete all cart items to avoid foreign key issues
    console.log('Clearing cart items...');
    await prisma.cartItem.deleteMany({});

    // 3. Delete all prices
    console.log('Clearing prices...');
    await prisma.price.deleteMany({});

    // 4. Delete all products (since we'll recreate them with correct IDs)
    console.log('Clearing products...');
    await prisma.product.deleteMany({});

    // 5. Create products with correct IDs
    console.log('Creating products with correct IDs...');
    const productData = [
      {
        id: 1,
        name: 'Organic Bananas',
        description: 'Fresh organic bananas, perfect for smoothies',
        image: '/products/bananas.jpg',
        categoryId: 1
      },
      {
        id: 2,
        name: 'Whole Milk',
        description: 'Farm fresh whole milk, 1 gallon',
        image: '/products/milk.jpg',
        categoryId: 2
      },
      {
        id: 3,
        name: 'Bread',
        description: 'Freshly baked whole wheat bread',
        image: '/products/bread.jpg',
        categoryId: 3
      },
      {
        id: 4,
        name: 'Eggs',
        description: 'Farm fresh large eggs, dozen',
        image: '/products/eggs.jpg',
        categoryId: 2
      },
      {
        id: 5,
        name: 'Chicken Breast',
        description: 'Boneless, skinless chicken breast, 1 lb',
        image: '/products/chicken.jpg',
        categoryId: 4
      },
      {
        id: 6,
        name: 'Rice',
        description: 'Long grain white rice, 5 lb bag',
        image: '/products/rice.jpg',
        categoryId: 5
      },
      {
        id: 7,
        name: 'Pasta',
        description: 'Spaghetti pasta, 16 oz',
        image: '/products/pasta.jpg',
        categoryId: 5
      },
      {
        id: 8,
        name: 'Apples',
        description: 'Fresh red apples, 3 lb bag',
        image: '/products/apples.jpg',
        categoryId: 1
      }
    ];

    for (const product of productData) {
      await prisma.product.create({
        data: product
      });
    }

    // 6. Re-create the prices
    console.log('Re-creating prices...');
    const priceData = [
      { productId: 1, storeId: 1, amount: 1.99 }, // Bananas at FreshMart
      { productId: 1, storeId: 2, amount: 2.49 }, // Bananas at QuickStop
      { productId: 1, storeId: 3, amount: 1.89 }, // Bananas at ValuGrocer
      
      { productId: 2, storeId: 1, amount: 3.49 }, // Milk at FreshMart
      { productId: 2, storeId: 2, amount: 3.29 }, // Milk at QuickStop
      { productId: 2, storeId: 3, amount: 3.59 }, // Milk at ValuGrocer
      
      { productId: 3, storeId: 1, amount: 2.99 }, // Bread at FreshMart
      { productId: 3, storeId: 2, amount: 3.19 }, // Bread at QuickStop
      { productId: 3, storeId: 3, amount: 2.79 }, // Bread at ValuGrocer
      
      { productId: 4, storeId: 1, amount: 3.99 }, // Eggs at FreshMart
      { productId: 4, storeId: 2, amount: 3.49 }, // Eggs at QuickStop
      { productId: 4, storeId: 3, amount: 3.79 }, // Eggs at ValuGrocer
      
      { productId: 5, storeId: 1, amount: 5.99 }, // Chicken at FreshMart
      { productId: 5, storeId: 2, amount: 6.29 }, // Chicken at QuickStop
      { productId: 5, storeId: 3, amount: 5.79 }, // Chicken at ValuGrocer
      
      { productId: 6, storeId: 1, amount: 4.49 }, // Rice at FreshMart
      { productId: 6, storeId: 2, amount: 4.99 }, // Rice at QuickStop
      { productId: 6, storeId: 3, amount: 4.29 }, // Rice at ValuGrocer
      
      { productId: 7, storeId: 1, amount: 1.79 }, // Pasta at FreshMart
      { productId: 7, storeId: 2, amount: 1.99 }, // Pasta at QuickStop
      { productId: 7, storeId: 3, amount: 1.59 }, // Pasta at ValuGrocer
      
      { productId: 8, storeId: 1, amount: 4.99 }, // Apples at FreshMart
      { productId: 8, storeId: 2, amount: 5.29 }, // Apples at QuickStop
      { productId: 8, storeId: 3, amount: 4.79 }, // Apples at ValuGrocer
    ];

    for (const price of priceData) {
      await prisma.price.create({
        data: price
      });
    }

    // 7. Verify the migration
    const updatedProducts = await prisma.product.findMany();
    console.log('Updated products:', updatedProducts.map(p => `${p.id}: ${p.name}`));
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// For direct execution via Node.js
if (require.main === module) {
  fixProductIds()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { fixProductIds }; 