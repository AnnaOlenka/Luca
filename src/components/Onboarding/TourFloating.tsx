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

  // Función para calcular el progreso de la barra
  const getProgressPercentage = () => {
    if (step <= 5) {
      return (step / 5) * 75;
    } else {
      return 100;
    }
  };

  // Función para obtener la etapa actual
  const getCurrentStage = () => {
    if (step <= 5) {
      return {
        name: 'Onboarding',
        description: 'Configurando tu primera empresa'
      };
    } else {
      return {
        name: 'Ir a la Bandeja',
        description: 'Completando configuración'
      };
    }
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

  // Función para bloquear interacciones durante pasos 1-3
  const blockInteractions = () => {
    // Solo bloquear si estamos en los pasos 1-3 Y el tour está visible
    if (step >= 1 && step <= 3 && isVisible) {
      // Bloquear accordion header (div con clases específicas que contiene el chevron y contenido)
      const accordionContainers = document.querySelectorAll('.border.border-gray-200.rounded-lg.overflow-hidden');
      accordionContainers.forEach(container => {
        const accordionHeader = container.querySelector('.p-4.cursor-pointer') as HTMLElement;
        if (accordionHeader) {
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
        if (button && button.closest('.border.border-gray-200.rounded-lg')) {
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
        if (buttonText?.includes('Agregar Nueva Empresa') || 
            (button.querySelector('.lucide-plus') && buttonText?.includes('Agregar'))) {
          button.style.pointerEvents = 'none';
          button.style.opacity = '0.8';
          button.style.cursor = 'not-allowed';
          button.setAttribute('data-tour-blocked', 'true');
        }
      });

      // Prevenir eventos de click en elementos bloqueados
      const blockedElements = document.querySelectorAll('[data-tour-blocked="true"]');
      blockedElements.forEach(element => {
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
      });
    }
  };

  // Función para bloquear solo el accordion (paso 5)
  const blockAccordionOnly = () => {
    if (step === 5 && isVisible) {
      // Bloquear solo el accordion header
      const accordionContainers = document.querySelectorAll('.border.border-gray-200.rounded-lg.overflow-hidden');
      accordionContainers.forEach(container => {
        const accordionHeader = container.querySelector('.p-4.cursor-pointer') as HTMLElement;
        if (accordionHeader) {
          accordionHeader.style.pointerEvents = 'none';
          accordionHeader.style.opacity = '0.8';
          accordionHeader.style.cursor = 'not-allowed';
          accordionHeader.setAttribute('data-tour-blocked', 'true');
          
          // Prevenir eventos de click
          const preventClick = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          };
          
          accordionHeader.addEventListener('click', preventClick, { capture: true });
          accordionHeader.addEventListener('mousedown', preventClick, { capture: true });
          accordionHeader.addEventListener('mouseup', preventClick, { capture: true });
          (accordionHeader as any)._tourPreventClick = preventClick;
        }
      });
    }
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

  // Effect para bloquear/desbloquear interacciones
  useEffect(() => {
    console.log('🔒 Tour interaction effect triggered:', { step, isVisible, hasDetectedValidation });
    
    if (!isVisible) {
      console.log('🔓 Tour not visible, unblocking all interactions');
      unblockInteractions();
      return;
    }

    // Si ya se detectó validación automática, no aplicar más bloqueos
    if (hasDetectedValidation && step >= 4) {
      console.log('🔓 Auto-validation already detected, keeping everything unblocked');
      unblockInteractions();
      return;
    }
    
    if (step >= 1 && step <= 3) {
      console.log('🔒 Blocking interactions for step:', step);
      blockInteractions();
      
      // Re-aplicar bloqueo después de cambios en el DOM solo para pasos 1-3
      const observer = new MutationObserver(() => {
        // Solo re-aplicar bloqueo si todavía estamos en pasos 1-3
        if (step >= 1 && step <= 3 && isVisible) {
          setTimeout(blockInteractions, 100);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => {
        console.log('🔓 Cleaning up observer and unblocking for step:', step);
        observer.disconnect();
        // Asegurar desbloqueo al limpiar el observer
        unblockInteractions();
      };
    } else if (step === 5) {
      // En el paso 5, solo bloquear el accordion SI NO hay auto-validación
      if (hasDetectedValidation) {
        console.log('🔓 Step 5 but auto-validation detected, keeping everything unblocked');
        unblockInteractions();
        return;
      }
      
      console.log('🔒 Blocking only accordion for step 5, keeping add button free');
      
      // Primero desbloquear todo completamente
      unblockInteractions();
      
      // Luego aplicar solo bloqueo del accordion una vez
      setTimeout(() => {
        const accordionContainers = document.querySelectorAll('.border.border-gray-200.rounded-lg.overflow-hidden');
        accordionContainers.forEach(container => {
          const accordionHeader = container.querySelector('.p-4.cursor-pointer') as HTMLElement;
          if (accordionHeader && !accordionHeader.hasAttribute('data-tour-blocked')) {
            accordionHeader.style.pointerEvents = 'none';
            accordionHeader.style.opacity = '0.8';
            accordionHeader.style.cursor = 'not-allowed';
            accordionHeader.setAttribute('data-tour-blocked', 'true');
            
            const preventClick = (e: Event) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
            };
            
            accordionHeader.addEventListener('click', preventClick, { capture: true });
            accordionHeader.addEventListener('mousedown', preventClick, { capture: true });
            accordionHeader.addEventListener('mouseup', preventClick, { capture: true });
            (accordionHeader as any)._tourPreventClick = preventClick;
          }
        });
        
        // Asegurar explícitamente que el botón "Agregar Nueva Empresa" esté libre
        const addButtons = document.querySelectorAll('button');
        addButtons.forEach(button => {
          const buttonText = button.textContent?.trim();
          if (buttonText?.includes('Agregar Nueva Empresa') || buttonText?.includes('Agregar Nueva') ||
              (button.querySelector('.lucide-plus') && (buttonText?.includes('Agregar') || buttonText?.includes('Nueva')))) {
            const htmlElement = button as HTMLElement;
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
            
            console.log('✅ Add company button explicitly unblocked:', buttonText);
          }
        });
      }, 150);
    } else {
      // Para cualquier paso que NO sea 1-3 o 5, desbloquear inmediatamente
      console.log('🔓 Unblocking interactions for step:', step);
      unblockInteractions();
    }
  }, [step, isVisible, hasDetectedValidation]);

  // Effect separado para asegurar desbloqueo inmediato cuando cambie el paso
  useEffect(() => {
    if (step > 5 && isVisible) {
      // Forzar desbloqueo inmediato cuando salgamos de pasos 1-5
      console.log('🎯 Step > 5 detected - forcing complete unblock');
      setTimeout(() => {
        unblockInteractions();
      }, 50);
    }
    
    // Si el tour ha terminado completamente (paso 6 o más), desbloquear todo
    if (step >= 6) {
      console.log('🎯 Tour completed (step >= 6) - ensuring complete unblock');
      unblockInteractions();
      
      // Desbloqueo adicional con delay más largo para asegurar
      setTimeout(() => {
        console.log('🎯 Final unblock after tour completion');
        unblockInteractions();
      }, 200);
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
          
          // Desbloquear inmediatamente cuando se detecta validación
          console.log('🔓 Forcing unblock due to automatic validation');
          unblockInteractions();
          
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
            // También forzar desbloqueo cuando el observer detecta cambios de validación
            if (checkValidationStatus()) {
              console.log('🔓 Observer forcing unblock due to validation detection');
              unblockInteractions();
            }
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

  // Forzar desbloqueo cuando se detecta validación automática
  useEffect(() => {
    if (hasDetectedValidation && step >= 4) {
      console.log('🔓 Auto-validation detected, forcing unblock of all interactions');
      unblockInteractions();
      
      // Desbloqueo adicional para asegurar que la validación automática libere todo
      setTimeout(() => {
        console.log('🔓 Secondary unblock after auto-validation');
        unblockInteractions();
      }, 150);
    }
  }, [hasDetectedValidation, step]);

  // Effect adicional para desbloqueo completo cuando el tour termine definitivamente
  useEffect(() => {
    // Si el tour no está visible O si está en el último paso, desbloquear completamente
    if (!isVisible || step >= 6 || (hasDetectedValidation && step >= 4)) {
      console.log('🎯 TOUR ENDED - Complete unblock of all modal interactions', { 
        isVisible, 
        step, 
        hasDetectedValidation 
      });
      
      // Desbloqueo inmediato
      unblockInteractions();
      
      // Desbloqueo con delays escalonados para asegurar
      setTimeout(() => {
        console.log('🎯 First delayed unblock after tour end');
        unblockInteractions();
      }, 100);
      
      setTimeout(() => {
        console.log('🎯 Final delayed unblock after tour end');
        unblockInteractions();
      }, 300);
    }
  }, [isVisible, step, hasDetectedValidation]);

  // Cleanup effect para desbloquear al desmontar el componente
  useEffect(() => {
    return () => {
      unblockInteractions();
    };
  }, []);

  // Effect adicional para asegurar desbloqueo cuando el tour termine
  useEffect(() => {
    if (!isVisible) {
      console.log('🎯 Tour is no longer visible - FORCE UNBLOCKING ALL INTERACTIONS');
      unblockInteractions();
      
      // Desbloqueo adicional después de un pequeño delay para asegurar que se aplique
      setTimeout(() => {
        console.log('🎯 Secondary unblock after tour ended');
        unblockInteractions();
      }, 100);
    }
  }, [isVisible]);

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