import React from 'react';
import { X, Building2, User, Calculator } from 'lucide-react';

interface UserTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserTypeSelected: (userType: 'contable' | 'contador' | 'empresario') => void;
}

const UserTypeSelectionModal: React.FC<UserTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onUserTypeSelected
}) => {
  if (!isOpen) return null;

  const cardStyle = { width: '100%', maxWidth: '14rem', minHeight: '12rem', padding: '1.5rem' };
  const normalState = { borderColor: '#e5e7eb', backgroundColor: '#ffffff' };
  const hoverState = { borderColor: '#60a5fa', backgroundColor: '#eff6ff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' };
  const selectedHoverState = { borderColor: '#3b82f6', backgroundColor: '#dbeafe', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, isSelected = false) => {
    const state = isSelected ? selectedHoverState : hoverState;
    Object.assign(e.currentTarget.style, state);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, isSelected = false) => {
    Object.assign(e.currentTarget.style, normalState);
    e.currentTarget.style.boxShadow = '';
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
          
          {/* Modal Header */}
          <div 
            className="border-b border-gray-200"
            style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div 
                  className="bg-yellow-100 rounded-full flex items-center justify-center"
                  style={{ 
                    width: '4rem', 
                    height: '4rem'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>👋</span>
                </div>
              </div>
              <h2 
                className="font-bold text-gray-900"
                style={{ fontSize: '1.5rem', marginTop: '0' }}
              >
                ¡Bienvenido a LUCA!
              </h2>
              <p 
                className="text-gray-600"
                style={{ fontSize: '1rem', marginTop: '0.25rem' }}
              >
                ¿Quién eres? Esto nos ayuda a personalizar tu experiencia
              </p>
            </div>
          </div>

          {/* User Type Selection */}
          <div 
            className="flex-1 overflow-y-auto"
            style={{ padding: '2rem 1.5rem' }}
          >
            <div className="flex flex-row justify-center items-stretch gap-4 max-w-full mx-auto">
              {/* Estudio Contable */}
              <div 
                onClick={() => onUserTypeSelected('contable')}
                className="card-option border-2 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
                style={{ ...cardStyle, ...normalState }}
                onMouseEnter={(e) => handleMouseEnter(e)}
                onMouseLeave={(e) => handleMouseLeave(e)}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <Building2 style={{ width: '3rem', height: '3rem' }} className="text-gray-600" />
                </div>
                <h3 
                  className="font-semibold text-gray-900"
                  style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}
                >
                  Estudio Contable
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ 
                    fontSize: '0.875rem', 
                    marginBottom: '1.5rem',
                    lineHeight: '1.4'
                  }}
                >
                  Manejo múltiples clientes y necesito herramientas de gestión integral
                </p>
                <ul 
                  className="text-left text-gray-500 space-y-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  <li>Gestión de múltiples clientes</li>
                  <li>Reportes consolidados</li>
                  <li>Colaboración en equipo</li>
                </ul>
              </div>

              {/* Contador Independiente - Selected/Highlighted */}
              <div 
                onClick={() => onUserTypeSelected('contador')}
                className="card-option-selected border-2 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
                style={{ ...cardStyle, ...normalState }}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <User style={{ width: '3rem', height: '3rem' }} className="text-blue-600" />
                </div>
                <h3 
                  className="font-semibold text-gray-900"
                  style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}
                >
                  Contador Independiente
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ 
                    fontSize: '0.875rem', 
                    marginBottom: '1.5rem',
                    lineHeight: '1.4'
                  }}
                >
                  Trabajo por mi cuenta ofreciendo servicios contables especializados
                </p>
                <ul 
                  className="text-left text-gray-500 space-y-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  <li>Gestión personalizada</li>
                  <li>Herramientas ágiles</li>
                  <li>Control total</li>
                </ul>
              </div>

              {/* Empresario */}
              <div 
                onClick={() => onUserTypeSelected('empresario')}
                className="card-option border-2 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
                style={{ ...cardStyle, ...normalState }}
                onMouseEnter={(e) => handleMouseEnter(e)}
                onMouseLeave={(e) => handleMouseLeave(e)}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <Calculator style={{ width: '3rem', height: '3rem' }} className="text-gray-600" />
                </div>
                <h3 
                  className="font-semibold text-gray-900"
                  style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}
                >
                  Empresario
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ 
                    fontSize: '0.875rem', 
                    marginBottom: '1.5rem',
                    lineHeight: '1.4'
                  }}
                >
                  Dirijo mi empresa y necesito visibilidad financiera clara
                </p>
                <ul 
                  className="text-left text-gray-500 space-y-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  <li>Dashboards ejecutivos</li>
                  <li>Análisis financiero</li>
                  <li>Toma de decisiones</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTypeSelectionModal;