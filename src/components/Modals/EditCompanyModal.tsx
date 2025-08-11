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
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Columna Izquierda */}
            <div className="space-y-3">
              {/* Representante Legal */}
              <div className="border border-red-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => closeOtherSections('representante')}
                  className="w-full bg-red-50 hover:bg-red-100 px-3 py-2 flex items-center justify-between text-left rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-red-600" />
                    <div>
                      <h3 className="text-sm font-medium text-red-900">Representante Legal</h3>
                      <p className="text-xs text-red-700">{formData.representanteNombres || 'Sin configurar'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs">Obligatorio</span>
                  </div>
                </button>
                
                {formData.expandedRepresentante && (
                  <div className="p-3 border-t border-red-200">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={formData.representanteNombres || ''}
                          onChange={(e) => handleInputChange('representanteNombres', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="Juan Carlos Pérez García"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">DNI</label>
                          <input
                            type="text"
                            value={formData.representanteDni || ''}
                            onChange={(e) => handleInputChange('representanteDni', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="12345678"
                            maxLength={8}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.representanteEmail || ''}
                            onChange={(e) => handleInputChange('representanteEmail', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="rep@empresa.com"
                          />
                        </div>
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
                  className="w-full bg-orange-50 hover:bg-orange-100 px-3 py-2 flex items-center justify-between text-left rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <div>
                      <h3 className="text-sm font-medium text-orange-900">Administrador</h3>
                      <p className="text-xs text-orange-700">{formData.adminNombre || 'Sin configurar'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs">Obligatorio</span>
                  </div>
                </button>
                
                {formData.expandedAdministrador && (
                  <div className="p-3 border-t border-orange-200">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={formData.adminNombre || ''}
                          onChange={(e) => handleInputChange('adminNombre', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="María Elena Rodríguez"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">DNI</label>
                          <input
                            type="text"
                            value={formData.adminDni || ''}
                            onChange={(e) => handleInputChange('adminDni', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="87654321"
                            maxLength={8}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.adminEmail || ''}
                            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="admin@empresa.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-3">
              {/* Contadores */}
              <div className="border border-blue-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => closeOtherSections('contadores')}
                  className="w-full bg-blue-50 hover:bg-blue-100 px-3 py-2 flex items-center justify-between text-left rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Contadores</h3>
                      <p className="text-xs text-blue-700">1 contador asignado</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">Opcional</span>
                  </div>
                </button>
                
                {formData.expandedContadores && (
                  <div className="p-3 border-t border-blue-200">
                    <div className="bg-white border border-gray-200 rounded p-2">
                      <h4 className="text-xs font-medium text-gray-900 mb-2">Contador Principal</h4>
                      <div className="space-y-1">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Nombre</label>
                          <input
                            type="text"
                            value={formData.contadorNombre || 'Luis Alberto Mendoza Torres'}
                            onChange={(e) => handleInputChange('contadorNombre', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                            placeholder="Nombre del contador"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">DNI</label>
                            <input
                              type="text"
                              value={formData.contadorDni || '12345678'}
                              onChange={(e) => handleInputChange('contadorDni', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                              placeholder="DNI del contador"
                              maxLength={8}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              value={formData.contadorEmail || 'contador@empresa.com'}
                              onChange={(e) => handleInputChange('contadorEmail', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                              placeholder="email@contador.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'comercial':
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Columna Izquierda */}
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Datos Operacionales</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Facturación Anual</label>
                      <input
                        type="text"
                        value={formData.facturacionAnual || ''}
                        onChange={(e) => handleInputChange('facturacionAnual', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        placeholder="1,500,000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Moneda</label>
                      <select
                        value={formData.moneda || 'PEN'}
                        onChange={(e) => handleInputChange('moneda', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="PEN">PEN - Soles</option>
                        <option value="USD">USD - Dólares</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">N° Trabajadores</label>
                    <input
                      type="number"
                      value={formData.numTrabajadores || ''}
                      onChange={(e) => handleInputChange('numTrabajadores', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="25"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Trabajadores</label>
                      <select
                        value={formData.tipoTrabajadores || ''}
                        onChange={(e) => handleInputChange('tipoTrabajadores', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="PLANILLA">Planilla</option>
                        <option value="RECIBOS">Recibos por Honorarios</option>
                        <option value="MIXTO">Mixto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Vol. Mensual</label>
                      <input
                        type="text"
                        value={formData.volumenMensual || ''}
                        onChange={(e) => handleInputChange('volumenMensual', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        placeholder="150"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estacionalidad</label>
                    <input
                      type="text"
                      value={formData.estacionalidad || ''}
                      onChange={(e) => handleInputChange('estacionalidad', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Mayor actividad en diciembre"
                    />
                  </div>
                </div>
              </div>

              {/* Nueva Sección: Configuración Financiera */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-emerald-900 mb-3 flex items-center">
                  💰 Configuración Financiera
                </h3>
                <div className="space-y-2">
                  {/* Ingresos */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Meta Mensual Ingresos</label>
                    <input
                      type="text"
                      value={formData.metaIngresosMensual || ''}
                      onChange={(e) => handleInputChange('metaIngresosMensual', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                      placeholder="85,000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Mes Mayor Ingreso</label>
                      <select
                        value={formData.mesMayorIngreso || ''}
                        onChange={(e) => handleInputChange('mesMayorIngreso', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="ENERO">Enero</option>
                        <option value="FEBRERO">Febrero</option>
                        <option value="MARZO">Marzo</option>
                        <option value="ABRIL">Abril</option>
                        <option value="MAYO">Mayo</option>
                        <option value="JUNIO">Junio</option>
                        <option value="JULIO">Julio</option>
                        <option value="AGOSTO">Agosto</option>
                        <option value="SEPTIEMBRE">Septiembre</option>
                        <option value="OCTUBRE">Octubre</option>
                        <option value="NOVIEMBRE">Noviembre</option>
                        <option value="DICIEMBRE">Diciembre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Mes Menor Ingreso</label>
                      <select
                        value={formData.mesMenorIngreso || ''}
                        onChange={(e) => handleInputChange('mesMenorIngreso', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="ENERO">Enero</option>
                        <option value="FEBRERO">Febrero</option>
                        <option value="MARZO">Marzo</option>
                        <option value="ABRIL">Abril</option>
                        <option value="MAYO">Mayo</option>
                        <option value="JUNIO">Junio</option>
                        <option value="JULIO">Julio</option>
                        <option value="AGOSTO">Agosto</option>
                        <option value="SEPTIEMBRE">Septiembre</option>
                        <option value="OCTUBRE">Octubre</option>
                        <option value="NOVIEMBRE">Noviembre</option>
                        <option value="DICIEMBRE">Diciembre</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Egresos */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Promedio Mensual Egresos</label>
                    <input
                      type="text"
                      value={formData.promedioEgresosMensual || ''}
                      onChange={(e) => handleInputChange('promedioEgresosMensual', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                      placeholder="35,000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-1 text-blue-600" />
                  Segmentación Clientes
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Principal</label>
                      <select
                        value={formData.tipoPrincipal || ''}
                        onChange={(e) => handleInputChange('tipoPrincipal', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="B2B">B2B - Empresas</option>
                        <option value="B2C">B2C - Consumidores</option>
                        <option value="MIXTO">Mixto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sector</label>
                      <input
                        type="text"
                        value={formData.sector || ''}
                        onChange={(e) => handleInputChange('sector', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        placeholder="Construcción"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Canales de Venta</label>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={formData.canalPresencial || false}
                          onChange={(e) => handleInputChange('canalPresencial', e.target.checked)}
                          className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Presencial</span>
                      </label>
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={formData.canalOnline || false}
                          onChange={(e) => handleInputChange('canalOnline', e.target.checked)}
                          className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Online</span>
                      </label>
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={formData.canalMarketplace || false}
                          onChange={(e) => handleInputChange('canalMarketplace', e.target.checked)}
                          className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Marketplace</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-1 text-purple-600" />
                  Config. Contable
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Plan Contable</label>
                    <select
                      value={formData.planContable || ''}
                      onChange={(e) => handleInputChange('planContable', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar plan</option>
                      <option value="PCGE">PCGE</option>
                      <option value="PERSONALIZADO">Personalizado</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Moneda Funcional</label>
                      <select
                        value={formData.monedaFuncional || 'PEN'}
                        onChange={(e) => handleInputChange('monedaFuncional', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="PEN">PEN</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Período Fiscal</label>
                      <select
                        value={formData.periodoFiscal || ''}
                        onChange={(e) => handleInputChange('periodoFiscal', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="ENERO_DICIEMBRE">Ene - Dic</option>
                        <option value="JULIO_JUNIO">Jul - Jun</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="librosElectronicos"
                      checked={formData.librosElectronicos || false}
                      onChange={(e) => handleInputChange('librosElectronicos', e.target.checked)}
                      className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="librosElectronicos" className="text-xs font-medium text-gray-700">
                      Libros Electrónicos Habilitados
                    </label>
                  </div>
                </div>
              </div>

              {/* Nueva Sección: Configuración Tributaria */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-orange-900 mb-3 flex items-center">
                  🏛️ Config. Tributaria
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">% Gastos Personal</label>
                      <input
                        type="number"
                        value={formData.porcentajeGastosPersonal || ''}
                        onChange={(e) => handleInputChange('porcentajeGastosPersonal', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
                        placeholder="40"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">% Gastos Operativos</label>
                      <input
                        type="number"
                        value={formData.porcentajeGastosOperativos || ''}
                        onChange={(e) => handleInputChange('porcentajeGastosOperativos', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
                        placeholder="35"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Régimen Tributario</label>
                    <select
                      value={formData.regimenTributario || ''}
                      onChange={(e) => handleInputChange('regimenTributario', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Seleccionar régimen</option>
                      <option value="GENERAL">Régimen General</option>
                      <option value="MYPE">Régimen MYPE Tributario</option>
                      <option value="RUS">Régimen Único Simplificado</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">% Renta Anual Estimado</label>
                      <input
                        type="number"
                        value={formData.porcentajeRentaAnual || ''}
                        onChange={(e) => handleInputChange('porcentajeRentaAnual', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
                        placeholder="29.5"
                        step="0.1"
                        min="0"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Frecuencia Pagos</label>
                      <select
                        value={formData.frecuenciaPagosRenta || ''}
                        onChange={(e) => handleInputChange('frecuenciaPagosRenta', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="MENSUAL">Mensual</option>
                        <option value="ANUAL">Anual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'credenciales':
        return (
          <div className="grid grid-cols-1 gap-4 h-full">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-4">Gestión de Credenciales SUNAT</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuario SOL</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clave SOL</label>
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">Editar Empresa</h2>
                <p className="text-blue-100 text-sm">{empresa.nombre}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 p-4">
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center ${
                    isActive 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 rounded-b-lg flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>{activeTab === 'credenciales' ? 'Actualizar Credenciales' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyModal;