'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

const ProductImage = ({
  src,
  alt,
  priority = false,
  className = '',
  width = 300,
  height = 300,
  fill = false,
}: ProductImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('/placeholder.svg');

  useEffect(() => {
    // Reset states when src changes
    setLoading(true);
    setError(false);
    
    // Ensure we never set an empty src
    if (!src || src === '') {
      setError(true);
      return;
    }
    
    // Prepare image source
    if (src.startsWith('http')) {
      setImageSrc(src);
    } else if (src.startsWith('/')) {
      setImageSrc(src);
    } else {
      // Handle relative paths - assume they're in public/products
      setImageSrc(`/products/${src}`);
    }
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    setImageSrc('/placeholder.svg');
  };

  return (
    <div className={`relative overflow-hidden rounded-t-xl ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: loading ? 0 : 1 
        }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={imageSrc}
          alt={alt || "Product image"}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={`object-cover ${error ? 'bg-gray-100' : ''}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </motion.div>
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-90 p-4 text-center">
          <span className="mb-2 text-sm font-medium text-gray-600">
            {alt || 'Product image'}
          </span>
          <span className="text-xs text-gray-500">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ProductImage; 