'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import CartIcon from './CartIcon';

export default function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Check if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#1A535C] shadow-md' : 'bg-gradient-to-r from-[#1A535C] to-[#1A535C]/90'} text-white`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-[#4ECDC4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="bg-gradient-to-r from-white to-[#4ECDC4] bg-clip-text text-transparent">QuickMart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link 
                  href="/" 
                  className={`transition duration-300 relative ${isActive('/') ? 'text-[#4ECDC4] font-medium' : 'hover:text-[#4ECDC4]'}`}
                >
                  Home
                  {isActive('/') && <span className="absolute bottom-[-10px] left-0 right-0 h-1 bg-[#4ECDC4] rounded-t-md"></span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/products" 
                  className={`transition duration-300 relative ${isActive('/products') ? 'text-[#4ECDC4] font-medium' : 'hover:text-[#4ECDC4]'}`}
                >
                  Products
                  {isActive('/products') && <span className="absolute bottom-[-10px] left-0 right-0 h-1 bg-[#4ECDC4] rounded-t-md"></span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/stores" 
                  className={`transition duration-300 relative ${isActive('/stores') ? 'text-[#4ECDC4] font-medium' : 'hover:text-[#4ECDC4]'}`}
                >
                  Stores
                  {isActive('/stores') && <span className="absolute bottom-[-10px] left-0 right-0 h-1 bg-[#4ECDC4] rounded-t-md"></span>}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'authenticated' ? (
              <>
                <Link href="/cart" className={`transition duration-300 relative p-2 rounded-full hover:bg-[#4ECDC4]/20 ${isActive('/cart') ? 'text-[#4ECDC4]' : 'hover:text-[#4ECDC4]'}`}>
                  <CartIcon isLink={false} />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-full transition duration-300 hover:bg-[#4ECDC4]/20">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4ECDC4] text-white">
                      {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-medium max-w-[100px] truncate">{session.user?.name?.split(' ')[0]}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-md bg-white py-2 shadow-lg 
                    opacity-0 invisible group-hover:visible group-hover:opacity-100 
                    transition-all duration-300 delay-75
                    transform translate-y-2 group-hover:translate-y-0
                    after:content-[''] after:absolute after:h-8 after:w-full after:top-[-8px] after:left-0 after:bg-transparent">
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#4ECDC4] hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <Link 
                      href="/orders" 
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#4ECDC4] hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Orders
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center w-full px-4 py-2 text-left text-gray-800 hover:bg-[#FF6B6B] hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="transition duration-300 px-4 py-2 rounded-md hover:bg-white/10"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="rounded-md bg-[#4ECDC4] px-4 py-2 text-white transition duration-300 hover:bg-[#4ECDC4]/90 hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center p-2 rounded-full hover:bg-[#4ECDC4]/20" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-[#4ECDC4]/30">
            <ul className="space-y-4 pb-4">
              <li>
                <Link 
                  href="/" 
                  className={`block py-2 transition-colors duration-300 ${isActive('/') ? 'text-[#4ECDC4] font-medium pl-2 border-l-4 border-[#4ECDC4]' : 'pl-3'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/products" 
                  className={`block py-2 transition-colors duration-300 ${isActive('/products') ? 'text-[#4ECDC4] font-medium pl-2 border-l-4 border-[#4ECDC4]' : 'pl-3'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/stores" 
                  className={`block py-2 transition-colors duration-300 ${isActive('/stores') ? 'text-[#4ECDC4] font-medium pl-2 border-l-4 border-[#4ECDC4]' : 'pl-3'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Stores
                </Link>
              </li>
              
              {status === 'authenticated' ? (
                <>
                  <li>
                    <Link 
                      href="/cart" 
                      className={`flex items-center py-2 transition-colors duration-300 ${isActive('/cart') ? 'text-[#4ECDC4] font-medium pl-2 border-l-4 border-[#4ECDC4]' : 'pl-3'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="relative mr-2">
                        <CartIcon isLink={false} />
                      </div>
                      Cart
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/profile" 
                      className={`flex items-center py-2 transition-colors duration-300 ${isActive('/profile') ? 'text-[#4ECDC4] font-medium pl-2 border-l-4 border-[#4ECDC4]' : 'pl-3'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/orders" 
                      className={`flex items-center py-2 transition-colors duration-300 ${isActive('/orders') ? 'text-[#4ECDC4] font-medium pl-2 border-l-4 border-[#4ECDC4]' : 'pl-3'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Orders
                    </Link>
                  </li>
                  <li className="pt-2 border-t border-[#4ECDC4]/20">
                    <button 
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center py-2 pl-3 text-[#FF6B6B] transition-colors duration-300 hover:bg-[#FF6B6B]/10 w-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="pt-2 border-t border-[#4ECDC4]/20">
                    <Link 
                      href="/login" 
                      className="block py-2 pl-3 transition-colors duration-300 hover:text-[#4ECDC4]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/register" 
                      className="block mx-3 mt-2 rounded-md bg-[#4ECDC4] px-4 py-2 text-center text-white transition-colors duration-300 hover:bg-[#4ECDC4]/90"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}