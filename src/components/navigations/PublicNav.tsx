'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import navbarLogo from '../../../public/The_Logo/alec_logo.png';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Store as StoreIcon, Menu, X } from 'lucide-react';
import { useCartStore } from '@/utils/helper/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = useCartStore((s) => s.getTotalItems());

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

  // Avoid hydration mismatch for the cart badge count
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Active route detection (also matches nested paths, e.g. /login/anything)
  const isActive = (href: string) =>
    pathname === href || !!pathname?.startsWith(`${href}/`);

  const isLoginActive = isActive('/login');
  const isRegisterActive = isActive('/register');
  const isTermsActive = isActive('/terms-and-condition');
  const isCartActive = isActive('/cart');
  const isStoreActive = isActive('/store');

  const handleMobileNavigate = (href: string) => {
    setIsMobileMenuOpen(false);
    // Small delay to let the animation start before navigation
    setTimeout(() => router.push(href), 150);
  };

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
              priority
            />
          </div>

          {/* Center: Store + Terms + Cart (Desktop only) */}
          <div className='hidden md:flex items-center justify-center gap-2 flex-1'>
            <Link
              href='/store'
              className={`relative inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${
                isStoreActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <StoreIcon className='h-4 w-4' />
              Store
            </Link>

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

            <Link
              href='/cart'
              className={`relative inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${
                isCartActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className='h-4 w-4' />
              Cart
              {mounted && totalItems > 0 && (
                <span
                  className={`ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isCartActive
                      ? 'bg-white text-emerald-700'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Right: Login + Register (Desktop) OR Hamburger (Mobile) */}
          <div className='flex items-center gap-2 md:gap-3'>
            {/* Desktop buttons */}
            <div className='hidden md:flex items-center gap-2 md:gap-3'>
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

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              className='md:hidden relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300'
            >
              <AnimatePresence mode='wait' initial={false}>
                {isMobileMenuOpen ? (
                  <motion.span
                    key='close'
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='absolute'
                  >
                    <X className='h-6 w-6' />
                  </motion.span>
                ) : (
                  <motion.span
                    key='menu'
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='absolute'
                  >
                    <Menu className='h-6 w-6' />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* =============================================================
            Mobile Menu — Animated Dropdown
        ============================================================= */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key='mobile-menu'
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className='md:hidden overflow-hidden border-t border-gray-200 bg-gray-100'
            >
              <motion.div
                initial='hidden'
                animate='visible'
                exit='hidden'
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.05,
                    },
                  },
                }}
                className='p-3 flex flex-col space-y-2'
              >
                {/* Store */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href='/store'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`relative inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-center w-full transition-colors ${
                      isStoreActive
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <StoreIcon className='h-4 w-4' />
                    Store
                  </Link>
                </motion.div>

                {/* Terms */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href='/terms-and-condition'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-md text-sm font-medium text-center w-full transition-colors ${
                      isTermsActive
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Terms & Conditions
                  </Link>
                </motion.div>

                {/* Cart */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href='/cart'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`relative inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-center w-full transition-colors ${
                      isCartActive
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className='h-4 w-4' />
                    Cart
                    {mounted && totalItems > 0 && (
                      <span
                        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                          isCartActive
                            ? 'bg-white text-emerald-700'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </Link>
                </motion.div>

                {/* Divider */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scaleX: 0 },
                    visible: { opacity: 1, scaleX: 1 },
                  }}
                  className='my-1 h-px bg-gray-200 origin-left'
                />

                {/* Login */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Button
                    onClick={() => handleMobileNavigate('/login')}
                    variant='outline'
                    className={`px-5 py-2 rounded-full text-sm font-semibold w-full ${
                      isLoginActive
                        ? 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white hover:border-emerald-700'
                        : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Login
                  </Button>
                </motion.div>

                {/* Register */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Button
                    onClick={() => handleMobileNavigate('/register')}
                    className={`px-5 py-2 rounded-full text-sm font-semibold w-full ${
                      isRegisterActive
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Register
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu backdrop (optional — closes on outside click) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className='fixed inset-0 z-40 bg-black/20 md:hidden'
            style={{ top: '64px' }}
          />
        )}
      </AnimatePresence>
    </>
  );
}