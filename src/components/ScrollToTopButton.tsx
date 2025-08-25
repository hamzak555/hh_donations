import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed right-8 bottom-8 bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 border border-gray-200"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 text-gray-700" />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;