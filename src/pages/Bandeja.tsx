import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import OnboardingModal from '../components/Onboarding/OnboardingModal';
import { Building2 } from 'lucide-react';

interface BandejaProps {
  onNavigate?: (module: string) => void;
}

const Bandeja: React.FC<BandejaProps> = ({ onNavigate }) => {
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Estilos CSS responsivos
  const styles = `
    .bandeja-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 4rem); background-color: #f9fafb; padding: 2rem 1rem; }
    .bandeja-illustration { margin-bottom: 2rem; position: relative; }
    .bandeja-cards-container { position: relative; }
    .bandeja-card-back { position: absolute; transform: rotate(-6deg); width: 12rem; height: 8rem; background-color: #d1d5db; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transform: translateX(1rem) translateY(0.5rem); }
    .bandeja-card-front { position: relative; width: 12rem; height: 8rem; background-color: white; border-radius: 0.75rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 2px solid #e5e7eb; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .bandeja-card-icon { width: 3rem; height: 3rem; color: #9ca3af; margin-bottom: 0.5rem; }
    .bandeja-card-lines { display: flex; gap: 0.5rem; }
    .bandeja-line { height: 0.5rem; background-color: #d1d5db; border-radius: 0.25rem; }
    .bandeja-line-1 { width: 2rem; }
    .bandeja-line-2 { width: 1.5rem; }
    .bandeja-line-3 { width: 2.5rem; }
    .bandeja-line-4 { width: 2rem; }
    .bandeja-content { text-align: center; max-width: 32rem; }
    .bandeja-title { font-size: 2rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem; line-height: 1.2; }
    .bandeja-subtitle { font-size: 1.125rem; color: #6b7280; margin-bottom: 2.5rem; line-height: 1.6; }
    .bandeja-button { display: inline-flex; align-items: center; padding: 1rem 2rem; background-color: #2563eb; color: white; font-weight: 600; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.3s; border: none; cursor: pointer; margin-bottom: 3rem; }
    .bandeja-button:hover { background-color: #1d4ed8; transform: scale(1.05); }
    .bandeja-button-icon { width: 1.25rem; height: 1.25rem; margin-right: 0.75rem; }
    .bandeja-info-box { margin-top: 3rem; padding: 1.5rem; background-color: #dbeafe; border-radius: 0.75rem; border: 1px solid #bfdbfe; }
    .bandeja-info-title { font-size: 1rem; color: #1e3a8a; margin-bottom: 1rem; font-weight: 600; }
    .bandeja-info-list { font-size: 1rem; color: #1e40af; margin-top: 0.5rem; line-height: 1.5; text-align: left; max-width: 20rem; margin-left: auto; margin-right: auto; }
    .bandeja-info-item { margin-bottom: 0.5rem; }
    @media (max-width: 48rem) {
      .bandeja-container { padding: 1rem 0.5rem; min-height: calc(100vh - 3rem); }
      .bandeja-illustration { margin-bottom: 1.5rem; }
      .bandeja-card-back, .bandeja-card-front { width: 10rem; height: 6rem; }
      .bandeja-card-icon { width: 2rem; height: 2rem; }
      .bandeja-title { font-size: 1.5rem; margin-bottom: 1rem; }
      .bandeja-subtitle { font-size: 1rem; margin-bottom: 2rem; }
      .bandeja-button { padding: 0.75rem 1.5rem; margin-bottom: 2rem; }
      .bandeja-info-box { padding: 1rem; margin-top: 2rem; }
      .bandeja-content { max-width: 28rem; }
    }
    @media (max-width: 30rem) {
      .bandeja-card-back, .bandeja-card-front { width: 8rem; height: 5rem; }
      .bandeja-title { font-size: 1.25rem; }
      .bandeja-subtitle { font-size: 0.875rem; }
      .bandeja-button { padding: 0.75rem 1rem; font-size: 0.875rem; }
      .bandeja-content { max-width: 24rem; }
    }
  `;

  // Inyectar estilos
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => styleElement.remove();
  }, [styles]);

  const handleOpenOnboarding = () => {
    setIsOnboardingModalOpen(true);
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingModalOpen(false);
  };

  const handleNavigateToBandeja = () => {
    setIsOnboardingModalOpen(false);
    // Ya estamos en bandeja, solo cerramos el modal
  };

  return (
    <DashboardLayout currentModule="bandeja" onNavigate={onNavigate}>
      <div className="bandeja-container">
        {/* Ilustración de estado vacío */}
        <div className="bandeja-illustration">
          <div className="bandeja-cards-container">
            {/* Tarjeta trasera */}
            <div className="bandeja-card-back"></div>
            {/* Tarjeta delantera */}
            <div className="bandeja-card-front">
              <Building2 className="bandeja-card-icon" />
              <div className="bandeja-card-lines">
                <div className="bandeja-line bandeja-line-1"></div>
                <div className="bandeja-line bandeja-line-2"></div>
                <div className="bandeja-line bandeja-line-3"></div>
                <div className="bandeja-line bandeja-line-4"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del estado vacío */}
        <div className="bandeja-content">
          <h2 className="bandeja-title">
            Tu bandeja está vacía
          </h2>
          <p className="bandeja-subtitle">
            Necesitas crear una empresa para comenzar a utilizar la bandeja. 
            Aquí podrás gestionar todas tus obligaciones tributarias.
          </p>
          
          {/* Botón para crear empresa */}
          <button onClick={handleOpenOnboarding} className="bandeja-button">
            <Building2 className="bandeja-button-icon" />
            Crear primera empresa
          </button>
          
          {/* Información adicional */}
          <div className="bandeja-info-box">
            <p className="bandeja-info-title">
              <strong>¿Qué puedes hacer con la bandeja?</strong>
            </p>
            <div className="bandeja-info-list">
              <div className="bandeja-info-item">• Gestionar obligaciones tributarias</div>
              <div className="bandeja-info-item">• Revisar vencimientos próximos</div>
              <div className="bandeja-info-item">• Controlar el estado de tus empresas</div>
              <div className="bandeja-info-item">• Generar reportes y documentos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Onboarding */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={handleCloseOnboarding}
        onNavigateToBandeja={handleNavigateToBandeja}
        onNavigate={onNavigate}
        skipUserTypeSelection={true}
      />
    </DashboardLayout>
  );
};

export default Bandeja;