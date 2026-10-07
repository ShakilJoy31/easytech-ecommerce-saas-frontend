'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import navbarLogo from '../../../public/The_Logo/alec_logo.png';
import { Button } from '@/components/ui/button';

export default function PublicNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll effect
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

  // Active route detection (also matches nested paths, e.g. /login/anything)
  const isActive = (href: string) =>
    pathname === href || !!pathname?.startsWith(`${href}/`);

  const isLoginActive = isActive('/login');
  const isRegisterActive = isActive('/register');
  const isTermsActive = isActive('/terms-and-condition');

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gray-100 text-gray-800 ${
          isScrolled
            ? 'border-b border-gray-200 backdrop-blur-sm shadow-sm'
            : 'border-b border-gray-200'
        }`}
      >
        <div className='max-w-[1280px] mx-auto w-full flex items-center justify-between h-16 px-4'>
          {/* Logo - Left */}
          <div
            onClick={() => router.push('/')}
            className='cursor-pointer flex-shrink-0 w-[120px] md:w-[150px] lg:w-[180px]'
          >
            <Image
              src={navbarLogo}
              alt='Logo'
              width={180}
              height={70}
              className='w-36 h-auto'
            />
          </div>

          {/* Terms & Conditions - Center */}
          <div className='hidden md:flex items-center justify-center flex-1'>
            <Link
              href='/terms-and-condition'
              className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${
                isTermsActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Terms & Conditions
            </Link>
          </div>

          {/* Login + Register - Right */}
          <div className='flex items-center gap-2 md:gap-3'>
            {/* Login — outlined, green when on /login */}
            <Button
              onClick={() => router.push('/login')}
              variant='outline'
              className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                isLoginActive
                  ? 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white hover:border-emerald-700'
                  : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              Login
            </Button>

            {/* Register — gradient, green when on /register */}
            <Button
              onClick={() => router.push('/register')}
              className={`px-5 py-2 lg:px-7 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 text-white ${
                isRegisterActive
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              Register
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Simple version */}
        <div className='md:hidden border-t border-gray-200 bg-gray-100'>
          <div className='p-3 flex flex-col space-y-2'>
            <Link
              href='/terms-and-condition'
              className={`px-4 py-3 rounded-md text-sm font-medium text-center ${
                isTermsActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Terms & Conditions
            </Link>

            {/* Login — outlined full-width, green when on /login */}
            <Button
              onClick={() => router.push('/login')}
              variant='outline'
              className={`px-5 py-2 rounded-full text-sm font-semibold w-full ${
                isLoginActive
                  ? 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white hover:border-emerald-700'
                  : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              Login
            </Button>

            {/* Register — full-width, green when on /register */}
            <Button
              onClick={() => router.push('/register')}
              className={`px-5 py-2 rounded-full text-sm font-semibold w-full text-white ${
                isRegisterActive
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              Register
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}