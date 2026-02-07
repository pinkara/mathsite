import { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen } from 'lucide-react';

interface GlossaryTermProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, placement: 'bottom' as 'top' | 'bottom' });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringRef = useRef(false);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popupWidth = 280;
    
    let x = triggerRect.left + triggerRect.width / 2;
    
    if (x - popupWidth / 2 < 10) {
      x = popupWidth / 2 + 10;
    } else if (x + popupWidth / 2 > window.innerWidth - 10) {
      x = window.innerWidth - popupWidth / 2 - 10;
    }

    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const placement = spaceAbove < 150 && spaceBelow > 150 ? 'bottom' : 'top';

    setPosition({ x, y: triggerRect.top + triggerRect.height / 2, placement });
  }, []);

  const showPopup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isHoveringRef.current = true;
    updatePosition();
    setIsVisible(true);
  };

  const hidePopup = () => {
    isHoveringRef.current = false;
    // Délai avant de cacher pour permettre de survoler le popup
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setIsVisible(false);
      }
    }, 300);
  };

  const handlePopupMouseEnter = () => {
    isHoveringRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    isHoveringRef.current = false;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, updatePosition]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowOffset = () => {
    if (!triggerRef.current) return 0;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    return triggerCenter - position.x;
  };

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        onMouseEnter={showPopup}
        onMouseLeave={hidePopup}
        className="border-b-2 border-dotted border-blue-500 text-blue-700 font-medium cursor-help hover:bg-blue-50 px-0.5 rounded transition-colors"
      >
        {children || term}
      </span>
      
      {isVisible && (
        <div 
          ref={popupRef}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
          className="fixed z-50 w-72 p-3 bg-white rounded-lg shadow-xl border border-blue-200 text-sm animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: position.x,
            top: position.placement === 'top' ? position.y - 10 : position.y + 20,
            transform: 'translate(-50%, 0)',
          }}
        >
          {/* Flèche */}
          <div 
            className={`absolute w-3 h-3 bg-white border-blue-200 ${
              position.placement === 'top' 
                ? 'bottom-0 translate-y-1/2 rotate-45 border-r border-b' 
                : 'top-0 -translate-y-1/2 rotate-45 border-l border-t'
            }`}
            style={{ 
              left: '50%',
              marginLeft: -6 + getArrowOffset(),
            }}
          />
          
          {/* Contenu */}
          <div className="relative">
            <p className="font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {term}
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">{definition}</p>
          </div>
        </div>
      )}
    </span>
  );
}

export default GlossaryTerm;
