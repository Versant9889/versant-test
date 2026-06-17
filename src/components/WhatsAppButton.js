import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const WhatsAppButton = () => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // --- 1. Configuration ---
  // Using the international format (country code 91 for India) without '+' or leading zeros
  const WHATSAPP_NUMBER = "918853779108"; 
  const DEFAULT_MESSAGE = "Hi, I am preparing for the Versant Test and would like some guidance.";
  const encodedMessage = encodeURIComponent(DEFAULT_MESSAGE);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  // --- 2. Exclusion Logic ---
  // Do NOT show the WhatsApp button on any active test pages
  // We exclude paths that contain '/start' since those are the actual testing interfaces.
  const isTestPage = location.pathname.includes('/start');
  
  if (isTestPage) {
    return null;
  }

  // --- 3. CTA Logic ---
  let ctaText = "💬 Need Help?";
  let expandedText = "🎯 Talk to a Versant Expert";
  let isAlwaysExpanded = false;

  if (location.pathname === '/result') {
    ctaText = "Need help improving your score? 💬 Chat with a Versant Expert";
    isAlwaysExpanded = true;
  } else if (location.pathname === '/pricing') {
    ctaText = "Still have questions? Chat with our team before purchasing.";
    isAlwaysExpanded = true;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-end">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-[#20ba59]`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex items-center justify-center">
          {/* WhatsApp SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7"
          >
            <path d="M12.031 21.428h-.011a9.882 9.882 0 0 1-5.04-1.38l-.36-.214-3.75 1.05 1.054-3.66-.235-.373A9.881 9.881 0 0 1 2.1 11.831C2.1 6.353 6.556 1.88 12.042 1.88c2.664 0 5.166 1.042 7.042 2.92a9.921 9.921 0 0 1 2.91 7.03c0 5.478-4.455 9.95-9.963 9.998zm0-17.914c-4.382 0-7.95 3.568-7.95 7.95 0 1.4.363 2.768 1.055 3.972l1.24 2.164-2.124 7.375 7.545-2.107 2.13 1.22c1.192.68 2.535 1.037 3.923 1.037h.007c4.38 0 7.947-3.568 7.947-7.95 0-2.123-.827-4.12-2.327-5.62A7.944 7.944 0 0 0 12.03 3.514zm4.27 10.978c-.234-.117-1.385-.683-1.6-.762-.214-.08-.37-.117-.527.117-.156.234-.606.762-.743.918-.136.156-.273.176-.507.059-.234-.117-.99-.364-1.885-1.16-.697-.62-1.168-1.386-1.305-1.62-.136-.234-.014-.36.103-.477.106-.106.234-.273.351-.41.117-.137.156-.234.234-.39.078-.156.039-.293-.02-.41-.059-.117-.527-1.27-.723-1.74-.191-.46-.386-.398-.527-.406-.136-.008-.293-.008-.45-.008a.866.866 0 0 0-.625.293c-.214.234-.82.802-.82 1.954 0 1.153.84 2.266.957 2.422.117.156 1.652 2.524 4 3.48.558.226.992.36 1.332.46.56.178 1.07.153 1.473.093.453-.067 1.385-.566 1.58-1.114.195-.547.195-1.016.136-1.114-.059-.098-.215-.156-.45-.273z" />
          </svg>
        </div>
        
        {/* Dynamic CTA Text */}
        <div className="flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300">
          {isAlwaysExpanded ? (
            <span className="font-medium text-[15px] max-w-[280px] sm:max-w-xs block whitespace-normal leading-tight">
              {ctaText}
            </span>
          ) : (
            <span className="font-semibold text-[15px]">
              {isHovered ? expandedText : ctaText}
            </span>
          )}
        </div>
      </a>
    </div>
  );
};

export default WhatsAppButton;
