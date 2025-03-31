'use client';

import React from 'react';

interface Store {
  id: number;
  name: string;
}

interface Price {
  store: string | Store;
  amount: number;
  storeId: number;
}

interface Product {
  id: number;
  name: string;
  image: string;
  description: string;
  prices: Price[];
}

interface ComparisonTableProps {
  products: Product[];
  stores: string[];
}

// Helper to get store name from Price object
const getStoreName = (price: Price) => {
  if (typeof price.store === 'string') {
    return price.store;
  }
  return price.store?.name || 'Unknown Store';
};

// Helper to get price for a specific store
const getPriceForStore = (product: Product, storeName: string) => {
  const price = product.prices.find(
    p => typeof p.store === 'string' 
      ? p.store === storeName
      : p.store?.name === storeName
  );
  return price ? price.amount : null;
};

const ComparisonTable: React.FC<ComparisonTableProps> = ({ products, stores }) => {
  // Calculate total prices per store
  const totals = stores.map(store => {
    return products.reduce(
      (sum, product) => {
        const price = getPriceForStore(product, store);
        return price ? sum + price : sum;
      },
      0
    );
  });

  // Find the best store (lowest total)
  const bestStoreIndex = totals.indexOf(Math.min(...totals));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3 text-left">Product</th>
            {stores.map((store) => (
              <th 
                key={store} 
                className={`border p-3 text-center ${
                  stores.indexOf(store) === bestStoreIndex ? 'bg-primary/10' : ''
                }`}
              >
                {store}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="border p-3">
                <div className="font-medium">{product.name}</div>
              </td>
              {stores.map((store) => {
                const price = getPriceForStore(product, store);
                const bestPrice = Math.min(
                  ...product.prices
                    .map((p) => p.amount)
                    .filter((p) => p !== null)
                );
                const isBestPrice = price === bestPrice;

                return (
                  <td 
                    key={`${product.id}-${store}`} 
                    className={`border p-3 text-center ${isBestPrice ? 'text-primary font-bold' : ''}`}
                  >
                    {price ? (
                      <>${price.toFixed(2)}</>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Total Row */}
          <tr className="bg-gray-50 font-bold">
            <td className="border p-3">Total</td>
            {totals.map((total, index) => (
              <td 
                key={`total-${index}`} 
                className={`border p-3 text-center ${
                  index === bestStoreIndex ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                ${total.toFixed(2)}
                {index === bestStoreIndex && (
                  <span className="ml-2 text-xs text-primary">Best Deal</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable; 