import { useState, useCallback, useRef } from 'react';
import validCredentialsData from '../data/validCredentials.json';

interface CompanyData {
  id: string;
  ruc: string;
  businessName: string;
  sunatStatus?: string;
  sunatCondition?: string;
  solUser: string;
  solPassword: string;
  isValid: boolean;
  status: 'validando' | 'no_valido' | 'incompleto' | 'verificada' | 'error_conexion';
  validationState: {
    ruc: 'valid' | 'invalid' | 'duplicate' | 'inactive' | 'validating' | 'error_conexion' | null;
    credentials: 'valid' | 'invalid' | 'validating' | 'error_conexion' | null;
  };
  expanded: boolean;
}

interface OnboardingState {
  companies: CompanyData[];
  validCompanyCount: number;
  companyCounter: number;
  hasDraft: boolean;
  tourState: {
    tourSkipped: boolean;
    userClickedContinue: boolean;
    showTourFloating: boolean;
    tourStep: number;
    hasShownTour: boolean; // Nueva flag para controlar si ya se mostró el tour
  };
}

const useOnboarding = () => {
  // Clear localStorage on page load and return clean initial state
  const getInitialState = (): OnboardingState => {
    try {
      // Always clear any existing draft when page loads
      localStorage.removeItem('luca-onboarding-draft');
      // Clear tour state on page reload so it can show on first modal open
      localStorage.removeItem('luca-tour-shown');
      // Set flag to track if modal has been closed in this session
      sessionStorage.removeItem('luca-modal-closed');
    } catch (error) {
      console.error('Error clearing draft from localStorage:', error);
    }
    
    // Always return clean initial state (tour will show on first modal open after page load)
    return {
      companies: [],
      validCompanyCount: 0,
      companyCounter: 0,
      hasDraft: false,
      tourState: {
        tourSkipped: false,
        userClickedContinue: false,
        showTourFloating: false,
        tourStep: 1,
        hasShownTour: false // Always false on page reload
      }
    };
  };

  const [state, setState] = useState<OnboardingState>(getInitialState);

  const tourCloseTimer = useRef<NodeJS.Timeout | null>(null);

  const generateCompanyId = () => `company-${Date.now()}-${Math.random()}`;

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    try {
      const draftData = {
        companies: state.companies,
        validCompanyCount: state.validCompanyCount,
        companyCounter: state.companyCounter,
        hasDraft: true
      };
      localStorage.setItem('luca-onboarding-draft', JSON.stringify(draftData));
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  }, [state.companies, state.validCompanyCount, state.companyCounter]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem('luca-onboarding-draft');
      setState(prev => ({ ...prev, hasDraft: false }));
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);

  const addNewCompany = useCallback(() => {
    setState(prev => {
      const newCompany: CompanyData = {
        id: generateCompanyId(),
        ruc: '',
        businessName: '',
        sunatStatus: '',
        sunatCondition: '',
        solUser: '',
        solPassword: '',
        isValid: false,
        status: 'incompleto',
        validationState: {
          ruc: null,
          credentials: null
        },
        expanded: true
      };

      // Collapse all existing companies
      const updatedCompanies = prev.companies.map(company => ({
        ...company,
        expanded: false
      }));

      const newCompanies = [...updatedCompanies, newCompany];
      
      // If we have 6 or more companies, auto-scroll to bottom after a short delay
      if (newCompanies.length >= 6) {
        setTimeout(() => {
          const scrollableContainer = document.querySelector('.overflow-y-auto');
          if (scrollableContainer) {
            scrollableContainer.scrollTo({
              top: scrollableContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100);
      }

      return {
        ...prev,
        companies: newCompanies,
        companyCounter: prev.companyCounter + 1
      };
    });
  }, []);

  const updateCompanyField = useCallback((id: string, field: string, value: string) => {
    setState(prev => {
      const updatedCompanies = prev.companies.map(company =>
        company.id === id ? { ...company, [field]: value } : company
      );
      
      // Recalculate valid company count based on current state
      const newValidCompanyCount = updatedCompanies.filter(company => company.isValid).length;
      
      return {
        ...prev,
        companies: updatedCompanies,
        validCompanyCount: Math.max(0, newValidCompanyCount) // Ensure it never goes negative
      };
    });
  }, []);

  const validateRuc = useCallback((ruc: string, companyId: string) => {
    // Check for duplicates
    const isDuplicate = state.companies.some(
      company => company.id !== companyId && company.ruc === ruc
    );

    if (isDuplicate) {
      return 'duplicate';
    }

    // Find RUC in valid data
    const rucData = validCredentialsData.validRucs.find(r => r.ruc === ruc);
    
    if (!rucData) {
      return 'invalid';
    }

    // Check for connection error RUCs
    if (rucData.status === 'error_conexion') {
      return 'error_conexion';
    }

    if (rucData.status === 'inactive' || rucData.status === 'suspended') {
      return 'inactive';
    }

    return 'valid';
  }, [state.companies]);

  const validateCredentials = useCallback((solUser: string, solPassword: string) => {
    // Check for connection error credentials
    const errorCredentials = ['CONEXION01', 'TIMEOUT07'];
    if (errorCredentials.includes(solUser)) {
      return 'error_conexion';
    }
    
    const validCred = validCredentialsData.validCredentials.find(
      cred => cred.solUser === solUser && cred.solPassword === solPassword
    );
    
    return validCred ? 'valid' : 'invalid';
  }, []);

  const validateCompany = useCallback((id: string, field: string, value: string) => {
    setState(prev => {
      const company = prev.companies.find(c => c.id === id);
      if (!company) return prev;

      let updatedCompany = { ...company };
      let validCountChange = 0;

      if (field === 'clearRuc') {
        // Handle clearing RUC field - also clear credentials validation
        updatedCompany.validationState.ruc = null;
        updatedCompany.validationState.credentials = null; // Clear credentials when RUC is invalid
        updatedCompany.businessName = '';
        updatedCompany.sunatStatus = '';
        updatedCompany.sunatCondition = '';
        updatedCompany.status = 'incompleto';
        updatedCompany.isValid = false;
        
        const updatedCompanies = prev.companies.map(c => c.id === id ? updatedCompany : c);
        const newValidCount = Math.max(0, updatedCompanies.filter(company => company.isValid).length);
        
        return {
          ...prev,
          companies: updatedCompanies,
          validCompanyCount: newValidCount
        };
      } else if (field === 'clearCredentials') {
        // Handle clearing credentials validation
        updatedCompany.validationState.credentials = null;
        // Determinar estado basado en RUC y campos (priorizar errores)
        const hasRucErrors = updatedCompany.validationState.ruc === 'invalid' || updatedCompany.validationState.ruc === 'duplicate';
        const hasRucIncomplete = !updatedCompany.ruc.trim() || (updatedCompany.ruc.trim().length > 0 && updatedCompany.ruc.trim().length < 11);
        
        if (hasRucErrors || (hasRucIncomplete && updatedCompany.ruc.trim().length > 0)) {
          updatedCompany.status = 'no_valido'; // RUC con errores o menos de 11 dígitos
        } else if (updatedCompany.validationState.ruc === 'valid' || updatedCompany.validationState.ruc === 'inactive') {
          updatedCompany.status = 'incompleto'; // RUC válido pero credenciales vacías
        } else {
          updatedCompany.status = 'incompleto'; // RUC vacío (sin errores)
        }
        updatedCompany.isValid = false;
        
        const wasValid = company.isValid;
        if (wasValid) {
          validCountChange = -1;
          updatedCompany.expanded = true; // Keep expanded for correction
        }
        
        return {
          ...prev,
          companies: prev.companies.map(c => c.id === id ? updatedCompany : c),
          validCompanyCount: prev.validCompanyCount + validCountChange
        };
      } else if (field === 'ruc') {
        // Set validating state first
        updatedCompany.validationState.ruc = 'validating';
        updatedCompany.status = 'validando';
        
        // Simulate validation delay
        setTimeout(() => {
          setState(prevState => {
            const company = prevState.companies.find(c => c.id === id);
            if (!company) return prevState;
            
            const rucValidation = validateRuc(value, id);
            const updatedCompany = { ...company };
            updatedCompany.validationState.ruc = rucValidation;
            
            // Update business name and SUNAT info if RUC is valid or has error_conexion
            if (rucValidation === 'valid' || rucValidation === 'inactive' || rucValidation === 'error_conexion') {
              const rucData = validCredentialsData.validRucs.find(r => r.ruc === value);
              updatedCompany.businessName = rucData?.businessName || '';
              updatedCompany.sunatStatus = rucData?.sunatStatus || '';
              updatedCompany.sunatCondition = rucData?.sunatCondition || '';
            } else {
              updatedCompany.businessName = '';
              updatedCompany.sunatStatus = '';
              updatedCompany.sunatCondition = '';
            }
            
            // If RUC becomes valid/inactive and both credentials exist, auto-validate credentials
            // NO validar credenciales si RUC tiene error de conexión
            if ((rucValidation === 'valid' || rucValidation === 'inactive') && 
                company.solUser.trim() && company.solPassword.trim()) {
              // Trigger credential validation
              const credValidation = validateCredentials(company.solUser, company.solPassword);
              updatedCompany.validationState.credentials = credValidation;
            } else if (rucValidation === 'error_conexion') {
              // Limpiar validación de credenciales si RUC tiene error de conexión
              updatedCompany.validationState.credentials = null;
            }
            
            // Update status based on validation results
            const hasValidRuc = rucValidation === 'valid';
            const hasValidCredentials = updatedCompany.validationState.credentials === 'valid';
            
            // Determinar si hay errores (priorizar errores sobre campos vacíos)
            const hasRucErrors = rucValidation === 'invalid' || rucValidation === 'duplicate';
            const hasCredentialErrors = updatedCompany.validationState.credentials === 'invalid';
            const hasConnectionErrors = rucValidation === 'error_conexion' || updatedCompany.validationState.credentials === 'error_conexion';
            const hasRucIncomplete = !updatedCompany.ruc.trim() || (updatedCompany.ruc.trim().length > 0 && updatedCompany.ruc.trim().length < 11);
            const hasCredentialsIncomplete = !updatedCompany.solUser.trim() || !updatedCompany.solPassword.trim();
            
            // Check for connection error first (RUC or credentials)
            if (hasConnectionErrors) {
              updatedCompany.status = 'error_conexion';
              updatedCompany.isValid = false;
              updatedCompany.expanded = true; // Keep expanded for user to see the error
            } else if (hasRucErrors || (hasRucIncomplete && updatedCompany.ruc.trim().length > 0)) {
              updatedCompany.status = 'no_valido'; // RUC tiene errores o menos de 11 dígitos
            } else if (hasCredentialErrors) {
              updatedCompany.status = 'no_valido'; // Credenciales incorrectas
            } else if (rucValidation === 'inactive') {
              // Special handling for inactive companies
              if (hasValidCredentials) {
                updatedCompany.status = 'verificada'; // Allow verification with warning
                updatedCompany.isValid = true;
                updatedCompany.expanded = false;
              } else if (hasCredentialsIncomplete) {
                updatedCompany.status = 'incompleto'; // Campos vacíos
              } else {
                updatedCompany.status = 'no_valido'; // Credenciales incorrectas
              }
            } else if (hasValidRuc && hasValidCredentials) {
              updatedCompany.status = 'verificada';
              updatedCompany.isValid = true;
              updatedCompany.expanded = false; // Auto-collapse
            } else if (hasRucIncomplete || hasCredentialsIncomplete) {
              updatedCompany.status = 'incompleto'; // Campos vacíos (solo si no hay errores)
            } else {
              updatedCompany.status = 'incompleto'; // Por defecto incompleto
            }
            
            // Recalculate valid count based on current state
            const updatedCompanies = prevState.companies.map(c => c.id === id ? updatedCompany : c);
            const newValidCount = Math.max(0, updatedCompanies.filter(company => company.isValid).length);
            
            // Check tour logic
            let newTourState = { ...prevState.tourState };
            if (newValidCount >= 1 && prevState.tourState.showTourFloating && prevState.tourState.tourStep === 2) {
              console.log('Tour logic: Company verified, advancing to step 3!', {
                newValidCount,
                tourStep: prevState.tourState.tourStep,
                showTourFloating: prevState.tourState.showTourFloating
              });
              newTourState = {
                ...newTourState,
                tourStep: 3,
                showTourFloating: true
              };
            }
            
            return {
              ...prevState,
              companies: updatedCompanies,
              validCompanyCount: newValidCount,
              tourState: newTourState
            };
          });
        }, 1500); // 1.5 second delay for validation
      } else if (field === 'credentials') {
        // Check if both fields are empty
        if (!company.solUser.trim() && !company.solPassword.trim()) {
          updatedCompany.validationState.credentials = null;
          updatedCompany.status = 'incompleto';
          updatedCompany.isValid = false;
          
          const wasValid = company.isValid;
          if (wasValid) {
            validCountChange = -1;
            updatedCompany.expanded = true;
          }
          
          const updatedCompanies = prev.companies.map(c => c.id === id ? updatedCompany : c);
          const newValidCount = Math.max(0, updatedCompanies.filter(company => company.isValid).length);
          
          return {
            ...prev,
            companies: updatedCompanies,
            validCompanyCount: newValidCount
          };
        }
        
        // If one field is empty but the other has content, don't validate yet
        if (!company.solUser.trim() || !company.solPassword.trim()) {
          updatedCompany.validationState.credentials = null;
          // Update status based on RUC state
          if (updatedCompany.validationState.ruc === 'valid' || updatedCompany.validationState.ruc === 'inactive') {
            updatedCompany.status = 'incompleto';
          }
          updatedCompany.isValid = false;
          
          const wasValid = company.isValid;
          if (wasValid) {
            validCountChange = -1;
            updatedCompany.expanded = true;
          }
          
          const updatedCompanies = prev.companies.map(c => c.id === id ? updatedCompany : c);
          const newValidCount = Math.max(0, updatedCompanies.filter(company => company.isValid).length);
          
          return {
            ...prev,
            companies: updatedCompanies,
            validCompanyCount: newValidCount
          };
        }
        
        // Set validating state first
        updatedCompany.validationState.credentials = 'validating';
        updatedCompany.status = 'validando';
        
        // Simulate validation delay
        setTimeout(() => {
          setState(prevState => {
            const company = prevState.companies.find(c => c.id === id);
            if (!company) return prevState;
            
            const credValidation = validateCredentials(company.solUser, company.solPassword);
            const updatedCompany = { ...company };
            updatedCompany.validationState.credentials = credValidation;
            
            // Update status based on validation results
            const hasValidRuc = updatedCompany.validationState.ruc === 'valid';
            const hasInactiveRuc = updatedCompany.validationState.ruc === 'inactive';
            const hasValidCredentials = credValidation === 'valid';
            
            // Determinar si hay errores (priorizar errores sobre campos vacíos)
            const hasRucErrors = updatedCompany.validationState.ruc === 'invalid' || updatedCompany.validationState.ruc === 'duplicate';
            const hasConnectionErrors = updatedCompany.validationState.ruc === 'error_conexion' || credValidation === 'error_conexion';
            const hasRucIncomplete = !updatedCompany.ruc.trim() || (updatedCompany.ruc.trim().length > 0 && updatedCompany.ruc.trim().length < 11);
            const hasCredentialsIncomplete = !updatedCompany.solUser.trim() || !updatedCompany.solPassword.trim();
            
            if (hasConnectionErrors) {
              updatedCompany.status = 'error_conexion'; // Error de conexión
              updatedCompany.isValid = false;
              updatedCompany.expanded = true;
            } else if (credValidation === 'invalid') {
              updatedCompany.status = 'no_valido'; // Credenciales incorrectas
            } else if (hasRucErrors || (hasRucIncomplete && updatedCompany.ruc.trim().length > 0)) {
              updatedCompany.status = 'no_valido'; // RUC tiene errores o menos de 11 dígitos
            } else if ((hasValidRuc || hasInactiveRuc) && hasValidCredentials) {
              updatedCompany.status = 'verificada';
              updatedCompany.isValid = true;
              updatedCompany.expanded = false; // Auto-collapse
            } else if (hasRucIncomplete || hasCredentialsIncomplete) {
              updatedCompany.status = 'incompleto'; // Campos vacíos (solo si no hay errores)
            } else {
              updatedCompany.status = 'incompleto'; // Por defecto incompleto
            }
            
            // Recalculate valid count based on current state
            const updatedCompanies = prevState.companies.map(c => c.id === id ? updatedCompany : c);
            const newValidCount = Math.max(0, updatedCompanies.filter(company => company.isValid).length);
            
            // Check tour logic
            let newTourState = { ...prevState.tourState };
            if (newValidCount >= 1 && prevState.tourState.showTourFloating && prevState.tourState.tourStep === 2) {
              console.log('Tour logic: Company verified, advancing to step 3!', {
                newValidCount,
                tourStep: prevState.tourState.tourStep,
                showTourFloating: prevState.tourState.showTourFloating
              });
              newTourState = {
                ...newTourState,
                tourStep: 3,
                showTourFloating: true
              };
            }
            
            return {
              ...prevState,
              companies: updatedCompanies,
              validCompanyCount: newValidCount,
              tourState: newTourState
            };
          });
        }, 1500); // 1.5 second delay for validation
      }

      // For immediate UI update, just return the company with validating state
      // The actual validation results will be handled by the setTimeout callbacks
      
      // Recalculate valid count to ensure accuracy
      const updatedCompanies = prev.companies.map(c => c.id === id ? updatedCompany : c);
      const newValidCount = Math.max(0, updatedCompanies.filter(company => company.isValid).length);

      // Handle tour logic for first valid company
      let newTourState = { ...prev.tourState };
      
      if (newValidCount >= 1 && prev.tourState.showTourFloating && prev.tourState.tourStep === 2) {
        console.log('Tour logic: Company verified, advancing to step 3!', {
          newValidCount,
          tourStep: prev.tourState.tourStep,
          userClickedContinue: prev.tourState.userClickedContinue,
          showTourFloating: prev.tourState.showTourFloating
        });
        
        console.log('Tour: Advancing to step 3');
        // Advance to step 3 immediately when first company is verified
        newTourState = {
          ...newTourState,
          tourStep: 3,
          showTourFloating: true
        };
      } else if (newValidCount >= 1 && prev.tourState.showTourFloating && !prev.tourState.tourSkipped && prev.tourState.tourStep !== 2) {
        // Start 5-second timer to close tour
        if (tourCloseTimer.current) {
          clearTimeout(tourCloseTimer.current);
        }
        tourCloseTimer.current = setTimeout(() => {
          setState(prevState => ({
            ...prevState,
            tourState: {
              ...prevState.tourState,
              showTourFloating: false,
              tourSkipped: true
            }
          }));
        }, 5000);
      } else if (newValidCount === 0) {
        // Cancel timer if no valid companies remain
        if (tourCloseTimer.current) {
          clearTimeout(tourCloseTimer.current);
          tourCloseTimer.current = null;
        }
      }

      return {
        ...prev,
        companies: updatedCompanies,
        validCompanyCount: newValidCount,
        tourState: newTourState
      };
    });
  }, [validateRuc, validateCredentials]);

  const deleteCompany = useCallback((id: string) => {
    setState(prev => {
      const company = prev.companies.find(c => c.id === id);
      const wasValid = company?.isValid || false;
      
      const updatedCompanies = prev.companies.filter(c => c.id !== id);
      const newValidCount = wasValid ? prev.validCompanyCount - 1 : prev.validCompanyCount;

      // Cancel tour timer if company was valid
      if (wasValid && tourCloseTimer.current) {
        clearTimeout(tourCloseTimer.current);
        tourCloseTimer.current = null;
      }

      return {
        ...prev,
        companies: updatedCompanies,
        validCompanyCount: newValidCount
      };
    });
  }, []);

  const expandCompany = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      companies: prev.companies.map(company => ({
        ...company,
        expanded: company.id === id ? !company.expanded : false
      }))
    }));
  }, []);

  const initializeTour = useCallback(() => {
    // Mark tour as shown in localStorage
    try {
      localStorage.setItem('luca-tour-shown', 'true');
    } catch (error) {
      console.error('Error saving tour state to localStorage:', error);
    }
    
    setState(prev => {
      // Only add company if none exist
      const shouldAddCompany = prev.companies.length === 0;
      
      const newState = {
        ...prev,
        tourState: {
          ...prev.tourState,
          showTourFloating: true,
          tourStep: 1,
          tourSkipped: false,
          userClickedContinue: false,
          hasShownTour: true // Mark that tour has been shown
        }
      };

      if (shouldAddCompany) {
        const newCompany: CompanyData = {
          id: generateCompanyId(),
          ruc: '',
          businessName: '',
          sunatStatus: '',
          sunatCondition: '',
          solUser: '',
          solPassword: '',
          isValid: false,
          status: 'incompleto',
          validationState: {
            ruc: null,
            credentials: null
          },
          expanded: true
        };

        newState.companies = [newCompany];
        newState.companyCounter = 1;
      }

      return newState;
    });
  }, []);

  const handleTourContinue = useCallback(() => {
    console.log('handleTourContinue called');
    setState(prev => {
      console.log('Previous tour state:', prev.tourState);
      const newState = {
        ...prev,
        tourState: {
          ...prev.tourState,
          userClickedContinue: true,
          tourStep: 2
        }
      };
      console.log('New tour state:', newState.tourState);
      
      // Focus RUC input after state update
      setTimeout(() => {
        const rucInput = document.querySelector('input[placeholder*="RUC"]') as HTMLInputElement;
        if (rucInput) {
          rucInput.focus();
          rucInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return newState;
    });
  }, []);

  const handleTourSkip = useCallback(() => {
    console.log('handleTourSkip called');
    if (tourCloseTimer.current) {
      clearTimeout(tourCloseTimer.current);
      tourCloseTimer.current = null;
    }
    
    // Mark tour as shown in localStorage
    try {
      localStorage.setItem('luca-tour-shown', 'true');
    } catch (error) {
      console.error('Error saving tour state to localStorage:', error);
    }
    
    setState(prev => {
      console.log('Skipping tour, previous state:', prev.tourState);
      const newState = {
        ...prev,
        tourState: {
          ...prev.tourState,
          showTourFloating: false,
          tourSkipped: true,
          hasShownTour: true // Mark that tour has been shown
        }
      };
      console.log('Tour skipped, new state:', newState.tourState);
      return newState;
    });
  }, []);

  const handleTourClose = useCallback(() => {
    if (tourCloseTimer.current) {
      clearTimeout(tourCloseTimer.current);
      tourCloseTimer.current = null;
    }

    // Mark tour as shown in localStorage
    try {
      localStorage.setItem('luca-tour-shown', 'true');
    } catch (error) {
      console.error('Error saving tour state to localStorage:', error);
    }

    setState(prev => ({
      ...prev,
      tourState: {
        ...prev.tourState,
        showTourFloating: false,
        tourSkipped: true,
        hasShownTour: true // Mark that tour has been shown
      }
    }));
  }, []);

  const clearAllTimers = useCallback(() => {
    if (tourCloseTimer.current) {
      clearTimeout(tourCloseTimer.current);
      tourCloseTimer.current = null;
    }
  }, []);

  return {
    state,
    actions: {
      addNewCompany,
      updateCompanyField,
      validateCompany,
      deleteCompany,
      expandCompany,
      initializeTour,
      handleTourContinue,
      handleTourSkip,
      handleTourClose,
      clearAllTimers,
      saveDraft,
      clearDraft
    }
  };
};

export default useOnboarding;