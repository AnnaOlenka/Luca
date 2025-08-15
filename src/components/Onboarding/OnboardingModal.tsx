import React, { useEffect, useState } from 'react';
import { X, Plus, Building2 } from 'lucide-react';
import CompanyAccordionItem from './CompanyAccordionItem';
import TourFloating from './TourFloating';
import UserTypeSelectionModal from './UserTypeSelectionModal';
import useOnboarding from '../../hooks/useOnboarding';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBandeja: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateToBandeja
}) => {
  const { state, actions } = useOnboarding();
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [hasSelectedUserType, setHasSelectedUserType] = useState(false);

  // Show user type selection modal first when onboarding modal opens
  useEffect(() => {
    if (isOpen && !hasSelectedUserType) {
      setShowUserTypeSelection(true);
    }
  }, [isOpen, hasSelectedUserType]);

  const handleUserTypeSelected = (userType: 'contable' | 'contador' | 'empresario') => {
    console.log('Selected user type:', userType);
    setHasSelectedUserType(true);
    setShowUserTypeSelection(false);
  };

  const handleUserTypeModalClose = () => {
    setShowUserTypeSelection(false);
    setHasSelectedUserType(true);
  };

  // Initialize tour when modal opens for first time only (after page load and if modal hasn't been closed)
  useEffect(() => {
    const modalHasBeenClosed = sessionStorage.getItem('luca-modal-closed') === 'true';
    
    if (isOpen && !state.tourState.tourSkipped && !state.tourState.hasShownTour && 
        !modalHasBeenClosed && state.validCompanyCount === 0 && !state.tourState.showTourFloating) {
      console.log('Initializing tour...');
      actions.initializeTour();
    }
  }, [isOpen, state.tourState.tourSkipped, state.tourState.hasShownTour, state.validCompanyCount, state.tourState.showTourFloating, actions]);
  
  // Debug effect
  useEffect(() => {
    console.log('OnboardingModal state:', {
      isOpen,
      tourState: state.tourState,
      validCompanyCount: state.validCompanyCount,
      companiesCount: state.companies.length
    });
  }, [isOpen, state.tourState, state.validCompanyCount, state.companies.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      actions.clearAllTimers();
    };
  }, [actions]);

  const handleModalClose = () => {
    // Mark that modal has been closed in this session (prevents tour from showing again)
    try {
      sessionStorage.setItem('luca-modal-closed', 'true');
      localStorage.setItem('luca-tour-shown', 'true');
    } catch (error) {
      console.error('Error saving modal state:', error);
    }
    
    if (state.companies.length > 0) {
      const confirmSave = window.confirm('¿Deseas guardar como borrador?');
      if (confirmSave) {
        const saved = actions.saveDraft();
        if (saved) {
          alert('Borrador guardado correctamente');
        } else {
          alert('Error al guardar el borrador');
        }
      }
    }
    
    actions.clearAllTimers();
    onClose();
  };

  const handleBandejaClick = () => {
    // Mark that modal has been closed via navigation (prevents tour from showing again)
    try {
      sessionStorage.setItem('luca-modal-closed', 'true');
      localStorage.setItem('luca-tour-shown', 'true');
    } catch (error) {
      console.error('Error saving modal state:', error);
    }
    
    // Clear draft when successfully completing onboarding
    actions.clearDraft();
    actions.clearAllTimers();
    onNavigateToBandeja();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* User Type Selection Modal - Shows first */}
      <UserTypeSelectionModal
        isOpen={showUserTypeSelection}
        onClose={handleUserTypeModalClose}
        onUserTypeSelected={handleUserTypeSelected}
      />

      {/* Main Onboarding Modal - Shows after user type selection */}
      {!showUserTypeSelection && (
        <>
          {/* Modal Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl" style={{ height: '600px', minHeight: '600px', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          {/* Modal Header - Fixed */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bienvenido a Luca
              </h2>
              <p className="text-gray-600 mt-1">
                Conecta tu primera empresa para comenzar a gestionar sus obligaciones tributarias
              </p>
            </div>
            <button
              onClick={handleModalClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sticky Section - Company Management */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Empresas</span>
              </div>
              {state.hasDraft && (
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                  Borrador guardado
                </span>
              )}
            </div>
            
            <button
              onClick={actions.addNewCompany}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Nueva Empresa</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden">
            <div className="px-6 py-4 h-96 overflow-y-auto">
              {state.companies.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin empresas para mostrar
                  </h3>
                </div>
              ) : (
                /* Companies List with conditional scroll */
                <div className="space-y-4">
                  {state.companies.map((company, index) => (
                    <CompanyAccordionItem
                      key={company.id}
                      company={company}
                      companyNumber={index + 1}
                      isLastCompany={index === state.companies.length - 1}
                      onUpdate={actions.updateCompanyField}
                      onDelete={actions.deleteCompany}
                      onExpand={actions.expandCompany}
                      onValidate={actions.validateCompany}
                    />
                  ))}
                </div>
              )}
              
              {/* Scroll indicator for 5+ companies */}
              {state.companies.length > 5 && (
                <div className="text-center text-xs text-gray-500 mt-4 py-2">
                  {state.companies.length} empresas · Scroll para ver más
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer - Fixed */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {state.validCompanyCount} empresas completamente verificadas
                </p>
                {state.companies.length > 0 && (
                   /* No necesario solo para pruebas */
                  <p className="text-xs text-gray-500">
                    Credenciales de prueba: 20123456789ACME01 / password123
                  </p>
                )}
              </div>

              <button
                onClick={handleBandejaClick}
                className="px-6 py-2 bg-green-600 text-black font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Ir a la Bandeja
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Floating - Independent */}
      <TourFloating
        isVisible={state.tourState.showTourFloating}
        step={state.tourState.tourStep}
        userClickedContinue={state.tourState.userClickedContinue}
        onContinue={actions.handleTourContinue}
        onBack={actions.handleTourBack}
        onClose={actions.handleTourClose}
      />
        </>
      )}
    </>
  );
};

export default OnboardingModal;