import { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface GlossaryTermProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ 
    x: 0, 
    y: 0, 
    placement: 'bottom' as 'top' | 'bottom'
  });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const justOpenedRef = useRef(false);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const isMobileView = window.innerWidth < 640;
    const popupWidth = isMobileView ? Math.min(window.innerWidth - 32, 320) : 280;
    const popupHeight = 120;
    
    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;

    let placement: 'top' | 'bottom' = 'bottom';
    let x: number;
    let y: number;

    if (isMobileView) {
      x = window.innerWidth / 2;
      
      if (spaceBelow < popupHeight + 20 && spaceAbove > spaceBelow) {
        placement = 'top';
        y = triggerRect.top - 8;
      } else {
        placement = 'bottom';
        y = triggerRect.bottom + 8;
      }
    } else {
      x = triggerRect.left + triggerRect.width / 2;
      
      if (spaceBelow < popupHeight + 20 && spaceAbove > spaceBelow) {
        placement = 'top';
        y = triggerRect.top - 8;
      } else {
        placement = 'bottom';
        y = triggerRect.bottom + 8;
      }

      const halfWidth = popupWidth / 2;
      if (x - halfWidth < 16) {
        x = halfWidth + 16;
      } else if (x + halfWidth > window.innerWidth - 16) {
        x = window.innerWidth - halfWidth - 16;
      }
    }

    setPosition({ x, y, placement });
  }, []);

  // Ouvrir le popup
  const openPopup = useCallback(() => {
    updatePosition();
    setIsVisible(true);
    justOpenedRef.current = true;
    
    // Réinitialiser le flag après un délai pour permettre la fermeture
    setTimeout(() => {
      justOpenedRef.current = false;
    }, 150);
  }, [updatePosition]);

  // Fermer le popup
  const closePopup = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Toggle le popup
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isVisible) {
      closePopup();
    } else {
      openPopup();
    }
  }, [isVisible, openPopup, closePopup]);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      // Ignorer si le popup vient d'être ouvert
      if (justOpenedRef.current) return;
      
      const target = e.target as Node;
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [isVisible]);

  // Mise à jour de la position au scroll/resize
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

  // Fermer avec la touche Escape
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  // Calculer la position de la flèche sur mobile
  const getArrowStyles = (): React.CSSProperties => {
    if (!triggerRef.current || !isMobile) {
      return {
        left: '50%',
        marginLeft: -6,
      };
    }
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const popupWidth = Math.min(window.innerWidth - 32, 320);
    const popupLeft = position.x - popupWidth / 2;
    const arrowPos = triggerCenter - popupLeft;
    
    return {
      left: Math.max(16, Math.min(arrowPos, popupWidth - 16)),
    };
  };

  const popupWidth = isMobile ? Math.min(window.innerWidth - 32, 320) : 280;

  const popupContent = (
    <div 
      ref={popupRef}
      className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-blue-200 animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: isMobile ? '50%' : position.x,
        top: position.placement === 'top' 
          ? position.y - (isMobile ? 8 : 10) 
          : position.y,
        transform: 'translate(-50%, 0)',
        width: popupWidth,
        maxWidth: 'calc(100vw - 32px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Flèche */}
      <div 
        className={`absolute w-3 h-3 bg-white border-blue-200 ${
          position.placement === 'top' 
            ? 'bottom-0 translate-y-1/2 rotate-45 border-r border-b' 
            : 'top-0 -translate-y-1/2 rotate-45 border-l border-t'
        }`}
        style={getArrowStyles()}
      />
      
      {/* Contenu */}
      <div className="relative p-4">
        {/* Bouton fermer */}
        <button
          onClick={closePopup}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <p className="font-semibold text-blue-800 mb-2 flex items-center gap-2 pr-6">
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span className="break-words">{term}</span>
        </p>
        <p className="text-gray-700 leading-relaxed text-sm break-words">
          {definition}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleClick}
        className="border-b-2 border-dotted border-blue-500 text-blue-700 font-medium cursor-pointer hover:bg-blue-50 px-0.5 rounded transition-colors inline select-none"
        style={{ touchAction: 'manipulation' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        {children || term}
      </span>
      
      {isVisible && createPortal(popupContent, document.body)}
    </>
  );
}

export default GlossaryTerm;
