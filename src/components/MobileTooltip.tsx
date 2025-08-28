import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MobileTooltipProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export const MobileTooltip: React.FC<MobileTooltipProps> = ({ 
  trigger, 
  content, 
  side = 'left', 
  align = 'center' 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (isMobile) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 border-0" 
          side={side} 
          align={align}
          sideOffset={5}
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {trigger}
        </TooltipTrigger>
        <TooltipContent 
          className="p-0" 
          side={side} 
          align={align}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};