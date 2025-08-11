import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, User, Briefcase, FileText, Shield, Calculator, Users, CheckCircle, Award, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface EditCompanyModalProps {
  empresa: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmpresa: any) => void;
}

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ empresa, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('personas');
  const [formData, setFormData] = useState<any>({});
  const [expandedMarca, setExpandedMarca] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, marca: any}>({show: false, marca: null});
  const [marcasData, setMarcasData] = useState<any[]>([]);
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [personasData, setPersonasData] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<{show: boolean, message: string, tab: string}>({show: false, message: '', tab: ''});
  const [originalFormData, setOriginalFormData] = useState<any>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credentialsError, setCredentialsError] = useState<string>('');
  const [isValidatingCredentials, setIsValidatingCredentials] = useState<boolean>(false);
  const [credentialsStatus, setCredentialsStatus] = useState<'valid' | 'invalid' | 'checking' | 'idle'>('idle');
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
 const [validationErrors, setValidationErrors] = useState({});
 
  // Función para calcular el porcentaje de completitud
  const calculateCompletitud = (data: any, credStatus: string) => {
    let percentage = 0;
    
    // 1. Empresa creada (datos básicos) = 25%
    if (data.nombre && data.ruc) {
      percentage += 25;
    }
    
    // 2. Clave SOL válida = 25%
    if (credStatus === 'valid' || (!credentialsError && data.usuarioSol && data.claveSol)) {
      percentage += 25;
    }
    
    // 3. Datos completos del representante legal = 25%
    if (data.representanteNombres && data.representanteDni && data.representanteEmail && data.representanteTelefono) {
      percentage += 25;
    }
    
    // 4. Datos completos del administrador = 25%
    if (data.adminNombre && data.adminDni && data.adminEmail && data.adminTelefono) {
      percentage += 25;
    }
    
    return percentage;
  };

  // Función para actualizar las personas asignadas basadas en formData
  const updatePersonasData = (data: any) => {
    setPersonasData([
      {
        id: '1',
        rol: 'Representante Legal',
        nombre: data.representanteNombres || '',
        dni: data.representanteDni || '',
        email: data.representanteEmail || '',
        telefono: data.representanteTelefono || ''
      },
      {
        id: '2',
        rol: 'Administrador',
        nombre: data.adminNombre || '',
        dni: data.adminDni || '',
        email: data.adminEmail || '',
        telefono: data.adminTelefono || ''
      },
      {
        id: '3',
        rol: 'Contador',
        nombre: data.contadorNombre || '',
        dni: data.contadorDni || '',
        email: data.contadorEmail || '',
        telefono: data.contadorTelefono || ''
      }
    ]);
  };

  useEffect(() => {
    if (empresa && isOpen) {
      const initialData = { 
        ...empresa,
        usuarioSol: empresa.usuarioSol || 'ROCAFUER01',
        claveSol: empresa.claveSol || 'password123',
        // Inicializar teléfonos si no existen
        representanteTelefono: empresa.representanteTelefono || '',
        adminTelefono: empresa.adminTelefono || '',
        contadorTelefono: empresa.contadorTelefono || ''
      };
      
      // Calcular completitud inicial
      const initialCompletitud = calculateCompletitud(initialData, 'idle');
      const dataWithCompletitud = { ...initialData, completitud: initialCompletitud };
      
      setFormData(dataWithCompletitud);
      setOriginalFormData(JSON.parse(JSON.stringify(dataWithCompletitud))); // Deep copy
      setActiveTab('personas');
      setSuccessMessage({show: false, message: '', tab: ''});
      
      // Verificar si las credenciales son inválidas desde el inicio
      const hasInvalidCredentials = empresa.credentialsStatus === 'invalid' || 
        (empresa.usuarioSol && empresa.claveSol && !empresa.credentialsValid);
      
      console.log('🚀 Inicializando modal para empresa:', empresa.nombre);
      console.log('🔑 Estado credenciales empresa:', {
        credentialsStatus: empresa.credentialsStatus,
        credentialsValid: empresa.credentialsValid,
        usuarioSol: empresa.usuarioSol,
        claveSol: empresa.claveSol,
        hasInvalidCredentials
      });
      
      if (hasInvalidCredentials) {
        console.log('🔴 Estableciendo credenciales como inválidas');
        setCredentialsError('Credenciales inválidas, urgente: actualice sus credenciales');
        setCredentialsStatus('invalid');
      } else {
        console.log('🟢 Credenciales están OK, limpiando estado');
        setCredentialsError('');
        setCredentialsStatus('idle');
      }
      
      // Simular datos de marcas registradas
      setMarcasData([
        {
          id: '1',
          nombreMarca: 'CONSTRUCTORA DELTA',
          numeroRegistro: '00123456',
          fechaInscripcion: '15/03/2020',
          vigencia: '15/03/2030',
          titularRegistrado: empresa.nombre || 'CONSTRUCTORA DELTA S.A.',
          tipoInterno: 'Comercial',
          estadoRegistro: 'Activo'
        },
        {
          id: '2',
          nombreMarca: 'DELTA BUILD',
          numeroRegistro: '00234567',
          fechaInscripcion: '22/08/2021',
          vigencia: '22/08/2031',
          titularRegistrado: empresa.nombre || 'CONSTRUCTORA DELTA S.A.',
          tipoInterno: 'Servicio',
          estadoRegistro: 'Activo'
        },
        {
          id: '3',
          nombreMarca: 'DELTA HOMES',
          numeroRegistro: '00345678',
          fechaInscripcion: '10/12/2019',
          vigencia: '10/12/2029',
          titularRegistrado: empresa.nombre || 'CONSTRUCTORA DELTA S.A.',
          tipoInterno: 'Comercial',
          estadoRegistro: 'Por Renovar'
        }
      ]);
      
      // Sincronizar datos de personas y roles con formData
      updatePersonasData(dataWithCompletitud);
    }
  }, [empresa, isOpen]);

  if (!isOpen || !empresa) return null;

  const tabs = [
    { id: 'personas', label: 'Personas & Roles', icon: User },
    { id: 'comercial', label: 'Información Comercial', icon: Briefcase },
    { id: 'credenciales', label: 'Credenciales SUNAT', icon: FileText },
    { id: 'marcas', label: 'Marcas Registradas', icon: Award }
  ];

  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    
    // Campos que afectan la completitud
    const completitudFields = [
      'representanteNombres', 'representanteDni', 'representanteEmail', 'representanteTelefono',
      'adminNombre', 'adminDni', 'adminEmail', 'adminTelefono'
    ];
    
    // Si el campo afecta la completitud, recalcular automáticamente
    if (completitudFields.includes(field)) {
      const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
      newFormData.completitud = newCompletitud;
      
      // También actualizar personas asignadas para mantener sincronización
      updatePersonasData(newFormData);
    }
    
    setFormData(newFormData);
  };

  const handleSave = async () => {
    // Verificar si hay cambios
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    
    if (!hasChanges) {
      return; // No hacer nada si no hay cambios
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Calcular nuevo porcentaje de completitud (permitir campos vacíos)
    const newCompletitud = calculateCompletitud(formData, credentialsStatus);
    
    // IMPORTANTE: Cuando es el tab de credenciales, incluir el estado actual de validación
    let updatedFormData;
    if (activeTab === 'credenciales') {
      updatedFormData = { 
        ...formData, 
        completitud: newCompletitud,
        credentialsStatus: credentialsStatus,
        credentialsValid: credentialsStatus === 'valid'
      };
    } else {
      updatedFormData = { ...formData, completitud: newCompletitud };
    }
    setFormData(updatedFormData);
    
    // Actualizar personas asignadas
    updatePersonasData(updatedFormData);
    
    // Mostrar mensaje de éxito (siempre mostrar si hay cambios, incluso si son vacíos)
    const successMsg = activeTab === 'credenciales' ? 'Credenciales actualizadas correctamente' : 'Se han guardado los cambios correctamente';
    setSuccessMessage({show: true, message: successMsg, tab: activeTab});
    
    // Actualizar el estado original con los nuevos datos
    setOriginalFormData(JSON.parse(JSON.stringify(updatedFormData)));
    
    // Si es el tab de credenciales, AHORA SI guardar permanentemente los cambios
    if (activeTab === 'credenciales') {
      console.log('💾 Guardando credenciales en empresa padre:', {
        credentialsStatus: updatedFormData.credentialsStatus,
        credentialsValid: updatedFormData.credentialsValid,
        usuarioSol: updatedFormData.usuarioSol,
        claveSol: updatedFormData.claveSol
      });
      onSave(updatedFormData);
    }
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setSuccessMessage({show: false, message: '', tab: ''});
    }, 3000);
  };
  
  // Función para guardar al cerrar el modal si hay cambios pendientes
  const handleModalClose = () => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    if (hasChanges) {
      // Guardar cambios automáticamente al cerrar
      const newCompletitud = calculateCompletitud(formData, credentialsStatus);
      const updatedFormData = { ...formData, completitud: newCompletitud };
      onSave(updatedFormData);
    }
    onClose();
  };
  
  const validateCredentials = async () => {
    if (!formData.usuarioSol || !formData.claveSol) {
      setCredentialsError('Usuario y clave SOL son requeridos');
      return;
    }
    
    setIsValidatingCredentials(true);
    setCredentialsError('');
    
    try {
      // Simular validación con la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular algunos casos de fallo
      const failingUsers = ['USUARIOMAL', 'INVALID01', 'EXPIRED99'];
      if (failingUsers.includes(formData.usuarioSol.toUpperCase()) || formData.claveSol === 'wrongpass') {
        setCredentialsError('Credenciales inválidas, urgente: actualice sus credenciales');
        setCredentialsStatus('invalid');
        
        // Persistir el estado inválido en la empresa (SOLO para validación manual del botón)
        const updatedFormData = { ...formData, credentialsStatus: 'invalid', credentialsValid: false };
        setFormData(updatedFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(updatedFormData)));
      } else {
        setCredentialsError('');
        setCredentialsStatus('valid');
        
        // Persistir el estado válido en la empresa
        const newCompletitud = calculateCompletitud(formData, 'valid');
        const updatedFormData = { ...formData, completitud: newCompletitud, credentialsStatus: 'valid', credentialsValid: true };
        setFormData(updatedFormData);
        
        // Actualizar personas asignadas
        updatePersonasData(updatedFormData);
        
        // IMPORTANTE: Solo actualizar el estado original cuando es una validación manual (botón)
        // Para validación en tiempo real, solo actualizar formData, no persistir automáticamente
        setOriginalFormData(JSON.parse(JSON.stringify(updatedFormData)));
        
        setSuccessMessage({show: true, message: 'Credenciales validadas correctamente', tab: 'credenciales'});
        setTimeout(() => {
          setSuccessMessage({show: false, message: '', tab: ''});
        }, 3000);
      }
    } catch (error) {
      setCredentialsError('Error al validar credenciales');
      setCredentialsStatus('invalid');
      
      // Persistir estado de error (SOLO para validación manual del botón)
      const updatedFormData = { ...formData, credentialsStatus: 'invalid', credentialsValid: false };
      setFormData(updatedFormData);
      setOriginalFormData(JSON.parse(JSON.stringify(updatedFormData)));
    } finally {
      setIsValidatingCredentials(false);
    }
  };
  
  const validateCredentialsRealTime = async (usuario: string, clave: string) => {
    console.log('🔍 validateCredentialsRealTime llamada con:', { usuario, clave });
    
    if (!usuario || !clave) {
      console.log('❌ Falta usuario o clave, limpiando estado');
      setCredentialsStatus('idle');
      setCredentialsError('');
      return;
    }
    
    console.log('⏳ Iniciando validación en tiempo real...');
    setCredentialsStatus('checking');
    setCredentialsError('');
    
    try {
      // Simular validación en tiempo real (más rápida)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simular algunos casos de fallo
      const failingUsers = ['USUARIOMAL', 'INVALID01', 'EXPIRED99'];
      const isInvalid = failingUsers.includes(usuario.toUpperCase()) || clave === 'wrongpass';
      
      console.log('🧪 Validación result:', { 
        usuario: usuario.toUpperCase(), 
        clave, 
        failingUsers, 
        isInvalid 
      });
      
      if (isInvalid) {
        console.log('❌ Credenciales inválidas');
        setCredentialsError('Credenciales inválidas, urgente: actualice sus credenciales');
        setCredentialsStatus('invalid');
      } else {
        console.log('✅ Credenciales VÁLIDAS - limpiando error');
        setCredentialsError('');
        setCredentialsStatus('valid');
      }
    } catch (error) {
      console.log('💥 Error en validación:', error);
      setCredentialsError('Error al validar credenciales');
      setCredentialsStatus('invalid');
    }
  };
  
  const handleCredentialChange = (field: 'usuarioSol' | 'claveSol', value: string) => {
    console.log('📝 handleCredentialChange:', { field, value });
    console.log('📋 formData antes:', { usuarioSol: formData.usuarioSol, claveSol: formData.claveSol });
    
    handleInputChange(field, value);
    
    // Cancelar timeout anterior
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    
    // Configurar nuevo timeout para validación automática
    const newTimeout = setTimeout(() => {
      // ARREGLO: Usar el valor actualizado del campo que cambió, no el formData anterior
      const usuario = field === 'usuarioSol' ? value : formData.usuarioSol;
      const clave = field === 'claveSol' ? value : formData.claveSol;
      
      console.log('⚡ Timeout ejecutado, valores finales:', { usuario, clave });
      
      // Validación inmediata si tenemos usuario y clave
      if (usuario && clave) {
        validateCredentialsRealTime(usuario, clave);
      } else {
        console.log('⚠️ Faltan campos, limpiando estado');
        // Si falta algún campo, limpiar el estado
        setCredentialsStatus('idle');
        setCredentialsError('');
      }
    }, 500); // Validar después de 0.5 segundos sin escribir
    
    setValidationTimeout(newTimeout);
  };
  
  const handlePersonaSave = (personaId: string) => {
    // Actualizar los datos de personas en formData
    const persona = personasData.find(p => p.id === personaId);
    if (persona) {
      let updatedFormData = { ...formData };
      
      if (persona.rol === 'Representante Legal') {
        updatedFormData = {
          ...updatedFormData,
          representanteNombres: persona.nombre,
          representanteDni: persona.dni,
          representanteEmail: persona.email,
          representanteTelefono: persona.telefono
        };
      } else if (persona.rol === 'Administrador') {
        updatedFormData = {
          ...updatedFormData,
          adminNombre: persona.nombre,
          adminDni: persona.dni,
          adminEmail: persona.email,
          adminTelefono: persona.telefono
        };
      } else if (persona.rol === 'Contador') {
        updatedFormData = {
          ...updatedFormData,
          contadorNombre: persona.nombre,
          contadorDni: persona.dni,
          contadorEmail: persona.email,
          contadorTelefono: persona.telefono
        };
      }
      
      // Recalcular completitud con los datos actualizados
      const newCompletitud = calculateCompletitud(updatedFormData, credentialsStatus);
      updatedFormData = { ...updatedFormData, completitud: newCompletitud };
      
      setFormData(updatedFormData);
      
      // Actualizar personas asignadas
      updatePersonasData(updatedFormData);
    }
    
    setSuccessMessage({show: true, message: 'Se han guardado los cambios correctamente', tab: 'personas'});
    setExpandedPersona(null);
    setTimeout(() => {
      setSuccessMessage({show: false, message: '', tab: ''});
    }, 3000);
  };
  
  const handleMarcaSave = (marcaId: string) => {
    setSuccessMessage({show: true, message: 'Se han guardado los cambios correctamente', tab: 'marcas'});
    setExpandedMarca(null);
    setTimeout(() => {
      setSuccessMessage({show: false, message: '', tab: ''});
    }, 3000);
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
          <div className="h-full flex flex-col">
            <div className="border border-blue-200 rounded-lg p-1 mb-4">
              <h3 className="text-lg font-medium text-blue-900 mb-1 flex items-center">
                <Users className="w-5 h-4 mr-2 text-blue-600" />
                Personas y Roles Asignados
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="bg-white border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-center font-medium text-gray-700">Rol</th>
                      <th className="p-3 text-center font-medium text-gray-700">Nombre</th>
                      <th className="p-3 text-center font-medium text-gray-700">DNI</th>
                      <th className="p-3 text-center font-medium text-gray-700">Email</th>
                      <th className="p-3 text-center font-medium text-gray-700">Teléfono</th>
                      <th className="p-3 text-center font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personasData.map((persona) => (
                      <React.Fragment key={persona.id}>
                        <tr className="border-t hover:bg-gray-50">
                          <td className="p-3">
                            <span className={`px-1.7 py-0.7 text-xs font-medium ${
                              persona.rol === 'Representante Legal' ? 'bg-red-100 text-red-800' :
                              persona.rol === 'Administrador' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {persona.rol}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-gray-900">
                            {persona.nombre || <span className="text-gray-400 italic">Falta dato</span>}
                          </td>
                          <td className="p-3 font-mono text-gray-600">
                            {persona.dni || <span className="text-gray-400 italic">Falta dato</span>}
                          </td>
                          <td className="p-3 text-gray-600">
                            {persona.email || <span className="text-gray-400 italic">Falta dato</span>}
                          </td>
                          <td className="p-3 text-gray-600">
                            {persona.telefono || <span className="text-gray-400 italic">Falta dato</span>}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => setExpandedPersona(expandedPersona === persona.id ? null : persona.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center space-x-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Editar</span>
                                {expandedPersona === persona.id ? 
                                  <ChevronUp className="w-3 h-3" /> : 
                                  <ChevronDown className="w-3 h-3" />
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Panel expandible de edición */}
                        {expandedPersona === persona.id && (
                          <tr className="border-t bg-blue-50">
                            <td colSpan={6} className="p-4">
                              <div className="bg-white border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 mb-3">Editar {persona.rol}: {persona.nombre}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                      type="text"
                                      value={persona.nombre}
                                      onChange={(e) => {
                                        const updatedPersonas = personasData.map(p => 
                                          p.id === persona.id ? {...p, nombre: e.target.value} : p
                                        );
                                        setPersonasData(updatedPersonas);
                                        // También actualizar en formData para persistir
                                        let newFormData = { ...formData };
                                        if (persona.rol === 'Representante Legal') {
                                          newFormData.representanteNombres = e.target.value;
                                        } else if (persona.rol === 'Administrador') {
                                          newFormData.adminNombre = e.target.value;
                                        } else if (persona.rol === 'Contador') {
                                          newFormData.contadorNombre = e.target.value;
                                        }
                                        
                                        // Actualizar completitud en tiempo real
                                        const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                        newFormData.completitud = newCompletitud;
                                        setFormData(newFormData);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                      placeholder="Nombre completo"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">DNI</label>
                                    <input
                                      type="text"
                                      value={persona.dni}
                                      onChange={(e) => {
                                        const updatedPersonas = personasData.map(p => 
                                          p.id === persona.id ? {...p, dni: e.target.value} : p
                                        );
                                        setPersonasData(updatedPersonas);
                                        // También actualizar en formData
                                        let newFormData = { ...formData };
                                        if (persona.rol === 'Representante Legal') {
                                          newFormData.representanteDni = e.target.value;
                                        } else if (persona.rol === 'Administrador') {
                                          newFormData.adminDni = e.target.value;
                                        } else if (persona.rol === 'Contador') {
                                          newFormData.contadorDni = e.target.value;
                                        }
                                        
                                        // Actualizar completitud en tiempo real
                                        const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                        newFormData.completitud = newCompletitud;
                                        setFormData(newFormData);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                      placeholder="12345678"
                                      maxLength={8}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                      type="email"
                                      value={persona.email}
                                      onChange={(e) => {
                                        const updatedPersonas = personasData.map(p => 
                                          p.id === persona.id ? {...p, email: e.target.value} : p
                                        );
                                        setPersonasData(updatedPersonas);
                                        // También actualizar en formData
                                        let newFormData = { ...formData };
                                        if (persona.rol === 'Representante Legal') {
                                          newFormData.representanteEmail = e.target.value;
                                        } else if (persona.rol === 'Administrador') {
                                          newFormData.adminEmail = e.target.value;
                                        } else if (persona.rol === 'Contador') {
                                          newFormData.contadorEmail = e.target.value;
                                        }
                                        
                                        // Actualizar completitud en tiempo real
                                        const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                        newFormData.completitud = newCompletitud;
                                        setFormData(newFormData);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                      placeholder="email@empresa.com"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                      type="tel"
                                      value={persona.telefono}
                                      onChange={(e) => {
                                        const updatedPersonas = personasData.map(p => 
                                          p.id === persona.id ? {...p, telefono: e.target.value} : p
                                        );
                                        setPersonasData(updatedPersonas);
                                        
                                        // También actualizar en formData para teléfono
                                        let newFormData = { ...formData };
                                        if (persona.rol === 'Representante Legal') {
                                          newFormData.representanteTelefono = e.target.value;
                                        } else if (persona.rol === 'Administrador') {
                                          newFormData.adminTelefono = e.target.value;
                                        } else if (persona.rol === 'Contador') {
                                          newFormData.contadorTelefono = e.target.value;
                                        }
                                        
                                        // Actualizar completitud en tiempo real
                                        const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                        newFormData.completitud = newCompletitud;
                                        setFormData(newFormData);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                      placeholder="987654321"
                                      maxLength={9}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                                    <input
                                      type="text"
                                      value={persona.rol}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                                      readOnly
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                  <button
                                    onClick={() => setExpandedPersona(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => handlePersonaSave(persona.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center space-x-1"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>Guardar Cambios</span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                
                {personasData.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay personas asignadas a roles en esta empresa</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mensaje de éxito */}
            {successMessage.show && successMessage.tab === 'personas' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">{successMessage.message}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'comercial':
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Columna Izquierda */}
            <div className="space-y-3">
              <div className="bg-blue-50 border border-gray-200 rounded-lg p-3">
                <h3 className="text-left text-sm font-medium text-gray-900 mb-3">Datos Operacionales</h3>
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
              <div className="bg-blue-50 border border-emerald-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-emerald-900 mb-3 flex items-center">
                  Configuración Financiera
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

              <div className="bg-blue-50 border border-purple-200 rounded-lg p-3">
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
              <div className="bg-blue-50 border border-orange-200 rounded-lg p-3">
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
            
            {/* Mensaje de éxito */}
            {successMessage.show && successMessage.tab === 'comercial' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">{successMessage.message}</span>
                </div>
              </div>
            )}
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
                      onChange={(e) => handleCredentialChange('usuarioSol', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 ${
                        credentialsStatus === 'valid' ? 'border-green-500 focus:ring-green-500' :
                        credentialsStatus === 'invalid' ? 'border-red-500 focus:ring-red-500' :
                        'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {credentialsStatus === 'checking' && (
                      <div className="flex items-center px-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {credentialsStatus === 'valid' && (
                      <div className="flex items-center px-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    {credentialsStatus === 'invalid' && (
                      <div className="flex items-center px-2">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={validateCredentials}
                      disabled={isValidatingCredentials}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {isValidatingCredentials ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>🔄</span>
                      )}
                      <span>{isValidatingCredentials ? 'Validando...' : 'Validar'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clave SOL</label>
                  <div className="flex space-x-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.claveSol || ''}
                      onChange={(e) => handleCredentialChange('claveSol', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 ${
                        credentialsStatus === 'valid' ? 'border-green-500 focus:ring-green-500' :
                        credentialsStatus === 'invalid' ? 'border-red-500 focus:ring-red-500' :
                        'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm flex items-center"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mensaje de error de credenciales */}
              {credentialsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">{credentialsError}</span>
                  </div>
                </div>
              )}
              
              {/* Estado de validación */}
              {!credentialsError && (
                <div className="bg-white border border-green-300 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Estado: Validada</span>
                    </div>
                    <div className="text-sm text-gray-600">Expira: 15/09/2025</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mensaje de éxito */}
            {successMessage.show && successMessage.tab === 'credenciales' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">{successMessage.message}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'marcas':
        return (
          <div className="h-full flex flex-col">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-4">
              <h3 className="text-lg font-medium text-orange-900 mb-1 flex items-center">
                <Award className="w-5 h-5 mr-2 text-orange-600" />
                Marcas Registradas en INDECOPI
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="bg-white border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-center font-medium text-gray-700">Nombre Marca</th>
                      <th className="p-3 text-center font-medium text-gray-700">Tipo</th>
                      <th className="p-3 text-center font-medium text-gray-700">N° Registro</th>
                      <th className="p-3 text-center font-medium text-gray-700">Vigencia</th>
                      <th className="p-3 text-center font-medium text-gray-700">Estado</th>
                      <th className="p-3 text-center font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marcasData.map((marca) => (
                      <React.Fragment key={marca.id}>
                        <tr className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">{marca.nombreMarca}</td>
                          <td className="p-3 text-gray-600">{marca.tipoInterno}</td>
                          <td className="p-3 font-mono text-gray-600">{marca.numeroRegistro}</td>
                          <td className="p-3 text-gray-600">{marca.vigencia}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              marca.estadoRegistro === 'Activo' ? 'bg-green-100 text-green-800' :
                              marca.estadoRegistro === 'Por Renovar' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {marca.estadoRegistro}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setExpandedMarca(expandedMarca === marca.id ? null : marca.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center space-x-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Editar</span>
                                {expandedMarca === marca.id ? 
                                  <ChevronUp className="w-3 h-3" /> : 
                                  <ChevronDown className="w-3 h-3" />
                                }
                              </button>
                              <button
                                onClick={() => setShowDeleteModal({show: true, marca})}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Panel expandible de edición */}
                        {expandedMarca === marca.id && (
                          <tr className="border-t bg-blue-50">
                            <td colSpan={6} className="p-4">
                              <div className="bg-white border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 mb-3">Editar Marca: {marca.nombreMarca}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Marca</label>
                                    <input
                                      type="text"
                                      value={marca.nombreMarca}
                                      onChange={(e) => {
                                        const updatedMarcas = marcasData.map(m => 
                                          m.id === marca.id ? {...m, nombreMarca: e.target.value} : m
                                        );
                                        setMarcasData(updatedMarcas);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Interno</label>
                                    <select
                                      value={marca.tipoInterno}
                                      onChange={(e) => {
                                        const updatedMarcas = marcasData.map(m => 
                                          m.id === marca.id ? {...m, tipoInterno: e.target.value} : m
                                        );
                                        setMarcasData(updatedMarcas);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                    >
                                      <option value="Comercial">Comercial</option>
                                      <option value="Servicio">Servicio</option>
                                      <option value="Industrial">Industrial</option>
                                      <option value="Mixta">Mixta</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">N° Registro INDECOPI</label>
                                    <input
                                      type="text"
                                      value={marca.numeroRegistro}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Inscripción</label>
                                    <input
                                      type="text"
                                      value={marca.fechaInscripcion}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Vigencia</label>
                                    <input
                                      type="text"
                                      value={marca.vigencia}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Estado Registro</label>
                                    <input
                                      type="text"
                                      value={marca.estadoRegistro}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                                      readOnly
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Titular Registrado</label>
                                    <input
                                      type="text"
                                      value={marca.titularRegistrado}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                                      readOnly
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                  <button
                                    onClick={() => setExpandedMarca(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => handleMarcaSave(marca.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center space-x-1"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>Guardar Cambios</span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                
                {marcasData.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay marcas registradas asociadas a esta empresa</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal de confirmación de eliminación */}
            {showDeleteModal.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 mx-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Eliminar Marca</h3>
                      <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    ¿Seguro que deseas eliminar la marca <strong>'{showDeleteModal.marca?.nombreMarca}'</strong>?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDeleteModal({show: false, marca: null})}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const updatedMarcas = marcasData.filter(m => m.id !== showDeleteModal.marca?.id);
                        setMarcasData(updatedMarcas);
                        setShowDeleteModal({show: false, marca: null});
                        alert('Marca eliminada correctamente');
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mensaje de éxito */}
            {successMessage.show && successMessage.tab === 'marcas' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">{successMessage.message}</span>
                </div>
              </div>
            )}
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
            <button 
              onClick={() => {
                if (successMessage.show) return; // No cerrar si está mostrando mensaje
                handleModalClose();
              }} 
              className="p-2 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              disabled={successMessage.show}
            >
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
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center relative ${
                    isActive 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {/* Símbolo de alerta para credenciales inválidas */}
                  {tab.id === 'credenciales' && credentialsStatus === 'invalid' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  )}
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
          <button 
            onClick={() => {
              if (successMessage.show) return;
              handleModalClose();
            }} 
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm disabled:opacity-50"
            disabled={successMessage.show}
          >
            Cerrar
          </button>
          {/* Solo mostrar botón Guardar en tabs que no tienen guardado individual */}
          {(activeTab === 'comercial' || activeTab === 'credenciales') && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>{activeTab === 'credenciales' ? 'Actualizar Credenciales' : 'Guardar Cambios'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCompanyModal;