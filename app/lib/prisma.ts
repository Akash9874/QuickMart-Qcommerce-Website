import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Define types for our mock client
type MockData = {
  id: number;
  [key: string]: any;
};

// Store mock users in memory for development/testing
const mockUsers = [
  { 
    id: 1, 
    email: 'test@example.com', 
    name: 'Test User', 
    password: '$2b$10$ItlXXslX1tWwrb0pFYDHmuQBJBEPZZfBqAi/0jy3W8h7OVVUe9UF.', // hashed 'password123'
    address: '123 Test St',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock orders for development
const mockOrders = [
  {
    id: 1, 
    userId: 1, 
    totalAmount: 59.97, 
    status: 'DELIVERED',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15'),
    items: [
      { id: 101, orderId: 1, productId: 2, storeId: 1, quantity: 3, price: 19.99 }
    ]
  }
];

// Add a mock client with better functionality
const mockClient = {
  user: {
    findUnique: ({ where }: { where: { email?: string, id?: number } }) => {
      if (where.email) {
        console.log('Mock DB - Finding user by email:', where.email);
        const user = mockUsers.find(u => u.email === where.email);
        return Promise.resolve(user || null);
      }
      if (where.id) {
        console.log('Mock DB - Finding user by id:', where.id);
        const user = mockUsers.find(u => u.id === where.id);
        return Promise.resolve(user || null);
      }
      console.log('Mock DB - No valid query parameters for findUnique');
      return Promise.resolve(null);
    },
    findFirst: () => Promise.resolve(mockUsers[0] || null),
    create: ({ data }: { data: any }) => {
      console.log('Mock DB - Creating user:', data?.email || 'unknown');
      if (!data || !data.email) {
        console.error('Mock DB - Cannot create user: missing required data');
        return Promise.resolve(null);
      }
      const newId = mockUsers.length > 0 ? Math.max(...mockUsers.map(u => u.id)) + 1 : 1;
      const newUser = { 
        id: newId, 
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockUsers.push(newUser);
      console.log('Mock DB - User created:', newUser);
      return Promise.resolve(newUser);
    },
    update: ({ where, data }: { where: { id: number }, data: any }) => {
      console.log('Mock DB - Updating user:', where.id);
      const userIndex = mockUsers.findIndex(u => u.id === where.id);
      if (userIndex >= 0) {
        mockUsers[userIndex] = { 
          ...mockUsers[userIndex], 
          ...data, 
          updatedAt: new Date() 
        };
        return Promise.resolve(mockUsers[userIndex]);
      }
      return Promise.resolve(null);
    }
  },
  cart: {
    findUnique: ({ where }: { where: { userId: number } }) => {
      console.log('Mock DB - Finding cart for user:', where.userId);
      return Promise.resolve(where.userId === 1 ? { id: 1, userId: 1 } : null);
    },
    create: ({ data }: { data: any }) => Promise.resolve({ id: 1, ...data }),
    delete: () => Promise.resolve({ id: 1 })
  },
  cartItem: {
    findMany: ({ where }: { where: { cartId: number } }) => {
      console.log('Mock DB - Finding cart items for cart:', where.cartId);
      return Promise.resolve([
        { id: 101, cartId: 1, productId: 1, storeId: 3, quantity: 2 },
        { id: 102, cartId: 1, productId: 2, storeId: 1, quantity: 1 }
      ]);
    },
    findFirst: () => Promise.resolve(null),
    create: ({ data }: { data: any }) => Promise.resolve({ id: Math.floor(Math.random() * 1000), ...data }),
    update: ({ data }: { data: any }) => Promise.resolve({ id: 1, ...data }),
    deleteMany: () => Promise.resolve({ count: 0 })
  },
  order: {
    findMany: ({ where }: { where: { userId: number } }) => {
      console.log('Mock DB - Finding orders for user:', where.userId);
      return Promise.resolve(mockOrders.filter(o => o.userId === where.userId));
    },
    findFirst: ({ where }: { where: { id: number, userId: number } }) => {
      console.log('Mock DB - Finding order:', where.id);
      return Promise.resolve(mockOrders.find(o => o.id === where.id && o.userId === where.userId) || null);
    },
    create: ({ data }: { data: any }) => {
      console.log('Mock DB - Creating order:', data);
      const newId = mockOrders.length > 0 ? Math.max(...mockOrders.map(o => o.id)) + 1 : 1;
      const newOrder = {
        id: newId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: []
      };
      mockOrders.push(newOrder);
      return Promise.resolve(newOrder);
    }
  },
  orderItem: {
    createMany: ({ data }: { data: any[] }) => {
      console.log('Mock DB - Creating order items:', data.length);
      return Promise.resolve({ count: data.length });
    },
    findMany: ({ where }: { where: { orderId: number } }) => {
      const orderItems = mockOrders
        .find(o => o.id === where.orderId)?.items || [];
      return Promise.resolve(orderItems);
    }
  },
  product: {
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([])
  },
  price: {
    findMany: () => Promise.resolve([])
  },
  store: {
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([])
  },
  $transaction: async <T>(callback: (prisma: any) => Promise<T>): Promise<T> => {
    return await callback(mockClient);
  }
};

// Create a wrapped client that automatically falls back to mock data
let prismaClient: PrismaClient;

try {
  prismaClient = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  // Add middleware to log query performance
  prismaClient.$use(async (params, next) => {
    try {
      const startTime = Date.now();
      const result = await next(params);
      const endTime = Date.now();
      console.log(`Prisma Query (${params.model}.${params.action}) took ${endTime - startTime}ms`);
      return result;
    } catch (error: any) {
      console.error(`Prisma Error in ${params.model}.${params.action}:`, error);
      
      // Fall back to mock data if database is unreachable
      if (error && typeof error === 'object' && error.message && 
          typeof error.message === 'string' && 
          (error.message.includes("Can't reach database server") || 
           error.message.includes("connect ECONNREFUSED"))) {
        console.log('Database unreachable, using mock data fallback');
        // Check if model and action exist in mock client before calling
        if (params.model) {
          const modelLowerCase = params.model.toLowerCase() as keyof typeof mockClient;
          if (mockClient[modelLowerCase]) {
            const action = params.action as string;
            if (action && typeof (mockClient[modelLowerCase] as any)[action] === 'function') {
              console.log(`Mock DB - Calling ${modelLowerCase}.${action}`);
              return (mockClient[modelLowerCase] as any)[action](params.args);
            }
          }
          console.log(`Mock DB - No handler for ${params.model}.${params.action || 'unknown'}`);
        } else {
          console.log(`Mock DB - No model specified in params`);
        }
        return null;
      }
      throw error;
    }
  });
} catch (error) {
  console.error('Failed to initialize Prisma client, using mock data:', error);
  prismaClient = mockClient as unknown as PrismaClient;
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 