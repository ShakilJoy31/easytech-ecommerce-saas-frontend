'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import Chatbot from './Chatbot';
import { FaWhatsapp } from 'react-icons/fa';
import { useGetActiveWhatsAppNumberForFrontendQuery } from '@/redux/api/communication/whatsappApi';

export default function FloatingButtons() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isHoveredWhatsApp, setIsHoveredWhatsApp] = useState(false);
  const [isHoveredChatbot, setIsHoveredChatbot] = useState(false);
  const [whatsappData, setWhatsappData] = useState<{ number: string; message: string } | null>(null);

  // Fetch active WhatsApp number and message from backend
  const { data: activeWhatsAppData, isLoading: isLoadingWhatsApp } = useGetActiveWhatsAppNumberForFrontendQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (activeWhatsAppData?.success && activeWhatsAppData?.data) {
      setWhatsappData({
        number: activeWhatsAppData.data.whatsappNumber,
        message: activeWhatsAppData.data.message || 'Hello! I would like to get more information about ISAB accreditation services.'
      });
    }
  }, [activeWhatsAppData]);

  const handleWhatsAppClick = () => {
    let number = '';
    let message = '';

    if (whatsappData) {
      number = whatsappData.number;
      message = whatsappData.message;
    } else {
      // Fallback if data is not loaded yet
      number = '+8801813944982';
      message = 'Hello! I would like to get more information about ISAB accreditation services.';
    }

    // Remove any non-numeric characters from the number (keep only digits)
    // Also remove the '+' sign if present for the URL
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if number has country code (starts with 88 for Bangladesh)
    // If not, add the default country code
    let formattedNumber = cleanNumber;
    if (!cleanNumber.startsWith('88') && cleanNumber.length === 11) {
      // If it's a local number without country code (e.g., 01704020675)
      formattedNumber = '88' + cleanNumber;
    }
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL with the formatted number and message
    const url = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(url, '_blank');
  };

  // If still loading, show loading state
  if (isLoadingWhatsApp) {
    return (
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      {/* Floating Buttons Container */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        {/* WhatsApp Button */}
        <motion.button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setIsHoveredWhatsApp(true)}
          onMouseLeave={() => setIsHoveredWhatsApp(false)}
          className="relative cursor-pointer group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaWhatsapp className="w-7 h-7" />
          
          {/* Tooltip */}
          <AnimatePresence>
            {isHoveredWhatsApp && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                className="absolute right-full mr-4 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 whitespace-nowrap"
              >
                <span className="text-sm font-medium">Chat on WhatsApp</span>
                <div className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-t border-gray-100" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-green-500 opacity-30 animate-ping" />
        </motion.button>

        {/* Chatbot Button */}
        <motion.button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          onMouseEnter={() => setIsHoveredChatbot(true)}
          onMouseLeave={() => setIsHoveredChatbot(false)}
          className={`relative group cursor-pointer flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 ${
            isChatbotOpen 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : 'bg-gradient-to-r from-blue-600 to-cyan-500'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isChatbotOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7" />
              {/* Pulse Animation */}
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-pulse" />
            </>
          )}

          {/* Tooltip */}
          <AnimatePresence>
            {isHoveredChatbot && !isChatbotOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                className="absolute right-full mr-4 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 whitespace-nowrap"
              >
                <span className="text-sm font-medium">Chat with us</span>
                <div className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-t border-gray-100" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chatbot Modal */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="fixed bottom-32 right-8 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
          >
            <Chatbot onClose={() => setIsChatbotOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



