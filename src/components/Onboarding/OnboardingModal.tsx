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
  onNavigate?: (module: string) => void;
  skipUserTypeSelection?: boolean;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateToBandeja,
  onNavigate,
  skipUserTypeSelection = false
}) => {
  const { state, actions } = useOnboarding();
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [hasSelectedUserType, setHasSelectedUserType] = useState(false);

  // Estilos CSS centralizados
  const styles = {
    modal: { width: '100%', maxWidth: '56rem', maxHeight: '90vh', height: '37.5rem', minHeight: '37.5rem', display: 'flex', flexDirection: 'column' as const, borderRadius: '0.7rem', overflow: 'hidden' },
    header: { padding: '1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', textAlign: 'center' as const},
    title: { fontSize: '1.25rem', margin: 0, fontWeight: 600, color: '#111827' },
    subtitle: { fontSize: '1rem', margin: '0.25rem 0 0 0', color: '#4b5563' },
    closeButton: { width: '1.5rem', height: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' },
    stickySection: { padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' },
    stickyContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    stickyLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    stickyLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    labelText: { fontSize: '1rem', fontWeight: 500, color: '#111827' },
    badge: { fontSize: '0.75rem', color: '#d97706', backgroundColor: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '9999px' },
    addButton: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '0.875rem', fontWeight: 500, borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s' },
    scrollableContent: { flex: 1, overflow: 'hidden' },
    innerContent: { padding: '1.5rem', height: '100%', maxHeight: '24rem', overflowY: 'auto' as const },
    emptyState: { textAlign: 'center' as const, padding: '3rem 0' },
    emptyIcon: { width: '4rem', height: '4rem', color: '#d1d5db', margin: '0 auto 1rem auto' },
    emptyTitle: { fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' },
    companiesList: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
    scrollIndicator: { textAlign: 'center' as const, fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem', padding: '0.5rem 0' },
    footer: { padding: '1.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff', borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' },
    footerContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    footerLeft: { display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' },
    footerTitle: { fontSize: '0.875rem', fontWeight: 500, color: '#111827', margin: 0 },
    footerSubtitle: { fontSize: '0.75rem', color: '#6b7280', margin: 0 },
    bandejaButton: { padding: '0.5rem 1.5rem', backgroundColor: '#16a34a', color: '#ffffffff', fontSize: '0.875rem', fontWeight: 500, borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s', marginLeft: 'auto' }
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, hoverColor: string, normalColor: string, isEnter: boolean) => {
    e.currentTarget.style.backgroundColor = isEnter ? hoverColor : normalColor;
  };

  // Show user type selection modal first when onboarding modal opens
  useEffect(() => {
    if (isOpen && !hasSelectedUserType && !skipUserTypeSelection) {
      setShowUserTypeSelection(true);
    } else if (skipUserTypeSelection) {
      setHasSelectedUserType(true);
    }
  }, [isOpen, hasSelectedUserType, skipUserTypeSelection]);

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
    
    // Navigate to Bandeja page if navigation function is available
    if (onNavigate) {
      onNavigate('bandeja');
    } else {
      onNavigateToBandeja();
    }
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-xl" style={styles.modal}>
              {/* Modal Header - Fixed */}
              <div className="flex items-center justify-between" style={styles.header}>
                <div>
                  <h2 className="font-semibold text-gray-900" style={styles.title}>
                    Bienvenido a Luca
                  </h2>
                  <p className="text-gray-600" style={styles.subtitle}>
                    Conecta tu primera empresa para comenzar a gestionar sus obligaciones tributarias
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="hover:text-gray-600 transition-colors"
                  style={styles.closeButton}
                >
                  <X style={{ width: '1.5rem', height: '1.5rem'}} />
                </button>
              </div>

              {/* Sticky Section - Company Management */}
              <div style={styles.stickySection}>
                <div style={styles.stickyContent}>
                  <div style={styles.stickyLeft}>
                    <div style={styles.stickyLabel}>
                      <Building2 style={{ width: '1.25rem', height: '1.25rem', color: '#4b5563' }} />
                      <span style={styles.labelText}>Empresas</span>
                    </div>
                    {state.hasDraft && (
                      <span style={styles.badge}>
                        Borrador guardado
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={actions.addNewCompany}
                    style={styles.addButton}
                    onMouseEnter={(e) => handleButtonHover(e, '#1d4ed8', '#2563eb', true)}
                    onMouseLeave={(e) => handleButtonHover(e, '#1d4ed8', '#2563eb', false)}
                  >
                    <Plus style={{ width: '1rem', height: '1rem' }} />
                    <span>Agregar Nueva Empresa</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div style={styles.scrollableContent}>
                <div style={styles.innerContent}>
                  {state.companies.length === 0 ? (
                    /* Empty State */
                    <div style={styles.emptyState}>
                      <Building2 style={styles.emptyIcon} />
                      <h3 style={styles.emptyTitle}>
                        Sin empresas para mostrar
                      </h3>
                    </div>
                  ) : (
                    /* Companies List with conditional scroll */
                    <div style={styles.companiesList}>
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
                    <div style={styles.scrollIndicator}>
                      {state.companies.length} empresas · Scroll para ver más
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer - Fixed */}
              <div style={styles.footer}>
                <div style={styles.footerContent}>

                  <button
                    onClick={handleBandejaClick}
                    style={styles.bandejaButton}
                    onMouseEnter={(e) => handleButtonHover(e, '#15803d', '#16a34a', true)}
                    onMouseLeave={(e) => handleButtonHover(e, '#15803d', '#16a34a', false)}
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
            onJumpToStep={actions.handleTourJumpToStep}
          />

        </>
      )}
    </>
  );
};

export default OnboardingModal;