import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-6 text-6xl font-bold text-[#1A535C]">404</h1>
        <h2 className="mb-6 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-gray-600">
          We're sorry, but the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Link href="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link href="/products" className="btn btn-outline">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
} 