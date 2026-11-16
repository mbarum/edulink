import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SupportedLanguage } from '../i18n/translations';

interface LanguageSelectorProps {
  variant?: 'light' | 'dark' | 'minimal';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'light',
  className = '' 
}) => {
  const { currentLanguage, currentLanguageOption, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Styling variants
  const getButtonStyles = () => {
    if (variant === 'dark') {
      return 'bg-white/10 hover:bg-white/15 text-brand-white border border-white/15 focus:ring-brand-sand/50';
    }
    if (variant === 'minimal') {
      return 'bg-transparent hover:bg-gray-100 text-gray-700 border-none px-2 py-1.5';
    }
    // Default light
    return 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm focus:ring-blue-500/30';
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 outline-none focus:ring-2 ${getButtonStyles()}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 opacity-75" />
        <span className="text-sm mr-0.5">{currentLanguageOption.flag}</span>
        <span className="hidden sm:inline font-medium">{currentLanguageOption.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
            Choose Language / Lugha
          </div>
          {supportedLanguages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors ${
                  isSelected 
                    ? 'bg-blue-50/80 text-blue-700 font-bold' 
                    : 'text-gray-700 hover:bg-gray-50 font-medium'
                }`}
                role="menuitem"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <span className="block leading-tight">{lang.nativeName}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{lang.name}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
