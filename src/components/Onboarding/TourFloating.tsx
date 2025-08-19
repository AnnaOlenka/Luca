import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface TourFloatingProps {
  isVisible: boolean;
  step: number;
  userClickedContinue: boolean;
  onContinue: () => void;
  onBack: () => void;
  onClose: () => void;
  onAutoSkipToValidation?: () => void;
  onJumpToStep?: (step: number) => void;
}

const TourFloating: React.FC<TourFloatingProps> = ({
  isVisible,
  step,
  userClickedContinue,
  onContinue,
  onBack,
  onClose,
  onAutoSkipToValidation,
  onJumpToStep
}) => {
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);
  const [rucPosition, setRucPosition] = useState({ x: 50, y: 57, width: 400, height: 100 });
  const [hasDetectedValidation, setHasDetectedValidation] = useState(false);

  // Estilos CSS centralizados
  const styles = {
    // Barra de progreso inferior con flechas
    progressContainer: { 
      position: 'fixed' as const, 
      bottom: '1.25rem', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      zIndex: 70, 
      backgroundColor: '#ffffff', 
      borderRadius: '0.5rem', 
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
      border: '1px solid #e5e7eb', 
      overflow: 'hidden', 
      minWidth: '25rem',
      display: 'flex',
      alignItems: 'center'
    },
    
    // Contenedor principal interno
    progressContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const
    },
    
    // Botones de flecha
    arrowButton: {
      width: '2.5rem',
      height: '100%',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s',
      borderRadius: 0
    },
    
    arrowButtonDisabled: {
      opacity: 0.3,
      cursor: 'not-allowed'
    },
    
    // Tabs navegación
    tabsContainer: { display: 'flex', position: 'relative' as const, height: '1.875rem', width: '100%' },
    tabItem: { 
      flex: 1, 
      padding: '0.75rem 1.5rem', 
      textAlign: 'center' as const, 
      cursor: 'pointer', 
      transition: 'all 0.3s', 
      position: 'relative' as const 
    },
    tabActive: { color: '#2563eb', fontWeight: 500 },
    tabInactive: { color: '#6b7280' },
    tabText: { fontSize: '0.875rem' },
    tabIndicator: { position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: '0.25rem', backgroundColor: '#2563eb' },
    tabSeparator: { width: '1px', backgroundColor: '#e5e7eb' },
    
    // Barra de progreso
    progressSection: { padding: '0.75rem 1.5rem', backgroundColor: '#f9fafb' },
    progressBarBg: { width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem' },
    progressBarFill: { height: '0.5rem', borderRadius: '9999px', transition: 'all 0.5s ease-out', backgroundColor: '#2563eb' },
    
    // Overlay con clip-path
    overlayClip: (clipPath: string) => ({
      position: 'fixed' as const,
      inset: 0,
      zIndex: 60,
      pointerEvents: 'none' as const,
      background: 'rgba(0, 0, 0, 0.5)',
      clipPath
    }),
    
    // Borde decorativo
    decorativeBorder: (pos: typeof rucPosition) => ({
      position: 'fixed' as const,
      left: `${pos.x - (pos.width / 2 / window.innerWidth * 100)}%`,
      top: `${pos.y - (pos.height / 2 / window.innerHeight * 100)}%`,
      width: `${pos.width / window.innerWidth * 100}%`,
      height: `${pos.height / window.innerHeight * 100}%`,
      border: '3px solid white',
      borderRadius: '0.3125rem',
      pointerEvents: 'none' as const,
      zIndex: 55,
      boxShadow: '0 0 0 1px rgba(3, 3, 3, 0.235)'
    }),
    
    // Tooltip principal - TAMAÑO FIJO
    tooltipContainer: (pos: typeof rucPosition, isPositioned: boolean) => ({
      position: 'fixed' as const,
      zIndex: 70,
      ...(isPositioned ? {
        top: `${pos.y}%`,
        left: `${pos.x + (pos.width / 2 / window.innerWidth * 100) + 2}%`,
        transform: 'translateY(-50%)'
      } : {
        bottom: '0.375rem',
        right: '1.5rem'
      })
    }),
    
    // Ventana del tour - DIMENSIONES FIJAS
    tourWindow: { 
      backgroundColor: '#2563eb', 
      borderRadius: '0.5rem', 
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
      padding: '1.5rem', 
      position: 'relative' as const,
      // DIMENSIONES FIJAS PARA TODAS LAS VENTANAS
      width: '20rem',
      height: '12rem',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between'
    },
    
    // Flecha indicadora
    tooltipArrow: {
      position: 'absolute' as const,
      transform: 'translateY(-50%)',
      top: 'calc(50% + 0.25rem)',
      left: '-0.5625rem',
      width: 0,
      height: 0,
      borderTop: '0.5625rem solid transparent',
      borderBottom: '0.5625rem solid transparent',
      borderRight: '0.5625rem solid #2563eb'
    },
    
    // Header del tooltip
    tooltipHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' },
    tooltipTitle: { fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 },
    
    // Contenido del tooltip
    tooltipContent: { 
      color: '#ffffff', 
      fontSize: '0.875rem', 
      marginBottom: '1rem', 
      lineHeight: '1.4',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    
    // Indicador de progreso en tooltip
    progressDots: { display: 'flex', gap: '0.25rem', marginBottom: '1rem' },
    progressDot: (isActive: boolean) => ({
      height: '0.25rem',
      flex: 1,
      borderRadius: '9999px',
      backgroundColor: isActive ? '#ffffff' : '#3b82f6'
    }),
    
    // Botones
    buttonContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    tourButton: { 
      display: 'inline-flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      width: '2rem', 
      height: '2rem', 
      backgroundColor: '#ffffff', 
      color: '#2563eb', 
      borderRadius: '9999px', 
      border: 'none', 
      cursor: 'pointer', 
      transition: 'all 0.3s',
      fontSize: '1rem'
    },
    spacer: { width: '2rem' }
  };

  // Función para detectar si la empresa está validada
  const checkValidationStatus = () => {
    const validationSpan = Array.from(document.querySelectorAll('span, div, p')).find(
      element => {
        const text = element.textContent?.trim();
        return text?.includes('Validado: RUC y credenciales validadas') ||
               text === 'Validado: RUC y credenciales validadas' ||
               (text?.includes('Validado') && text?.includes('credenciales') && text?.includes('validadas'));
      }
    );
    
    const greenCheckIcons = document.querySelectorAll('.text-green-500, .text-green-600');
    const hasValidationWithCheck = Array.from(greenCheckIcons).some(icon => {
      const parent = icon.closest('div');
      return parent?.textContent?.includes('Validado') || parent?.textContent?.includes('credenciales');
    });
    
    const successElements = document.querySelectorAll('[class*="success"], [class*="validated"], [data-validation="success"]');
    
    const companyElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent?.trim();
      return text?.includes('empresas completamente verificadas') ||
             text?.includes('empresa completamente verificada') ||
             (text?.includes('Estado: ACTIVO') && text?.includes('Validado'));
    });
    
    const bandejaButton = Array.from(document.querySelectorAll('button')).find(
      button => button.textContent?.includes('Ir a la Bandeja')
    );
    
    console.log('🔍 Checking validation status:', {
      validationSpan: !!validationSpan,
      hasValidationWithCheck,
      successElements: successElements.length,
      companyElements: companyElements.length,
      bandejaButton: !!bandejaButton
    });
    
    return validationSpan || hasValidationWithCheck || successElements.length > 0 || companyElements.length > 0 || bandejaButton;
  };

  // Función para desbloquear interacciones (más agresiva)
  const unblockInteractions = () => {
    console.log('🔧 Running aggressive unblock of all interactions');
    
    // Encontrar todos los elementos que fueron bloqueados por atributo
    const blockedElements = document.querySelectorAll('[data-tour-blocked="true"]');
    console.log('🔧 Found blocked elements by attribute:', blockedElements.length);
    
    blockedElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      
      // Restaurar estilos originales
      htmlElement.style.pointerEvents = '';
      htmlElement.style.opacity = '';
      htmlElement.style.cursor = '';
      
      // Remover event listeners si existen
      const preventClick = (htmlElement as any)._tourPreventClick;
      if (preventClick) {
        htmlElement.removeEventListener('click', preventClick, { capture: true });
        htmlElement.removeEventListener('mousedown', preventClick, { capture: true });
        htmlElement.removeEventListener('mouseup', preventClick, { capture: true });
        delete (htmlElement as any)._tourPreventClick;
      }
      
      // Remover atributo de bloqueo
      htmlElement.removeAttribute('data-tour-blocked');
    });
    
    // También buscar por patrones específicos sin depender del atributo
    // Desbloquear accordion headers
    const accordionHeaders = document.querySelectorAll('.border.border-gray-200.rounded-lg.overflow-hidden .p-4.cursor-pointer');
    console.log('🔧 Found accordion headers:', accordionHeaders.length);
    accordionHeaders.forEach(header => {
      const htmlElement = header as HTMLElement;
      htmlElement.style.pointerEvents = '';
      htmlElement.style.opacity = '';
      htmlElement.style.cursor = '';
      htmlElement.removeAttribute('data-tour-blocked');
      
      // Limpiar event listeners
      const preventClick = (htmlElement as any)._tourPreventClick;
      if (preventClick) {
        htmlElement.removeEventListener('click', preventClick, { capture: true });
        htmlElement.removeEventListener('mousedown', preventClick, { capture: true });
        htmlElement.removeEventListener('mouseup', preventClick, { capture: true });
        delete (htmlElement as any)._tourPreventClick;
      }
    });
    
    // Desbloquear botones de eliminar
    const deleteButtons = document.querySelectorAll('button .lucide-trash2, button .lucide-trash-2');
    console.log('🔧 Found delete buttons:', deleteButtons.length);
    deleteButtons.forEach(trashIcon => {
      const button = trashIcon.closest('button') as HTMLElement;
      if (button) {
        button.style.pointerEvents = '';
        button.style.opacity = '';
        button.style.cursor = '';
        button.removeAttribute('data-tour-blocked');
        
        const preventClick = (button as any)._tourPreventClick;
        if (preventClick) {
          button.removeEventListener('click', preventClick, { capture: true });
          button.removeEventListener('mousedown', preventClick, { capture: true });
          button.removeEventListener('mouseup', preventClick, { capture: true });
          delete (button as any)._tourPreventClick;
        }
      }
    });
    
    // Desbloquear botones "Agregar Nueva Empresa"
    const addButtons = document.querySelectorAll('button');
    console.log('🔧 Checking all buttons for add company button');
    addButtons.forEach(button => {
      const buttonText = button.textContent?.trim();
      if (buttonText?.includes('Agregar Nueva Empresa') || buttonText?.includes('Agregar Nueva') ||
          (button.querySelector('.lucide-plus') && (buttonText?.includes('Agregar') || buttonText?.includes('Nueva')))) {
        const htmlElement = button as HTMLElement;
        htmlElement.style.pointerEvents = '';
        htmlElement.style.opacity = '';
        htmlElement.style.cursor = '';
        htmlElement.removeAttribute('data-tour-blocked');
        
        const preventClick = (htmlElement as any)._tourPreventClick;
        if (preventClick) {
          htmlElement.removeEventListener('click', preventClick, { capture: true });
          htmlElement.removeEventListener('mousedown', preventClick, { capture: true });
          htmlElement.removeEventListener('mouseup', preventClick, { capture: true });
          delete (htmlElement as any)._tourPreventClick;
        }
        
        console.log('🔧 Unblocked add company button:', buttonText);
      }
    });
    
    console.log('🔧 Aggressive unblock completed');
  };

  // Función para bloquear interacciones SOLO durante pasos 1-3 (sin importar validación)
  const blockInteractions = () => {
    // Solo bloquear si estamos en los pasos 1-3 y el tour está visible
    if (step >= 1 && step <= 3 && isVisible) {
      console.log('🔒 Blocking interactions for step:', step, '(blocking regardless of validation status)');
      
      // Bloquear accordion header (div con clases específicas que contiene el chevron y contenido)
      const accordionContainers = document.querySelectorAll('.border.border-gray-200.rounded-lg.overflow-hidden');
      accordionContainers.forEach(container => {
        const accordionHeader = container.querySelector('.p-4.cursor-pointer') as HTMLElement;
        if (accordionHeader && !accordionHeader.hasAttribute('data-tour-blocked')) {
          // Bloquear el header completo del accordion
          accordionHeader.style.pointerEvents = 'none';
          accordionHeader.style.opacity = '0.8';
          accordionHeader.style.cursor = 'not-allowed';
          
          // Agregar una clase para identificar que está bloqueado
          accordionHeader.setAttribute('data-tour-blocked', 'true');
        }
      });

      // Bloquear específicamente el botón de eliminar (trash icon) dentro del accordion
      const trashButtons = document.querySelectorAll('button .lucide-trash2, button .lucide-trash-2');
      trashButtons.forEach(trashIcon => {
        const button = trashIcon.closest('button') as HTMLElement;
        if (button && button.closest('.border.border-gray-200.rounded-lg') && !button.hasAttribute('data-tour-blocked')) {
          button.style.pointerEvents = 'none';
          button.style.opacity = '0.7';
          button.style.cursor = 'not-allowed';
          button.setAttribute('data-tour-blocked', 'true');
        }
      });

      // Bloquear botón "Agregar Nueva Empresa" con más especificidad
      const addButtons = document.querySelectorAll('button');
      addButtons.forEach(button => {
        const buttonText = button.textContent?.trim();
        if ((buttonText?.includes('Agregar Nueva Empresa') || 
            (button.querySelector('.lucide-plus') && buttonText?.includes('Agregar'))) &&
            !button.hasAttribute('data-tour-blocked')) {
          button.style.pointerEvents = 'none';
          button.style.opacity = '0.8';
          button.style.cursor = 'not-allowed';
          button.setAttribute('data-tour-blocked', 'true');
        }
      });

      // Prevenir eventos de click en elementos bloqueados
      const blockedElements = document.querySelectorAll('[data-tour-blocked="true"]');
      blockedElements.forEach(element => {
        // Solo agregar event listener si no existe ya
        if (!(element as any)._tourPreventClick) {
          const preventClick = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          };
          
          element.addEventListener('click', preventClick, { capture: true });
          element.addEventListener('mousedown', preventClick, { capture: true });
          element.addEventListener('mouseup', preventClick, { capture: true });
          
          // Guardar el handler para poder removerlo después
          (element as any)._tourPreventClick = preventClick;
        }
      });
    } else {
      console.log('🔓 Conditions not met for blocking - step:', step, 'isVisible:', isVisible);
    }
  };

  // Función para bloquear solo accordion y botón eliminar (paso 5)
  const blockAccordionAndDeleteOnly = () => {
    if (step === 5 && isVisible) {
      console.log('🔒 Blocking only accordion and delete button for step 5');
      
      // Bloquear accordion header
      const accordionContainers = document.querySelectorAll('.border.border-gray-200.rounded-lg.overflow-hidden');
      accordionContainers.forEach(container => {
        const accordionHeader = container.querySelector('.p-4.cursor-pointer') as HTMLElement;
        if (accordionHeader && !accordionHeader.hasAttribute('data-tour-blocked')) {
          accordionHeader.style.pointerEvents = 'none';
          accordionHeader.style.opacity = '0.8';
          accordionHeader.style.cursor = 'not-allowed';
          accordionHeader.setAttribute('data-tour-blocked', 'true');
        }
      });

      // Bloquear específicamente el botón de eliminar (trash icon)
      const trashButtons = document.querySelectorAll('button .lucide-trash2, button .lucide-trash-2');
      trashButtons.forEach(trashIcon => {
        const button = trashIcon.closest('button') as HTMLElement;
        if (button && button.closest('.border.border-gray-200.rounded-lg') && !button.hasAttribute('data-tour-blocked')) {
          button.style.pointerEvents = 'none';
          button.style.opacity = '0.7';
          button.style.cursor = 'not-allowed';
          button.setAttribute('data-tour-blocked', 'true');
        }
      });

      // ASEGURAR que el botón "Agregar Nueva Empresa" esté LIBRE
      const addButtons = document.querySelectorAll('button');
      addButtons.forEach(button => {
        const buttonText = button.textContent?.trim();
        if (buttonText?.includes('Agregar Nueva Empresa') || buttonText?.includes('Agregar Nueva') ||
            (button.querySelector('.lucide-plus') && (buttonText?.includes('Agregar') || buttonText?.includes('Nueva')))) {
          const htmlElement = button as HTMLElement;
          // Forzar que esté completamente libre
          htmlElement.style.pointerEvents = 'auto';
          htmlElement.style.opacity = '1';
          htmlElement.style.cursor = 'pointer';
          htmlElement.removeAttribute('data-tour-blocked');
          
          // Limpiar cualquier event listener bloqueante
          const preventClick = (htmlElement as any)._tourPreventClick;
          if (preventClick) {
            htmlElement.removeEventListener('click', preventClick, { capture: true });
            htmlElement.removeEventListener('mousedown', preventClick, { capture: true });
            htmlElement.removeEventListener('mouseup', preventClick, { capture: true });
            delete (htmlElement as any)._tourPreventClick;
          }
          
          console.log('✅ Add company button explicitly kept FREE in step 5:', buttonText);
        }
      });

      // Prevenir eventos de click SOLO en elementos que queremos bloquear (accordion y delete)
      const elementsToBlock = document.querySelectorAll('[data-tour-blocked="true"]');
      elementsToBlock.forEach(element => {
        // Solo agregar event listener si no existe ya
        if (!(element as any)._tourPreventClick) {
          const preventClick = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          };
          
          element.addEventListener('click', preventClick, { capture: true });
          element.addEventListener('mousedown', preventClick, { capture: true });
          element.addEventListener('mouseup', preventClick, { capture: true });
          
          // Guardar el handler para poder removerlo después
          (element as any)._tourPreventClick = preventClick;
        }
      });
    }
  };

  // EFFECT PRINCIPAL DE BLOQUEO/DESBLOQUEO SIMPLIFICADO
  useEffect(() => {
    console.log('🎯 MAIN BLOCKING EFFECT - step:', step, 'isVisible:', isVisible, 'hasDetectedValidation:', hasDetectedValidation);
    
    // Si el tour no está visible, desbloquear todo inmediatamente
    if (!isVisible) {
      console.log('🔓 Tour not visible - unblocking everything');
      unblockInteractions();
      return;
    }
    
    // SIEMPRE bloquear en pasos 1-3, sin importar si hay validación automática o no
    if (step >= 1 && step <= 3) {
      console.log('🔒 Applying blocks for steps 1-3 (ALWAYS blocked regardless of validation)');
      blockInteractions();
      
      // Observer para re-aplicar bloqueo cuando cambie el DOM
      const observer = new MutationObserver(() => {
        // Solo re-aplicar si seguimos en pasos 1-3 y el tour está visible
        if (step >= 1 && step <= 3 && isVisible) {
          setTimeout(() => blockInteractions(), 100);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => {
        observer.disconnect();
      };
    } 
    // Bloqueo especial para paso 5: solo accordion y botón eliminar, NO el botón agregar
    else if (step === 5) {
      console.log('🔒 Applying partial blocks for step 5 (accordion + delete button only)');
      blockAccordionAndDeleteOnly();
      
      // Observer para re-aplicar bloqueo cuando cambie el DOM
      const observer = new MutationObserver(() => {
        if (step === 5 && isVisible) {
          setTimeout(() => blockAccordionAndDeleteOnly(), 100);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => {
        observer.disconnect();
      };
    } 
    else {
      // Para cualquier otro paso (4, 6, etc.), desbloquear todo
      console.log('🔓 Not in blocking steps - unblocking everything');
      unblockInteractions();
    }
  }, [step, isVisible]);

  // Effect para detectar validación automática
  useEffect(() => {
    if (!isVisible || hasDetectedValidation || step >= 4) return;

    if (step >= 1 && step <= 3) {
      const checkAndSkip = () => {
        const isValidated = checkValidationStatus();
        console.log('🎯 Auto-validation check:', { step, isValidated, hasDetectedValidation });
        
        if (isValidated) {
          console.log('🎉 Validación detectada automáticamente, saltando al paso 4');
          setHasDetectedValidation(true);
          
          if (onAutoSkipToValidation) {
            setTimeout(() => {
              onAutoSkipToValidation();
            }, 800);
          }
        }
      };

      setTimeout(checkAndSkip, 500);

      const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;

        mutations.forEach((mutation) => {
          const target = mutation.target as Element;
          
          const hasValidationContent = target.textContent?.includes('Validado: RUC y credenciales validadas') ||
                                     target.textContent?.includes('empresas completamente verificadas') ||
                                     target.textContent?.includes('Estado: ACTIVO') ||
                                     target.textContent?.includes('Ir a la Bandeja');
          
          const hasValidationClasses = target.className?.includes('text-green') ||
                                     target.className?.includes('success') ||
                                     target.className?.includes('validated') ||
                                     target.hasAttribute?.('data-validation-success');

          const isRelevantMutation = mutation.type === 'childList' && 
                                   (target.textContent?.includes('Validado') || 
                                    target.querySelector?.('[class*="text-green"]'));

          if (hasValidationContent || hasValidationClasses || isRelevantMutation) {
            shouldCheck = true;
          }
        });

        if (shouldCheck) {
          setTimeout(() => {
            checkAndSkip();
          }, 300);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-validation-success', 'data-validation-state', 'data-status']
      });

      const intervalId = setInterval(() => {
        console.log('⏰ Periodic validation check at step:', step);
        checkAndSkip();
      }, 3000);

      return () => {
        observer.disconnect();
        clearInterval(intervalId);
      };
    }
  }, [step, isVisible, hasDetectedValidation, onAutoSkipToValidation]);

  // Reset del estado de detección cuando cambia el paso
  useEffect(() => {
    if (step < 4) {
      setHasDetectedValidation(false);
    }
  }, [step]);

  // Cleanup effect para desbloquear al desmontar el componente
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting - cleaning up all blocks');
      unblockInteractions();
    };
  }, []);

  // Calculate element position dynamically
  useEffect(() => {
    if ((step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) && isVisible) {
      const calculateElementPosition = () => {
        let targetElement;
        
        if (step === 1) {
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
          const userLabel = Array.from(document.querySelectorAll('label')).find(
            label => label.textContent?.includes('Usuario SOL *')
          );
          if (userLabel) {
            targetElement = userLabel.parentElement;
          }
        } else if (step === 3) {
          const passwordLabel = Array.from(document.querySelectorAll('label')).find(
            label => label.textContent?.includes('Contraseña SOL *')
          );
          if (passwordLabel) {
            targetElement = passwordLabel.parentElement;
          }
        } else if (step === 4) {
          const validationSpan = Array.from(document.querySelectorAll('span')).find(
            span => span.textContent?.includes('Validado: RUC y credenciales validadas')
          );
          if (validationSpan) {
            targetElement = validationSpan.closest('.border.border-gray-200.rounded-lg') || 
                           validationSpan.closest('.p-4') ||
                           validationSpan.parentElement;
          }
        } else if (step === 5) {
          const addButton = Array.from(document.querySelectorAll('button')).find(
            button => button.textContent?.includes('Agregar Nueva Empresa')
          );
          if (addButton) {
            targetElement = addButton;
          }
        } else if (step === 6) {
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
            width: rect.width + 40,
            height: rect.height + 30
          });
        }
      };

      calculateElementPosition();
      
      const focusInput = () => {
        if (step === 2) {
          const userInput = document.querySelector('input[placeholder*="usuario"], input[placeholder*="Usuario"]') as HTMLInputElement;
          if (userInput) {
            setTimeout(() => {
              userInput.focus();
              userInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
          }
        } else if (step === 3) {
          const passwordInput = document.querySelector('input[type="password"], input[placeholder*="contraseña"], input[placeholder*="Contraseña"]') as HTMLInputElement;
          if (passwordInput) {
            setTimeout(() => {
              passwordInput.focus();
              passwordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
          }
        }
      };
      
      setTimeout(focusInput, 300);
      
      const handleResize = () => calculateElementPosition();
      const handleScroll = () => calculateElementPosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      const timeoutId = setTimeout(calculateElementPosition, 100);
      
      const observer = new MutationObserver((mutations) => {
        let shouldRecalculate = false;
        
        mutations.forEach((mutation) => {
          const target = mutation.target as Element;
          
          const isInOnboardingModal = target.closest('.onboarding-modal') || 
                                    target.closest('[data-tour-target]') ||
                                    target.querySelector('label[for*="ruc"]') ||
                                    target.textContent?.includes('RUC') ||
                                    target.textContent?.includes('Usuario SOL') ||
                                    target.textContent?.includes('Contraseña SOL') ||
                                    target.textContent?.includes('Validado') ||
                                    target.textContent?.includes('Agregar Nueva Empresa') ||
                                    target.textContent?.includes('Ir a la Bandeja');
          
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
          setTimeout(calculateElementPosition, 50);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'data-validation-state']
      });
      
      let rafId: number;
      const checkPosition = () => {
        calculateElementPosition();
        rafId = requestAnimationFrame(checkPosition);
      };
      
      if (step === 1) {
        rafId = requestAnimationFrame(checkPosition);
      }
      
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
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [step, onClose, autoCloseTimer]);

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
    e.currentTarget.style.backgroundColor = isEnter ? '#f3f4f6' : '#ffffff';
  };

  // Funciones de navegación
  const handleTabClick = (targetStep: number) => {
    if (onJumpToStep) {
      onJumpToStep(targetStep);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1 && onBack) {
      onBack();
    }
  };

  const handleNextStep = () => {
    if (step < 6 && onContinue) {
      onContinue();
    }
  };

  const handleArrowButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
    if (!e.currentTarget.disabled) {
      e.currentTarget.style.backgroundColor = isEnter ? '#f3f4f6' : 'transparent';
    }
  };

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
  const isPositionedStep = step >= 1 && step <= 6;

  const clipPath = `polygon(
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
  )`;

  return (
    <>
      {/* Barra de Progreso con Flechas de Navegación */}
      <div style={styles.progressContainer}>
        {/* Flecha Izquierda */}
        <button
          style={{
            ...styles.arrowButton,
            ...(step <= 1 ? styles.arrowButtonDisabled : {})
          }}
          disabled={step <= 1}
          onClick={handlePreviousStep}
          onMouseEnter={(e) => handleArrowButtonHover(e, true)}
          onMouseLeave={(e) => handleArrowButtonHover(e, false)}
        >
          <ArrowLeft style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
        </button>

        {/* Contenido Principal */}
        <div style={styles.progressContent}>
          {/* Navegación tipo tabs */}
          <div style={styles.tabsContainer}>
            {/* Tab Onboarding - Clickeable */}
            <div 
              style={{
                ...styles.tabItem,
                ...(step <= 5 ? styles.tabActive : styles.tabInactive)
              }}
              onClick={() => handleTabClick(1)}
            >
              <span style={styles.tabText}>Onboarding</span>
            </div>
            
            {/* Separador vertical */}
            <div style={styles.tabSeparator}></div>
            
            {/* Tab Ir a la Bandeja - Clickeable */}
            <div 
              style={{
                ...styles.tabItem,
                ...(step === 6 ? styles.tabActive : styles.tabInactive)
              }}
              onClick={() => handleTabClick(6)}
            >
              <span style={styles.tabText}>Ir a la Bandeja</span>
            </div>
          </div>
          
          {/* Barra de progreso continua debajo de los tabs */}
          <div style={styles.progressSection}>
            <div style={styles.progressBarBg}>
              <div 
                style={{
                  ...styles.progressBarFill,
                  // Progreso: pasos 1-5 = 75%, paso 6 = 100%
                  width: step <= 5 ? `${(step / 5) * 75}%` : '100%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Flecha Derecha */}
        <button
          style={{
            ...styles.arrowButton,
            ...(step >= 6 ? styles.arrowButtonDisabled : {})
          }}
          disabled={step >= 6}
          onClick={handleNextStep}
          onMouseEnter={(e) => handleArrowButtonHover(e, true)}
          onMouseLeave={(e) => handleArrowButtonHover(e, false)}
        >
          <ArrowRight style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
        </button>
      </div>

      {/* Single overlay with clip-path cutout */}
      {isPositionedStep && (
        <div style={styles.overlayClip(clipPath)} />
      )}

      {/* Borde redondeado decorativo */}
      {isPositionedStep && (
        <div style={styles.decorativeBorder(rucPosition)} />
      )}

      {/* Tour tooltip */}
      <div style={styles.tooltipContainer(rucPosition, isPositionedStep)}>
        <div style={styles.tourWindow}>
          {/* Triangle pointer - solo para pasos posicionados */}
          {isPositionedStep && (
            <div style={styles.tooltipArrow} />
          )}
          
          {/* Header */}
          <div style={styles.tooltipHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={styles.tooltipTitle}>{content.title}</h3>
              {hasDetectedValidation && step === 4 && (
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#86efac' }} />
              )}
            </div>
          </div>

          {/* Content */}
          <p style={styles.tooltipContent}>
            {content.message}
          </p>

          {/* Buttons */}
          {content.showButtons && (
            <div style={styles.buttonContainer}>
              {/* Lado izquierdo: Indicador "X/3" para pasos 1-3, botón back para pasos 4-6 */}
              {step <= 3 ? (
                <div style={{ 
                  color: '#ffffff', 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {step}/3
                </div>
              ) : (
                /* Back button para pasos 4-6 */
                step >= 4 ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Tour Back clicked');
                      onBack();
                    }}
                    style={styles.tourButton}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                  >
                    <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
                  </button>
                ) : (
                  <div style={styles.spacer}></div>
                )
              )}

              {/* Lado derecho: botones de navegación */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* Back button para pasos 2-3 */}
                {step >= 2 && step <= 3 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Tour Back clicked');
                      onBack();
                    }}
                    style={styles.tourButton}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                  >
                    <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
                  </button>
                )}
                
                {/* Continue button */}
                {content.showContinue && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Tour Continue clicked');
                      onContinue();
                    }}
                    style={styles.tourButton}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                  >
                    <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TourFloating;