export const mockProducts = [
  {
    id: 1,
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, perfect for smoothies or a quick snack.',
    image: '/products/bananas.jpg',
    categoryId: 1
  },
  {
    id: 2,
    name: 'Whole Milk',
    description: 'Farm fresh whole milk, 1 gallon. Pasteurized for safety.',
    image: '/products/milk.jpg',
    categoryId: 1
  },
  {
    id: 3,
    name: 'Bread',
    description: 'Freshly baked whole wheat bread. Made with 100% whole wheat flour.',
    image: '/products/bread.jpg',
    categoryId: 1
  },
  {
    id: 4,
    name: 'Eggs',
    description: 'Farm fresh organic eggs from free-range chickens. Dozen.',
    image: '/products/eggs.jpg',
    categoryId: 1
  },
  {
    id: 5,
    name: 'Organic Chicken',
    description: 'Free-range organic chicken breast, 1 pound. No antibiotics or hormones.',
    image: '/products/chicken.jpg',
    categoryId: 2
  }
];

export const mockPrices = [
  // Store 1 prices
  { productId: 1, storeId: 1, amount: 1.99 },
  { productId: 2, storeId: 1, amount: 3.49 },
  { productId: 3, storeId: 1, amount: 2.99 },
  { productId: 4, storeId: 1, amount: 3.99 },
  { productId: 5, storeId: 1, amount: 6.99 },
  
  // Store 2 prices
  { productId: 1, storeId: 2, amount: 2.49 },
  { productId: 2, storeId: 2, amount: 3.29 },
  { productId: 3, storeId: 2, amount: 3.19 },
  { productId: 4, storeId: 2, amount: 3.49 },
  { productId: 5, storeId: 2, amount: 6.49 },
  
  // Store 3 prices
  { productId: 1, storeId: 3, amount: 1.89 },
  { productId: 2, storeId: 3, amount: 3.59 },
  { productId: 3, storeId: 3, amount: 2.79 },
  { productId: 4, storeId: 3, amount: 3.79 },
  { productId: 5, storeId: 3, amount: 5.99 }
];

export const mockStores = [
  { id: 1, name: 'FreshMart', address: '123 Main St, Anytown, USA', logo: 'freshmart-logo.png' },
  { id: 2, name: 'QuickStop', address: '456 Oak Ave, Anytown, USA', logo: 'quickstop-logo.png' },
  { id: 3, name: 'ValuGrocer', address: '789 Pine Rd, Anytown, USA', logo: 'valugrocer-logo.png' }
]; 