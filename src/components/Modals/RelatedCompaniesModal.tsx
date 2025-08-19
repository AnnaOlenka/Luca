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
    if (confidence >= 90) return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' };
    if (confidence >= 70) return { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
    return { backgroundColor: '#fecaca', color: '#991b1b', borderColor: '#fca5a5' };
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <Check className="w-3 h-3" />;
    if (confidence >= 70) return <AlertTriangle className="w-3 h-3" />;
    return <Info className="w-3 h-3" />;
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'inactivo': return { backgroundColor: '#f3f4f6', color: '#374151' };
      case 'suspendido': return { backgroundColor: '#fecaca', color: '#991b1b' };
      default: return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const filteredCompanies = relatedCompanies.filter(company =>
    company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ruc.includes(searchTerm) ||
    company.relacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
      <div style={{ width: '100%', maxWidth: '56rem', maxHeight: '90vh', height: '37.5rem', minHeight: '37.5rem', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: 'black', padding: '1.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Search style={{ width: '1.5rem', height: '1.5rem' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 ,color: '#ffffffff'}}>Empresas Relacionadas Detectadas</h2>
                <p style={{ color: '#bfdbfe', fontSize: '0.875rem', margin: 0 }}>
                  Vinculadas a <span style={{ fontWeight: 600 }}>{personName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ color: 'white', padding: '0.5rem', borderRadius: '0.5rem', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada{filteredCompanies.length !== 1 ? 's' : ''}
              </span>
              {selectedCompanies.size > 0 && (
                <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 500 }}>
                  {selectedCompanies.size} seleccionada{selectedCompanies.size !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search 
              style={{ color: '#9ca3af', width: '1rem', height: '1rem', position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, RUC o relación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Companies List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  style={{
                    border: `1px solid ${selectedCompanies.has(company.id) ? '#93c5fd' : '#e5e7eb'}`,
                    backgroundColor: selectedCompanies.has(company.id) ? '#eff6ff' : 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: selectedCompanies.has(company.id) ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                  onClick={() => handleToggleCompany(company.id)}
                  onMouseEnter={(e) => {
                    if (!selectedCompanies.has(company.id)) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedCompanies.has(company.id)) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {/* Checkbox */}
                    <div style={{ flexShrink: 0, marginTop: '0.25rem' }}>
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '2px',
                        border: `2px solid ${selectedCompanies.has(company.id) ? '#2563eb' : '#d1d5db'}`,
                        backgroundColor: selectedCompanies.has(company.id) ? '#2563eb' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}>
                        {selectedCompanies.has(company.id) && (
                          <Check style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                        )}
                      </div>
                    </div>

                    {/* Company Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {company.nombre}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              RUC: <span style={{ fontFamily: 'monospace' }}>{company.ruc}</span>
                            </span>
                            {company.estado && (
                              <span style={{ ...getEstadoColor(company.estado), fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 500 }}>
                                {company.estado}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Confidence Badge */}
                        <div style={{ ...getConfidenceColor(company.confidence), display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', border: '1px solid', fontSize: '0.75rem', fontWeight: 500 }}>
                          {getConfidenceIcon(company.confidence)}
                          <span>{company.confidence}%</span>
                        </div>
                      </div>

                      {/* Relation and Details */}
                      <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <div>
                          <span style={{ color: '#6b7280' }}>Relación:</span>
                          <span style={{ marginLeft: '0.5rem', fontWeight: 500, color: '#111827' }}>{company.relacion}</span>
                        </div>
                        {company.sector && (
                          <div>
                            <span style={{ color: '#6b7280' }}>Sector:</span>
                            <span style={{ marginLeft: '0.5rem', color: '#374151' }}>{company.sector}</span>
                          </div>
                        )}
                        {company.fechaConstitucion && (
                          <div>
                            <span style={{ color: '#6b7280' }}>Constitución:</span>
                            <span style={{ marginLeft: '0.5rem', color: '#374151' }}>{company.fechaConstitucion}</span>
                          </div>
                        )}
                        {company.direccion && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ color: '#6b7280' }}>Dirección:</span>
                            <span style={{ marginLeft: '0.5rem', color: '#374151' }}>{company.direccion}</span>
                          </div>
                        )}
                      </div>

                      {company.descripcion && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                          <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>{company.descripcion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <Building style={{ width: '3rem', height: '3rem', color: '#d1d5db', margin: '0 auto 1rem' }} />
                <p style={{ color: '#6b7280', margin: 0 }}>No se encontraron empresas que coincidan con la búsqueda</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#f9fafb', padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleToggleAll}
                style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.color = '#2563eb'}
              >
                {selectedCompanies.size === filteredCompanies.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onClose}
                style={{ padding: '0.5rem 1rem', color: '#374151', backgroundColor: '#e5e7eb', borderRadius: '0.5rem', fontWeight: 500, transition: 'background-color 0.2s', border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAll}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#059669', color: 'white', borderRadius: '0.5rem', fontWeight: 500, transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                <span>Agregar Todas</span>
              </button>
              {selectedCompanies.size > 0 && (
                <button
                  onClick={handleAddSelected}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', fontWeight: 500, transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  <Check style={{ width: '1rem', height: '1rem' }} />
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