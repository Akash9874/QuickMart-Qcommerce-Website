'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  const imageSrc = error ? '/placeholder.svg' : src.startsWith('/') ? src : `/products/${src}`;

  return (
    <div className={`relative aspect-square ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="rounded-lg object-cover"
        priority={priority}
        onError={() => setError(true)}
      />
    </div>
  );
} 