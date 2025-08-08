import React, { useEffect, useState } from 'react';
import { X, ArrowRight, CheckCircle } from 'lucide-react';

interface TourFloatingProps {
  isVisible: boolean;
  step: number;
  userClickedContinue: boolean;
  onSkip: () => void;
  onContinue: () => void;
  onClose: () => void;
}

const TourFloating: React.FC<TourFloatingProps> = ({
  isVisible,
  step,
  userClickedContinue,
  onSkip,
  onContinue,
  onClose
}) => {
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

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
          title: "¡Bienvenido a Luca!",
          message: "Te ayudaremos a configurar tu primera empresa. ¿Deseas tomar el tour inicial?",
          showButtons: true,
          showContinue: true,
          showSkip: true
        };
      case 2:
        return {
          title: "Información necesaria",
          message: "Para conectar tu empresa necesitamos el RUC y las credenciales SOL. ¡Es muy fácil!",
          showButtons: true,
          showContinue: false,
          showSkip: true
        };
      case 3:
        return {
          title: "¡Excelente trabajo!",
          message: "Has conectado tu primera empresa exitosamente. Ya puedes gestionar todas sus obligaciones tributarias.",
          showButtons: false,
          showContinue: false,
          showSkip: false
        };
      default:
        return {
          title: "",
          message: "",
          showButtons: false,
          showContinue: false,
          showSkip: false
        };
    }
  };

  const content = getTourContent();

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {step === 3 && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <h3 className="font-semibold text-gray-900">{content.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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
          <div className="flex items-center justify-between space-x-3">
            {content.showSkip && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Tour Skip clicked');
                  onSkip();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Omitir tour
              </button>
            )}
            
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
  );
};

export default TourFloating;