import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface TourFloatingProps {
  isVisible: boolean;
  step: number;
  userClickedContinue: boolean;
  onContinue: () => void;
  onBack: () => void;
  onClose: () => void;
}

const TourFloating: React.FC<TourFloatingProps> = ({
  isVisible,
  step,
  userClickedContinue,
  onContinue,
  onBack,
  onClose
}) => {
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);
  const [rucPosition, setRucPosition] = useState({ x: 50, y: 57, width: 400, height: 100 });

  // Calculate element position dynamically for steps 1, 2, 3, 4, 5 and 6
  useEffect(() => {
    if ((step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) && isVisible) {
      const calculateElementPosition = () => {
        let targetElement;
        
        if (step === 1) {
          // Look for RUC label
          const rucLabel = Array.from(document.querySelectorAll('label')).find(
            label => label.textContent?.includes('RUC *')
          );
          if (rucLabel) {
            targetElement = rucLabel.closest('div.relative');
            if (targetElement && !targetElement.classList.contains('z-[100]')) {
              targetElement = targetElement.closest('div.relative');
            }
          }
        } else if (step === 2) {
          // Look for Usuario SOL label
          const userLabel = Array.from(document.querySelectorAll('label')).find(
            label => label.textContent?.includes('Usuario SOL *')
          );
          if (userLabel) {
            targetElement = userLabel.parentElement;
          }
        } else if (step === 3) {
          // Look for Contraseña SOL label
          const passwordLabel = Array.from(document.querySelectorAll('label')).find(
            label => label.textContent?.includes('Contraseña SOL *')
          );
          if (passwordLabel) {
            targetElement = passwordLabel.parentElement;
          }
        } else if (step === 4) {
          // Look for the validation span with "Validado: RUC y credenciales validadas"
          const validationSpan = Array.from(document.querySelectorAll('span')).find(
            span => span.textContent?.includes('Validado: RUC y credenciales validadas')
          );
          if (validationSpan) {
            // Find the company accordion item container
            targetElement = validationSpan.closest('.border.border-gray-200.rounded-lg') || 
                           validationSpan.closest('.p-4') ||
                           validationSpan.parentElement;
          }
        } else if (step === 5) {
          // Look for the "Agregar Nueva Empresa" button
          const addButton = Array.from(document.querySelectorAll('button')).find(
            button => button.textContent?.includes('Agregar Nueva Empresa')
          );
          if (addButton) {
            targetElement = addButton;
          }
        } else if (step === 6) {
          // Look for the "Ir a la Bandeja" button
          const bandejaButton = Array.from(document.querySelectorAll('button')).find(
            button => button.textContent?.includes('Ir a la Bandeja')
          );
          if (bandejaButton) {
            targetElement = bandejaButton;
          }
        }
        
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          setRucPosition({
            x: ((rect.left + rect.width / 2) / viewportWidth) * 100,
            y: ((rect.top + rect.height / 2) / viewportHeight) * 100,
            width: rect.width + 40, // Add some padding
            height: rect.height + 30
          });
        }
      };

      // Calculate position immediately
      calculateElementPosition();
      
      // Auto-focus inputs based on tour step
      const focusInput = () => {
        if (step === 2) {
          // Focus Usuario SOL input
          const userInput = document.querySelector('input[placeholder*="usuario"], input[placeholder*="Usuario"]') as HTMLInputElement;
          if (userInput) {
            setTimeout(() => {
              userInput.focus();
              userInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
          }
        } else if (step === 3) {
          // Focus Contraseña SOL input
          const passwordInput = document.querySelector('input[type="password"], input[placeholder*="contraseña"], input[placeholder*="Contraseña"]') as HTMLInputElement;
          if (passwordInput) {
            setTimeout(() => {
              passwordInput.focus();
              passwordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
          }
        }
      };
      
      // Execute focus after a delay to ensure DOM is ready
      setTimeout(focusInput, 300);
      
      // Add event listeners for dynamic recalculation
      const handleResize = () => calculateElementPosition();
      const handleScroll = () => calculateElementPosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true); // true for capture phase to catch all scroll events
      
      // Also recalculate after a short delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(calculateElementPosition, 100);
      
      // Set up MutationObserver to detect DOM changes (like validation messages appearing)
      const observer = new MutationObserver((mutations) => {
        let shouldRecalculate = false;
        
        mutations.forEach((mutation) => {
          const target = mutation.target as Element;
          
          // Only recalculate if changes are in relevant areas
          const isInOnboardingModal = target.closest('.onboarding-modal') || 
                                    target.closest('[data-tour-target]') ||
                                    target.querySelector('label[for*="ruc"]') ||
                                    target.textContent?.includes('RUC') ||
                                    target.textContent?.includes('Usuario SOL') ||
                                    target.textContent?.includes('Contraseña SOL') ||
                                    target.textContent?.includes('Validado') ||
                                    target.textContent?.includes('Agregar Nueva Empresa') ||
                                    target.textContent?.includes('Ir a la Bandeja');
          
          // Check if any changes affect the layout (childList changes, attribute changes)
          if (isInOnboardingModal && (
            mutation.type === 'childList' || 
            (mutation.type === 'attributes' && 
             (mutation.attributeName === 'class' || 
              mutation.attributeName === 'style' ||
              mutation.attributeName === 'data-validation-state')))) {
            shouldRecalculate = true;
          }
        });
        
        if (shouldRecalculate) {
          // Debounce the recalculation to avoid excessive calls
          setTimeout(calculateElementPosition, 50);
        }
      });
      
      // Start observing the document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'data-validation-state']
      });
      
      // Additional RAF-based position checking for cases where MutationObserver might miss
      let rafId: number;
      const checkPosition = () => {
        calculateElementPosition();
        rafId = requestAnimationFrame(checkPosition);
      };
      
      // Start position checking only for step 1 (RUC input) where layout changes are most common
      if (step === 1) {
        rafId = requestAnimationFrame(checkPosition);
      }
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
        observer.disconnect();
        clearTimeout(timeoutId);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, [step, isVisible]);

  useEffect(() => {
    // Clear any existing timer first
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    
    // No auto close timer needed since step 6 is the final step
    
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
          title: "Primer paso:",
          message: "Ingrese su RUC, debe contener 11 dígitos",
          showButtons: true,
          showContinue: true
        };
      case 2:
        return {
          title: "Segundo paso:",
          message: "Ingrese su usuario SOL",
          showButtons: true,
          showContinue: true
        };
      case 3:
        return {
          title: "Tercer paso:",
          message: "Ingrese su contraseña SOL",
          showButtons: true,
          showContinue: true
        };
      case 4:
        return {
          title: "¡Felicidades!",
          message: "Has registrado correctamente tu primera empresa",
          showButtons: true,
          showContinue: true
        };
      case 5:
        return {
          title: "Agrega otra empresa:",
          message: "Gestiona múltiples empresas al mismo tiempo",
          showButtons: true,
          showContinue: true
        };
      case 6:
        return {
          title: "Ir a la Bandeja:",
          message: "Después de agregar tus empresas, redirigete a la bandeja",
          showButtons: true,
          showContinue: true
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
      {(step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) && (
        <div 
          className="fixed inset-0 z-60 pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${rucPosition.x - (rucPosition.width / 2 / window.innerWidth * 100)}% 100%, 
              ${rucPosition.x - (rucPosition.width / 2 / window.innerWidth * 100)}% ${rucPosition.y - (rucPosition.height / 2 / window.innerHeight * 100)}%, 
              ${rucPosition.x + (rucPosition.width / 2 / window.innerWidth * 100)}% ${rucPosition.y - (rucPosition.height / 2 / window.innerHeight * 100)}%, 
              ${rucPosition.x + (rucPosition.width / 2 / window.innerWidth * 100)}% ${rucPosition.y + (rucPosition.height / 2 / window.innerHeight * 100)}%, 
              ${rucPosition.x - (rucPosition.width / 2 / window.innerWidth * 100)}% ${rucPosition.y + (rucPosition.height / 2 / window.innerHeight * 100)}%, 
              ${rucPosition.x - (rucPosition.width / 2 / window.innerWidth * 100)}% 100%, 
              100% 100%, 
              100% 0%
            )`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Tour tooltip */}
      <div 
        className="fixed z-70 animate-fade-in"
        style={{
          top: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) ? `${rucPosition.y}%` : 'auto',
          left: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) ? `${rucPosition.x + (rucPosition.width / 2 / window.innerWidth * 100) + 2}%` : 'auto',
          transform: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) ? 'translateY(-50%)' : 'none',
          bottom: (step !== 1 && step !== 2 && step !== 3 && step !== 4 && step !== 5 && step !== 6) ? '6px' : 'auto',
          right: (step !== 1 && step !== 2 && step !== 3 && step !== 4 && step !== 5 && step !== 6) ? '24px' : 'auto'
        }}
      >
        <div className="bg-blue-600 rounded-lg shadow-xl p-6 max-w-sm relative">
          {/* Triangle pointer - only for steps 1, 2, 3, 4, 5 and 6 */}
          {(step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) && (
            <div
              className="absolute transform -translate-y-1/2"
              style={{
                top: 'calc(50% + 4px)',
                left: '-9px',
                width: 0,
                height: 0,
                borderTop: '9px solid transparent',
                borderBottom: '9px solid transparent',
                borderRight: '9px solid #2563eb'
              }}
            />
          )}
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white">{content.title}</h3>
            </div>
          </div>

          {/* Content */}
          <p className="text-white text-sm mb-4">
            {content.message}
          </p>

          {/* Progress indicator */}
          <div className="flex space-x-1 mb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i <= step ? 'bg-white' : 'bg-blue-400'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          {content.showButtons && (
            <div className="flex items-center justify-between">
              {/* Back button - only show from step 2 onwards */}
              {step >= 2 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Tour Back clicked');
                    onBack();
                  }}
                  className="inline-flex items-center justify-center w-8 h-8 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              
              {/* Spacer when no back button */}
              {step < 2 && <div></div>}
              
              {/* Continue button */}
              {content.showContinue && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Tour Continue clicked');
                    onContinue();
                  }}
                  className="inline-flex items-center justify-center w-8 h-8 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default TourFloating;