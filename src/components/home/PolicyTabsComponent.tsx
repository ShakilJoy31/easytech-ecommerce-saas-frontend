'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../reusable-components/Button';
import { tabs } from '@/utils/constant/policyData';

export default function PolicyTabs() {
  const [active, setActive] = useState<string>(tabs[0].id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <section className='max-w-7xl mx-auto px-6 py-24'>
      <div className='grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start'>
        {/* Mobile tabs */}
        <div className='md:hidden mb-2'>
          <div
            role='tablist'
            aria-label='Policy navigation'
            className='flex overflow-x-auto space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl'
          >
            {tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <Button
                  key={t.id}
                  role='tab'
                  aria-selected={isActive}
                  onClick={() => setActive(t.id)}
                  className={`flex-1 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#0B1F3A] text-white shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t.title}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside
          className='hidden md:block rounded-lg border border-gray-300 dark:border-gray-700 p-4 h-min bg-white dark:bg-gray-900 shadow-sm sticky top-24 self-start'
          aria-label='Policy navigation'
        >
          <ul className='space-y-2'>
            {tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <li key={t.id}>
                  {/* Native <button> via Button already handles Enter/Space, so no custom key handler is needed */}
                  <Button
                    onClick={() => setActive(t.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full cursor-pointer flex items-center gap-3 text-left px-3 py-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A900] ${
                      isActive
                        ? 'bg-[#0B1F3A] text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex-shrink-0 w-2.5 h-2.5 rounded-full transition-colors ${
                        isActive ? 'bg-[#F2A900]' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                    <span className='text-sm font-medium'>{t.title}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Content (a div, not <main>, so it does not nest inside the page's own <main>) */}
        <div className='prose prose-sm md:prose md:prose-lg max-w-none text-gray-800 dark:text-gray-200'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.28 }}
            >
              <div className='mb-4'>{current.content}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}