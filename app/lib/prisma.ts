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

// Add a mock client with basic functionality
const mockClient = {
  user: {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve({ id: 1, email: 'test@example.com', name: 'Test User' }),
    create: (data: { data: any }) => Promise.resolve({ id: 1, ...data.data })
  },
  cart: {
    findUnique: () => Promise.resolve(null),
    create: (data: { data: any }) => Promise.resolve({ id: 1, ...data.data }),
    delete: () => Promise.resolve({ id: 1 })
  },
  cartItem: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: (data: { data: any }) => Promise.resolve({ id: Math.floor(Math.random() * 1000), ...data.data }),
    update: (data: { data: any }) => Promise.resolve({ id: 1, ...data.data }),
    deleteMany: () => Promise.resolve({ count: 0 })
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
        const model = params.model as keyof typeof mockClient;
        if (model && mockClient[model]) {
          const action = params.action as string;
          if (typeof (mockClient[model] as any)[action] === 'function') {
            return (mockClient[model] as any)[action](params.args);
          }
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