import React, { useState } from 'react';
import { Phone, MessageCircle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = '+254 720 935 895';
  const rawPhone = '254720935895';
  const whatsappUrl = `https://wa.me/${rawPhone}?text=Hello%20SaaSLink%20Team%2C%20I%20would%20like%20to%20inquire%20about%20the%20School%20Management%20Platform.`;
  const callUrl = `tel:+254720935895`;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-76 sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 overflow-hidden text-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">SaaSLink Support Desk</h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                    <span className="text-[11px] text-gray-500 font-medium">Available & Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              Have questions about onboarding, pricing, or system features? Connect directly with our team.
            </p>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold shadow-md shadow-[#25D366]/20 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-2.5">
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp: {phoneNumber}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href={callUrl}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-brand-green" />
                  <span>Direct Call: 0720935895</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Toll</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:bg-[#20ba59] transition-colors focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
        aria-label="Contact via WhatsApp or Phone"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-30 pointer-events-none"></span>
        <MessageCircle className="w-7 h-7 fill-current" />
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
