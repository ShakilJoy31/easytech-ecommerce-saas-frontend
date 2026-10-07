"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  if (!mounted) {
    return (
      <button className="p-1.5 rounded-md opacity-0">
        <Sun size={18} />
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Icon-only Trigger Button */}
      <button
        onClick={toggleOpen}
        className="p-1.5 rounded-md hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 relative"
        aria-label="Toggle theme"
      >
        <Sun className="rotate-0 size-[18px] scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-600 dark:text-gray-400" />
        <Moon className="absolute size-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-600 dark:text-gray-400 top-1.5 left-1.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="absolute bottom-full right-0 mb-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer ${
                  theme === "light" ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
                }`}
                onClick={() => {
                  setTheme("light");
                  setIsOpen(false);
                }}
              >
               Light
              </button>

              <button
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer ${
                  theme === "dark" ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
                }`}
                onClick={() => {
                  setTheme("dark");
                  setIsOpen(false);
                }}
              >
               Dark
              </button>

              <button
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer ${
                  theme === "system" ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
                }`}
                onClick={() => {
                  setTheme("system");
                  setIsOpen(false);
                }}
              >
                System
              </button>
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;