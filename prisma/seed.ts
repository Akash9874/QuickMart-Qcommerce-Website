const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clean the database first (optional)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.price.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Fruits & Vegetables' },
    }),
    prisma.category.create({
      data: { name: 'Dairy & Eggs' },
    }),
    prisma.category.create({
      data: { name: 'Bread & Bakery' },
    }),
    prisma.category.create({
      data: { name: 'Meat & Seafood' },
    }),
    prisma.category.create({
      data: { name: 'Pantry Staples' },
    }),
  ]);

  console.log('Categories created:', categories.length);

  // Create stores
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: 'FreshMart',
        address: '123 Main Street, City',
        logo: '/stores/freshmart.png',
      },
    }),
    prisma.store.create({
      data: {
        name: 'QuickStop',
        address: '456 Oak Avenue, City',
        logo: '/stores/quickstop.png',
      },
    }),
    prisma.store.create({
      data: {
        name: 'ValuGrocer',
        address: '789 Pine Road, City',
        logo: '/stores/valugrocer.png',
      },
    }),
  ]);

  console.log('Stores created:', stores.length);

  // Create products with prices
  const productsData = [
    {
      name: 'Organic Bananas',
      description: 'Fresh organic bananas, perfect for smoothies',
      image: '/products/bananas.jpg',
      categoryId: categories[0].id, // Fruits & Vegetables
      prices: [
        { storeId: stores[0].id, amount: 1.99 }, // FreshMart
        { storeId: stores[1].id, amount: 2.49 }, // QuickStop
        { storeId: stores[2].id, amount: 1.89 }, // ValuGrocer
      ],
    },
    {
      name: 'Apples',
      description: 'Fresh red apples, 3 lb bag',
      image: '/products/apples.jpg',
      categoryId: categories[0].id, // Fruits & Vegetables
      prices: [
        { storeId: stores[0].id, amount: 4.99 },
        { storeId: stores[1].id, amount: 5.29 },
        { storeId: stores[2].id, amount: 4.79 },
      ],
    },
    {
      name: 'Whole Milk',
      description: 'Farm fresh whole milk, 1 gallon',
      image: '/products/milk.jpg',
      categoryId: categories[1].id, // Dairy & Eggs
      prices: [
        { storeId: stores[0].id, amount: 3.49 },
        { storeId: stores[1].id, amount: 3.29 },
        { storeId: stores[2].id, amount: 3.59 },
      ],
    },
    {
      name: 'Eggs',
      description: 'Farm fresh large eggs, dozen',
      image: '/products/eggs.jpg',
      categoryId: categories[1].id, // Dairy & Eggs
      prices: [
        { storeId: stores[0].id, amount: 3.99 },
        { storeId: stores[1].id, amount: 3.49 },
        { storeId: stores[2].id, amount: 3.79 },
      ],
    },
    {
      name: 'Bread',
      description: 'Freshly baked whole wheat bread',
      image: '/products/bread.jpg',
      categoryId: categories[2].id, // Bread & Bakery
      prices: [
        { storeId: stores[0].id, amount: 2.99 },
        { storeId: stores[1].id, amount: 3.19 },
        { storeId: stores[2].id, amount: 2.79 },
      ],
    },
    {
      name: 'Chicken Breast',
      description: 'Boneless, skinless chicken breast, 1 lb',
      image: '/products/chicken.jpg',
      categoryId: categories[3].id, // Meat & Seafood
      prices: [
        { storeId: stores[0].id, amount: 5.99 },
        { storeId: stores[1].id, amount: 6.29 },
        { storeId: stores[2].id, amount: 5.79 },
      ],
    },
    {
      name: 'Rice',
      description: 'Long grain white rice, 5 lb bag',
      image: '/products/rice.jpg',
      categoryId: categories[4].id, // Pantry Staples
      prices: [
        { storeId: stores[0].id, amount: 4.49 },
        { storeId: stores[1].id, amount: 4.99 },
        { storeId: stores[2].id, amount: 4.29 },
      ],
    },
    {
      name: 'Pasta',
      description: 'Spaghetti pasta, 16 oz',
      image: '/products/pasta.jpg',
      categoryId: categories[4].id, // Pantry Staples
      prices: [
        { storeId: stores[0].id, amount: 1.79 },
        { storeId: stores[1].id, amount: 1.99 },
        { storeId: stores[2].id, amount: 1.59 },
      ],
    },
  ];

  // Create each product with its prices
  for (const data of productsData) {
    const { prices, ...productData } = data;

    const product = await prisma.product.create({
      data: productData,
    });

    for (const price of prices) {
      await prisma.price.create({
        data: {
          productId: product.id,
          ...price,
        },
      });
    }
  }

  console.log('Products and prices created:', productsData.length);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123', // In a real app, this would be hashed
      address: '123 Test Street, Testville',
    },
  });

  console.log('Test user created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 