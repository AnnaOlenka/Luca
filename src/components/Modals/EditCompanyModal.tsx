import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, User, Briefcase, FileText, Shield, Calculator, Users, CheckCircle } from 'lucide-react';

interface EditCompanyModalProps {
  empresa: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmpresa: any) => void;
}

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ empresa, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('personas');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (empresa && isOpen) {
      setFormData({ 
        ...empresa,
        usuarioSol: empresa.usuarioSol || 'ROCAFUER01',
        claveSol: empresa.claveSol || 'password123'
      });
      setActiveTab('personas');
    }
  }, [empresa, isOpen]);

  if (!isOpen || !empresa) return null;

  const tabs = [
    { id: 'personas', label: 'Personas & Roles', icon: User },
    { id: 'comercial', label: 'Información Comercial', icon: Briefcase },
    { id: 'credenciales', label: 'Credenciales SUNAT', icon: FileText }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(formData);
    onClose();
  };

  const closeOtherSections = (openSection: string) => {
    setFormData({
      ...formData,
      expandedRepresentante: openSection === 'representante' ? !formData.expandedRepresentante : false,
      expandedAdministrador: openSection === 'administrador' ? !formData.expandedAdministrador : false,
      expandedContadores: openSection === 'contadores' ? !formData.expandedContadores : false,
      expandedCredenciales: openSection === 'credenciales' ? !formData.expandedCredenciales : false
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personas':
        return (
          <div className="space-y-4">
            {/* Representante Legal */}
            <div className="border border-red-200 rounded-lg">
              <button
                type="button"
                onClick={() => closeOtherSections('representante')}
                className="w-full bg-red-50 hover:bg-red-100 px-4 py-3 flex items-center justify-between text-left rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="text-lg font-medium text-red-900">Representante Legal</h3>
                    <p className="text-sm text-red-700">Obligatorio - {formData.representanteNombres || 'Sin configurar'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">Obligatorio</span>
                  <svg className={`w-5 h-5 text-red-600 transform transition-transform ${formData.expandedRepresentante ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {formData.expandedRepresentante && (
                <div className="p-4 border-t border-red-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={formData.representanteNombres || ''}
                        onChange={(e) => handleInputChange('representanteNombres', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Juan Carlos Pérez García"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                      <input
                        type="text"
                        value={formData.representanteDni || ''}
                        onChange={(e) => handleInputChange('representanteDni', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="12345678"
                        maxLength={8}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.representanteEmail || ''}
                        onChange={(e) => handleInputChange('representanteEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="representante@empresa.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Administrador */}
            <div className="border border-orange-200 rounded-lg">
              <button
                type="button"
                onClick={() => closeOtherSections('administrador')}
                className="w-full bg-orange-50 hover:bg-orange-100 px-4 py-3 flex items-center justify-between text-left rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="text-lg font-medium text-orange-900">Administrador</h3>
                    <p className="text-sm text-orange-700">Obligatorio - {formData.adminNombre || 'Sin configurar'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">Obligatorio</span>
                  <svg className={`w-5 h-5 text-orange-600 transform transition-transform ${formData.expandedAdministrador ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {formData.expandedAdministrador && (
                <div className="p-4 border-t border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={formData.adminNombre || ''}
                        onChange={(e) => handleInputChange('adminNombre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="María Elena Rodríguez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                      <input
                        type="text"
                        value={formData.adminDni || ''}
                        onChange={(e) => handleInputChange('adminDni', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="87654321"
                        maxLength={8}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.adminEmail || ''}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="admin@empresa.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contadores */}
            <div className="border border-blue-200 rounded-lg">
              <button
                type="button"
                onClick={() => closeOtherSections('contadores')}
                className="w-full bg-blue-50 hover:bg-blue-100 px-4 py-3 flex items-center justify-between text-left rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-medium text-blue-900">Contadores</h3>
                    <p className="text-sm text-blue-700">Opcional - 1 contador asignado</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">Opcional</span>
                  <svg className={`w-5 h-5 text-blue-600 transform transition-transform ${formData.expandedContadores ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {formData.expandedContadores && (
                <div className="p-4 border-t border-blue-200">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Contador Principal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          value="Luis Alberto Mendoza Torres"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CIP</label>
                        <input
                          type="text"
                          value="CIP12345"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value="contador@empresa.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Credenciales SUNAT */}
            <div className="border border-green-200 rounded-lg">
              <button
                type="button"
                onClick={() => closeOtherSections('credenciales')}
                className="w-full bg-green-50 hover:bg-green-100 px-4 py-3 flex items-center justify-between text-left rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="text-lg font-medium text-green-900">Credenciales SUNAT</h3>
                    <p className="text-sm text-green-700">Usuario: {formData.usuarioSol} - Estado: Validado</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">✅ Validado</span>
                  <svg className={`w-5 h-5 text-green-600 transform transition-transform ${formData.expandedCredenciales ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {formData.expandedCredenciales && (
                <div className="p-4 border-t border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Usuario SOL</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.usuarioSol || ''}
                          onChange={(e) => handleInputChange('usuarioSol', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          🔄 Validar
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clave SOL</label>
                      <div className="flex space-x-2">
                        <input
                          type="password"
                          value={formData.claveSol || ''}
                          onChange={(e) => handleInputChange('claveSol', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm">
                          👁️
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-green-300 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Estado: Validada</span>
                      </div>
                      <div className="text-sm text-gray-600">Expira: 15/09/2025</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'comercial':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Operacionales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facturación Anual</label>
                  <input
                    type="text"
                    value={formData.facturacionAnual || ''}
                    onChange={(e) => handleInputChange('facturacionAnual', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1,500,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={formData.moneda || 'PEN'}
                    onChange={(e) => handleInputChange('moneda', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PEN">PEN - Soles</option>
                    <option value="USD">USD - Dólares</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° Trabajadores</label>
                  <input
                    type="number"
                    value={formData.numTrabajadores || ''}
                    onChange={(e) => handleInputChange('numTrabajadores', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trabajadores</label>
                  <select
                    value={formData.tipoTrabajadores || ''}
                    onChange={(e) => handleInputChange('tipoTrabajadores', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="PLANILLA">Planilla</option>
                    <option value="RECIBOS">Recibos por Honorarios</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vol. Mensual Transacciones</label>
                  <input
                    type="text"
                    value={formData.volumenMensual || ''}
                    onChange={(e) => handleInputChange('volumenMensual', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="150"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estacionalidad</label>
                <input
                  type="text"
                  value={formData.estacionalidad || ''}
                  onChange={(e) => handleInputChange('estacionalidad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Mayor actividad en diciembre y enero"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Segmentación Clientes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Principal</label>
                  <select
                    value={formData.tipoPrincipal || ''}
                    onChange={(e) => handleInputChange('tipoPrincipal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="B2B">B2B - Empresas</option>
                    <option value="B2C">B2C - Consumidores</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input
                    type="text"
                    value={formData.sector || ''}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Construcción, Retail, Tecnología"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Canales de Venta</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.canalPresencial || false}
                      onChange={(e) => handleInputChange('canalPresencial', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">☐ Presencial</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.canalOnline || false}
                      onChange={(e) => handleInputChange('canalOnline', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">☐ Online</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.canalMarketplace || false}
                      onChange={(e) => handleInputChange('canalMarketplace', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">☐ Marketplace</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-purple-900 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                Configuración Contable
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Contable</label>
                  <select
                    value={formData.planContable || ''}
                    onChange={(e) => handleInputChange('planContable', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar plan</option>
                    <option value="PCGE">PCGE - Plan Contable General Empresarial</option>
                    <option value="PERSONALIZADO">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda Funcional</label>
                  <select
                    value={formData.monedaFuncional || 'PEN'}
                    onChange={(e) => handleInputChange('monedaFuncional', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PEN">PEN - Soles</option>
                    <option value="USD">USD - Dólares</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período Fiscal</label>
                  <select
                    value={formData.periodoFiscal || ''}
                    onChange={(e) => handleInputChange('periodoFiscal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar período</option>
                    <option value="ENERO_DICIEMBRE">Enero - Diciembre</option>
                    <option value="JULIO_JUNIO">Julio - Junio</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3 mt-6">
                  <input
                    type="checkbox"
                    id="librosElectronicos"
                    checked={formData.librosElectronicos || false}
                    onChange={(e) => handleInputChange('librosElectronicos', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="librosElectronicos" className="text-sm font-medium text-gray-700">
                    ✅ Libros Electrónicos Habilitados
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Editar Empresa</h2>
                <p className="text-blue-100">{empresa.nombre}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-0">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${isActive ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyModal;