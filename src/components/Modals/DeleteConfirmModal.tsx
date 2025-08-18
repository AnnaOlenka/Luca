import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  companyName: string;
  isDeleting?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  companyName,
  isDeleting = false 
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative flex flex-col shadow-xl"
          style={{width: '896px', height: '600px', borderRadius: '12px', backgroundColor: 'white'}}
        >
          {/* Header */}
          <div className="p-6" style={{backgroundColor: '#dc2626', color: 'white', borderRadius: '12px 12px 0 0'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
                  <p className="" style={{color: '#fecaca'}}>Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2"
                style={{color: 'white', backgroundColor: 'transparent', border: 'none'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content - Scrolleable */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#fee2e2'}}>
                <Trash2 className="w-8 h-8" style={{color: '#dc2626'}} />
              </div>
              
              <h3 className="text-lg font-medium mb-2" style={{color: '#111827'}}>
                ¿Estás seguro de que deseas eliminar esta empresa?
              </h3>
              
              <div className="rounded-lg p-4 mb-4" style={{backgroundColor: '#f9fafb'}}>
                <p className="text-sm mb-1" style={{color: '#4b5563'}}>Empresa a eliminar:</p>
                <p className="font-medium" style={{color: '#111827'}}>{companyName}</p>
              </div>
              
              <div className="border rounded-lg p-4 mb-4" style={{backgroundColor: '#fffbeb', borderColor: '#fde047'}}>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 mt-0.5" style={{color: '#ca8a04'}} />
                  <div className="text-left">
                    <p className="text-sm font-medium mb-1" style={{color: '#92400e'}}>
                      ⚠️ Advertencia
                    </p>
                    <p className="text-sm" style={{color: '#a16207'}}>
                      Al eliminar esta empresa se perderán:
                    </p>
                    <ul className="text-sm mt-2 list-disc list-inside" style={{color: '#a16207'}}>
                      <li>Todos los datos de la empresa</li>
                      <li>Configuraciones de permisos</li>
                      <li>Credenciales SOL asociadas</li>
                      <li>Historial de obligaciones</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <p className="text-sm" style={{color: '#6b7280'}}>
                Esta acción es <strong>permanente</strong> y no se puede deshacer.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4" style={{ borderRadius: '0 0 12px 12px'}}>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{backgroundColor: 'transparent', color: '#374151', border: 'none'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                style={{backgroundColor: '#dc2626', color: 'white', border: 'none'}}
                onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = '#dc2626')}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{borderColor: 'white', borderTopColor: 'transparent'}}></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Empresa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;