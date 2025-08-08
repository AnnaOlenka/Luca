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
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="bg-red-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
                  <p className="text-red-100">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-red-700 rounded-lg p-2 transition-colors"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿Estás seguro de que deseas eliminar esta empresa?
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Empresa a eliminar:</p>
                <p className="font-medium text-gray-900">{companyName}</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      ⚠️ Advertencia
                    </p>
                    <p className="text-sm text-yellow-700">
                      Al eliminar esta empresa se perderán:
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                      <li>Todos los datos de la empresa</li>
                      <li>Configuraciones de permisos</li>
                      <li>Credenciales SOL asociadas</li>
                      <li>Historial de obligaciones</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Esta acción es <strong>permanente</strong> y no se puede deshacer.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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