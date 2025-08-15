import React, { useState } from 'react';
import { X, Building, ExternalLink, Check, AlertTriangle, Info, Plus, Search } from 'lucide-react';

interface RelatedCompany {
  id: string;
  nombre: string;
  ruc: string;
  relacion: string;
  confidence: number;
  sector?: string;
  estado?: string;
  descripcion?: string;
  fechaConstitucion?: string;
  direccion?: string;
}

interface RelatedCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  relatedCompanies: RelatedCompany[];
  onAddSelected: (companies: RelatedCompany[]) => void;
  onAddAll: (companies: RelatedCompany[]) => void;
}

const RelatedCompaniesModal: React.FC<RelatedCompaniesModalProps> = ({
  isOpen,
  onClose,
  personName,
  relatedCompanies,
  onAddSelected,
  onAddAll
}) => {
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleCompany = (companyId: string) => {
    const newSelected = new Set(selectedCompanies);
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId);
    } else {
      newSelected.add(companyId);
    }
    setSelectedCompanies(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedCompanies.size === filteredCompanies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(filteredCompanies.map(c => c.id)));
    }
  };

  const handleAddSelected = () => {
    const selectedCompanyObjects = relatedCompanies.filter(c => selectedCompanies.has(c.id));
    onAddSelected(selectedCompanyObjects);
    onClose();
  };

  const handleAddAll = () => {
    onAddAll(relatedCompanies);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <Check className="w-3 h-3" />;
    if (confidence >= 70) return <AlertTriangle className="w-3 h-3" />;
    return <Info className="w-3 h-3" />;
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'suspendido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredCompanies = relatedCompanies.filter(company =>
    company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ruc.includes(searchTerm) ||
    company.relacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-black p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Empresas Relacionadas Detectadas</h2>
                <p className="text-blue-100 text-sm">
                  Vinculadas a <span className="font-semibold">{personName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada{filteredCompanies.length !== 1 ? 's' : ''}
              </span>
              {selectedCompanies.size > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {selectedCompanies.size} seleccionada{selectedCompanies.size !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search 
              className="text-gray-400 w-4 h-4"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, RUC o relación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* Companies List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          <div className="p-6 space-y-4">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                    selectedCompanies.has(company.id)
                      ? 'border-blue-300 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggleCompany(company.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedCompanies.has(company.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        {selectedCompanies.has(company.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {company.nombre}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-600">
                              RUC: <span className="font-mono">{company.ruc}</span>
                            </span>
                            {company.estado && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEstadoColor(company.estado)}`}>
                                {company.estado}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Confidence Badge */}
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getConfidenceColor(company.confidence)}`}>
                          {getConfidenceIcon(company.confidence)}
                          <span>{company.confidence}%</span>
                        </div>
                      </div>

                      {/* Relation and Details */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Relación:</span>
                          <span className="ml-2 font-medium text-gray-900">{company.relacion}</span>
                        </div>
                        {company.sector && (
                          <div>
                            <span className="text-gray-500">Sector:</span>
                            <span className="ml-2 text-gray-700">{company.sector}</span>
                          </div>
                        )}
                        {company.fechaConstitucion && (
                          <div>
                            <span className="text-gray-500">Constitución:</span>
                            <span className="ml-2 text-gray-700">{company.fechaConstitucion}</span>
                          </div>
                        )}
                        {company.direccion && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Dirección:</span>
                            <span className="ml-2 text-gray-700">{company.direccion}</span>
                          </div>
                        )}
                      </div>

                      {company.descripcion && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-md">
                          <p className="text-sm text-gray-700">{company.descripcion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron empresas que coincidan con la búsqueda</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedCompanies.size === filteredCompanies.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAll}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Todas</span>
              </button>
              {selectedCompanies.size > 0 && (
                <button
                  onClick={handleAddSelected}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Agregar Seleccionadas ({selectedCompanies.size})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatedCompaniesModal;