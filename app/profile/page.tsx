'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

interface OrderItem {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  address: string | null;
  orders: Order[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.profile);
      setFormData({
        name: data.profile.name || '',
        address: data.profile.address || '',
      });
    } catch (err) {
      setError('Error loading profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      setProfile(prev => ({
        ...(prev as UserProfile),
        name: formData.name,
        address: formData.address,
      }));
      
      setEditMode(false);
    } catch (err) {
      setError('Error updating profile');
      console.error(err);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
        <div className="flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
        <div className="rounded bg-red-100 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {!editMode ? (
            <div className="rounded-lg border bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Personal Information</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{profile?.name}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {profile?.address || 'No address provided'}
                </p>
              </div>
              
              <button
                onClick={() => setEditMode(true)}
                className="w-full rounded bg-[#1A535C] py-2 text-white hover:bg-opacity-90"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Edit Profile</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="w-full rounded border border-gray-200 bg-gray-50 p-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div className="mb-6">
                  <label className="mb-1 block text-sm font-medium">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded border border-gray-300 p-2"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 rounded bg-[#1A535C] py-2 text-white hover:bg-opacity-90"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 rounded border border-gray-300 py-2 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 rounded-lg border bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/orders" className="text-[#1A535C] hover:underline">
                  View All Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-[#1A535C] hover:underline">
                  My Cart
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[#1A535C] hover:underline">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-[#1A535C] hover:underline">
                  Compare Prices
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    // Sign out functionality will be handled by the header
                    router.push('/');
                  }}
                  className="text-red-500 hover:underline"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Order History</h2>
            
            {profile?.orders && profile.orders.length > 0 ? (
              <div className="space-y-4">
                {profile.orders.map(order => (
                  <div key={order.id} className="rounded border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-500">Order #</span>
                        <span className="ml-2 font-medium">{order.id}</span>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                    
                    <div className="mb-3 flex justify-between border-b pb-3">
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p>{order.items.length} item(s)</p>
                    </div>
                    
                    <div className="mt-3">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="text-sm text-[#1A535C] hover:underline"
                      >
                        View Order Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded bg-gray-50 py-8 text-center">
                <p className="mb-4 text-gray-500">You haven't placed any orders yet.</p>
                <Link href="/products" className="text-[#1A535C] hover:underline">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 