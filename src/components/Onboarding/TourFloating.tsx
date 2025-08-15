import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface TourFloatingProps {
  isVisible: boolean;
  step: number;
  userClickedContinue: boolean;
  onContinue: () => void;
  onClose: () => void;
}

const TourFloating: React.FC<TourFloatingProps> = ({
  isVisible,
  step,
  userClickedContinue,
  onContinue,
  onClose
}) => {
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);
  const [rucPosition, setRucPosition] = useState({ x: 50, y: 57, width: 400, height: 100 });

  // Calculate RUC element position
  useEffect(() => {
    if (step === 1 && isVisible) {
      const findRucElement = () => {
        // Look for the RUC div by searching for the label text
        const rucLabel = Array.from(document.querySelectorAll('label')).find(
          label => label.textContent?.includes('RUC *')
        );
        
        if (rucLabel) {
          const rucContainer = rucLabel.closest('.relative.z-\\[100\\]') || rucLabel.parentElement;
          if (rucContainer) {
            const rect = rucContainer.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            setRucPosition({
              x: ((rect.left + rect.width / 2) / viewportWidth) * 100,
              y: ((rect.top + rect.height / 2) / viewportHeight) * 100,
              width: rect.width + 40, // Add some padding
              height: rect.height + 20
            });
          }
        }
      };
      
      // Try immediately and also with a small delay to ensure DOM is ready
      findRucElement();
      setTimeout(findRucElement, 100);
    }
  }, [step, isVisible]);

  useEffect(() => {
    // Clear any existing timer first
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    
    // Auto close timer for step 3
    if (step === 3) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      setAutoCloseTimer(timer);
    }
    
    // Cleanup function
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [step, onClose, autoCloseTimer]);

  if (!isVisible) return null;

  const getTourContent = () => {
    switch (step) {
      case 1:
        return {
          title: "Enfocar el RUC",
          message: "Ingrese su RUC, debe contener 11 dígitos",
          showButtons: true,
          showContinue: true
        };
      case 2:
        return {
          title: "Información necesaria",
          message: "Para conectar tu empresa necesitamos el RUC y las credenciales SOL. ¡Es muy fácil!",
          showButtons: true,
          showContinue: false
        };
      case 3:
        return {
          title: "¡Excelente trabajo!",
          message: "Has conectado tu primera empresa exitosamente. Ya puedes gestionar todas sus obligaciones tributarias.",
          showButtons: false,
          showContinue: false
        };
      default:
        return {
          title: "",
          message: "",
          showButtons: false,
          showContinue: false
        };
    }
  };

  const content = getTourContent();

  return (
    <>
      {/* Single overlay with clip-path cutout - visual only, no interaction blocking */}
      {step === 1 && (
        <div 
          className="fixed inset-0 z-60 pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            mask: `radial-gradient(ellipse ${rucPosition.width}px ${rucPosition.height}px at ${rucPosition.x}% ${rucPosition.y}%, transparent 50%, black 50%)`,
            WebkitMask: `radial-gradient(ellipse ${rucPosition.width}px ${rucPosition.height}px at ${rucPosition.x}% ${rucPosition.y}%, transparent 50%, black 50%)`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Tour tooltip */}
      <div 
        className="fixed z-70 animate-fade-in"
        style={{
          top: step === 1 ? '48%' : 'auto',
          left: step === 1 ? 'calc(50% + 220px)' : 'auto',
          transform: step === 1 ? 'translateY(-50%)' : 'none',
          bottom: step !== 1 ? '6px' : 'auto',
          right: step !== 1 ? '24px' : 'auto'
        }}
      >
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              {step === 3 && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <h3 className="font-semibold text-gray-900">{content.title}</h3>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-600 text-sm mb-4">
            {content.message}
          </p>

          {/* Progress indicator */}
          <div className="flex space-x-1 mb-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          {content.showButtons && (
            <div className="flex items-center justify-end">
              {content.showContinue && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Tour Continue clicked');
                    onContinue();
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Auto close indicator for step 3 */}
          {step === 3 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TourFloating;