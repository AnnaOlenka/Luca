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

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">👋</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                ¡Bienvenido a LUCA!
              </h2>
              <p className="text-gray-600 mt-1">
                ¿Quién eres? Esto nos ayuda a personalizar tu experiencia
              </p>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="flex-1 px-6 py-8">
            <div className="flex justify-center items-center gap-6 max-w-6xl mx-auto">
              {/* Estudio Contable */}
              <div 
                onClick={() => onUserTypeSelected('contable')}
                className="w-64 h-48 border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center bg-white"
              >
                <div className="mb-4">
                  <Building2 className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Estudio Contable</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Manejo múltiples clientes y necesito herramientas de gestión integral
                </p>
                <ul className="text-left text-gray-500 text-xs space-y-1">
                  <li>Gestión de múltiples clientes</li>
                  <li>Reportes consolidados</li>
                  <li>Colaboración en equipo</li>
                </ul>
              </div>

              {/* Contador Independiente - Selected/Highlighted */}
              <div 
                onClick={() => onUserTypeSelected('contador')}
                className="w-64 h-48 border-2 border-gray-400 bg-white rounded-xl p-6 cursor-pointer hover:border-gray-500 hover:bg-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="mb-4">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contador Independiente</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Trabajo por mi cuenta ofreciendo servicios contables especializados
                </p>
                <ul className="text-left text-gray-500 text-xs space-y-1">
                  <li>Gestión personalizada</li>
                  <li>Herramientas ágiles</li>
                  <li>Control total</li>
                </ul>
              </div>

              {/* Empresario */}
              <div 
                onClick={() => onUserTypeSelected('empresario')}
                className="w-64 h-48 border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center bg-white"
              >
                <div className="mb-4">
                  <Calculator className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Empresario</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Dirijo mi empresa y necesito visibilidad financiera clara
                </p>
                <ul className="text-left text-gray-500 text-xs space-y-1">
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