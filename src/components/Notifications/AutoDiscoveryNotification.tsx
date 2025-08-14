import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Building, ExternalLink, Check, Plus } from 'lucide-react';

interface RelatedCompany {
  id: string;
  nombre: string;
  ruc: string;
  relacion: string;
  confidence: number;
  sector?: string;
  estado?: string;
}

interface AutoDiscoveryNotificationProps {
  isVisible: boolean;
  personName: string;
  relatedCompanies: RelatedCompany[];
  onClose: () => void;
  onViewDetails: () => void;
  onAddAll: (companies: RelatedCompany[]) => void;
}

const AutoDiscoveryNotification: React.FC<AutoDiscoveryNotificationProps> = ({
  isVisible,
  personName,
  relatedCompanies,
  onClose,
  onViewDetails,
  onAddAll
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, onClose, personName, relatedCompanies.length]);

  if (!isVisible && !isAnimating) return null;
  
  const notificationContent = (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 999999,
        width: '380px',
        maxWidth: 'calc(100vw - 40px)'
      }}
      className={`transition-all duration-300 transform ${
        isVisible && isAnimating 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl border-l-4 border-blue-500 overflow-hidden"
        style={{ 
          backgroundColor: 'white',
          maxWidth: '100%'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-t-lg border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 rounded-full p-1">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold text-blue-900 truncate">
                  Auto-descubrimiento
                </h3>
                <p className="text-xs text-blue-600 truncate">
                  Empresas Relacionadas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-400 hover:text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-start space-x-2 mb-3">
            <div className="bg-blue-100 rounded-full p-1.5 flex-shrink-0">
              <Building className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-800 leading-relaxed">
                🔍 <strong>Detectamos {relatedCompanies.length} empresas adicionales</strong> vinculadas a{' '}
                <span className="font-semibold text-blue-700 break-words">{personName}</span>
              </p>
              
              {/* Preview of companies */}
              <div className="mt-2 space-y-1.5">
                {relatedCompanies.slice(0, 2).map((company, index) => (
                  <div key={company.id} className="bg-gray-50 rounded-md p-2 border border-gray-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {company.nombre}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          RUC: {company.ruc} • {company.relacion}
                        </p>
                      </div>
                      <div className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                        {company.confidence}%
                      </div>
                    </div>
                  </div>
                ))}
                
                {relatedCompanies.length > 2 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{relatedCompanies.length - 2} empresas más...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={onViewDetails}
              className="flex-1 flex items-center justify-center space-x-1.5 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>Ver Detalles</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => onAddAll(relatedCompanies)}
              className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
              title="Agregar todas las empresas"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Todas</span>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-2.5 bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-[10000ms] ease-linear"
              style={{ width: isAnimating ? '0%' : '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Usar portal para renderizar fuera del modal padre
  return createPortal(notificationContent, document.body);
};

export default AutoDiscoveryNotification;