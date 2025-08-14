import React, { useState, useEffect,useRef } from 'react';
import { X, Edit3, Save, User, Briefcase, FileText, Shield, Calculator, Users, CheckCircle, Award, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import AutoDiscoveryNotification from '../Notifications/AutoDiscoveryNotification';
import RelatedCompaniesModal from './RelatedCompaniesModal';
import { discoverRelatedCompanies, shouldTriggerDiscovery, type RelatedCompany } from '../../utils/companyDiscovery';

interface EditCompanyModalProps {
  empresa: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmpresa: any) => void;
  onProgressUpdate?: (empresaId: string, completitud: number) => void;
}

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ empresa, isOpen, onClose, onSave, onProgressUpdate }) => {
  const [activeTab, setActiveTab] = useState('personas');
  const [formData, setFormData] = useState<any>({});
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [personasData, setPersonasData] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<{show: boolean, message: string, tab: string}>({show: false, message: '', tab: ''});
  const [originalFormData, setOriginalFormData] = useState<any>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credentialsError, setCredentialsError] = useState<string>('');
  const [credentialsStatus, setCredentialsStatus] = useState<'valid' | 'invalid' | 'checking' | 'idle'>('idle');
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
 const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
 const currentCredentials = useRef({ usuarioSol: '', claveSol: '' });

  // Estados para auto-descubrimiento
  const [showAutoDiscovery, setShowAutoDiscovery] = useState(false);
  const [relatedCompanies, setRelatedCompanies] = useState<RelatedCompany[]>([]);
  const [discoveredPersonName, setDiscoveredPersonName] = useState('');


  // Funciones de validación
  const validateEmail = (email: string): string => {
    if (!email) return '';
    
    // Verificar que no sean solo símbolos
    if (/^[^a-zA-Z0-9@._+-]+$/.test(email)) {
      return 'Email no debe contener solo símbolos';
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? '' : 'Formato de email inválido';
  };

  const validateDni = (dni: string): string => {
    if (!dni) return '';
    
    // Verificar que no sean solo símbolos
    if (/^[^a-zA-Z0-9]+$/.test(dni)) {
      return 'DNI no debe contener solo símbolos';
    }
    
    // Verificar si tiene letras
    if (/[a-zA-Z]/.test(dni)) {
      return 'DNI solo debe tener números';
    }
    
    // Verificar si tiene exactamente 8 dígitos
    if (dni.length !== 8 || !/^\d{8}$/.test(dni)) {
      return 'DNI debe tener exactamente 8 dígitos';
    }
    
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return '';
    
    // Verificar que no sean solo símbolos
    if (/^[^a-zA-Z0-9]+$/.test(phone)) {
      return 'Teléfono no debe contener solo símbolos';
    }
    
    // Verificar que contenga solo números
    if (!/^\d+$/.test(phone)) {
      return 'Teléfono debe contener solo números';
    }
    
    // Verificar que tenga exactamente 9 dígitos
    if (phone.length !== 9) {
      return 'Teléfono debe tener exactamente 9 dígitos';
    }
    
    return '';
  };

  const validateName = (name: string): string => {
    if (!name) return '';
    
    // Verificar que no sean solo números
    if (/^\d+$/.test(name)) {
      return 'Nombre no debe ser números';
    }
    
    // Verificar que no sean solo símbolos (que no contengan letras ni números)
    if (/^[^\w\s]+$/.test(name)) {
      return 'Nombre no debe contener solo símbolos';
    }
    
    // Verificar que contenga solo letras y espacios
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Nombre debe contener solo letras';
    }
    
    // Verificar que tenga más de una letra
    if (name.trim().length <= 1) {
      return 'Nombre debe tener más de una letra';
    }
    
    return '';
  };

  const validateNumericField = (value: string, fieldName: string): string => {
    if (!value) return '';
    
    // Verificar que no sean solo símbolos
    if (/^[^a-zA-Z0-9.]+$/.test(value)) {
      return `${fieldName} no debe contener solo símbolos`;
    }
    
    const numericRegex = /^\d*\.?\d*$/;
    if (!numericRegex.test(value)) {
      return `${fieldName} debe ser un número válido`;
    }
    const numValue = parseFloat(value);
    if (numValue < 0) {
      return `${fieldName} no puede ser negativo`;
    }
    return '';
  };

  const validateTextOnlyField = (value: string, fieldName: string): string => {
    if (!value) return '';
    
    // Verificar que no contenga solo números
    if (/^\d+$/.test(value)) {
      return `${fieldName} debe contener letras, no números.`;
    }
    
    // Verificar que no sean solo símbolos (que no contengan letras ni números)
    if (/^[^\w\s]+$/.test(value)) {
      return `${fieldName} no debe contener solo símbolos`;
    }
    
    // Verificar que contenga solo letras y espacios
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return `${fieldName} debe contener solo letras`;
    }
    
    return '';
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'representanteEmail':
      case 'adminEmail':
      case 'contadorEmail':
        return validateEmail(value);
      case 'representanteDni':
      case 'adminDni':
      case 'contadorDni':
        return validateDni(value);
      case 'representanteTelefono':
      case 'adminTelefono':
      case 'contadorTelefono':
        return validatePhone(value);
      case 'representanteNombres':
      case 'adminNombre':
      case 'contadorNombre':
        return validateName(value);
      case 'facturacionAnual':
        return validateNumericField(value, 'Facturación anual');
      case 'numTrabajadores':
        return validateNumericField(value, 'Número de trabajadores');
      case 'volumenMensual':
        return validateNumericField(value, 'Volumen mensual');
      case 'metaIngresosMensual':
        return validateNumericField(value, 'Meta mensual de ingresos');
      case 'promedioEgresosMensual':
        return validateNumericField(value, 'Promedio mensual de egresos');
      case 'porcentajeGastosPersonal':
      case 'porcentajeGastosOperativos':
      case 'porcentajeRentaAnual':
        const percentError = validateNumericField(value, 'Porcentaje');
        if (percentError) return percentError;
        const numValue = parseFloat(value);
        if (numValue > 100) return 'Porcentaje no puede ser mayor a 100';
        return '';
      case 'sector':
        return validateTextOnlyField(value, 'Sector');
      default:
        return '';
    }
  };
 
  // Función para calcular el porcentaje de completitud
  const calculateCompletitud = (data: any, credStatus: string) => {
    let percentage = 0;
    
    // 1. Empresa creada (datos básicos) = 25%
    if (data.nombre && data.ruc) {
      percentage += 25;
    }
    
    // 2. Clave SOL válida = 25%
    if (credStatus === 'valid') {
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

  const calculateCompletitudRealTime = (data: any, credStatus: string, validationErrors: {[key: string]: string} = {}) => {
  // Esta función calcula pero NO modifica el estado
  let percentage = 0;
  
  // 1. Empresa creada (datos básicos) = 25%
  if (data.nombre && data.ruc) {
    percentage += 25;
  }
  
  // 2. Clave SOL válida = 25%
  if (credStatus === 'valid') {
    percentage += 25;
  }
  
  // 3. Datos completos del representante legal = 25%
  // Verificar que todos los campos estén presentes Y sin errores de validación
  const representanteFields = ['representanteNombres', 'representanteDni', 'representanteEmail', 'representanteTelefono'];
  const representanteComplete = representanteFields.every(field => 
    data[field] && !validationErrors[field]
  );
  if (representanteComplete) {
    percentage += 25;
  }
  
  // 4. Datos completos del administrador = 25%
  // Verificar que todos los campos estén presentes Y sin errores de validación
  const adminFields = ['adminNombre', 'adminDni', 'adminEmail', 'adminTelefono'];
  const adminComplete = adminFields.every(field => 
    data[field] && !validationErrors[field]
  );
  if (adminComplete) {
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
      // Agregar datos de muestra para Juan Carlos Pérez y inicializar teléfonos
      representanteNombres: empresa.representanteNombres || 'Juan Carlos Pérez',
      representanteDni: empresa.representanteDni || '12345678',
      representanteEmail: empresa.representanteEmail || 'juan.perez@email.com',
      representanteTelefono: empresa.representanteTelefono || '999123456',
      adminTelefono: empresa.adminTelefono || '',
      contadorTelefono: empresa.contadorTelefono || ''
    };

    // Inicializar el ref con los valores actuales
    currentCredentials.current = {
      usuarioSol: initialData.usuarioSol,
      claveSol: initialData.claveSol
    };
      
    // Obtener el estado de credenciales persistido
    const persistedCredStatus = empresa.credentialsStatus || 'idle';
    
    // Usar completitud existente o calcular una inicial
    const initialCompletitud = empresa.completitud !== undefined 
      ? empresa.completitud 
      : calculateCompletitud(initialData, persistedCredStatus);
    
    const dataWithCompletitud = { 
      ...initialData, 
      completitud: initialCompletitud,
      credentialsStatus: persistedCredStatus,
      credentialsValid: persistedCredStatus === 'valid'
    };
    
    setFormData(dataWithCompletitud);
    setOriginalFormData(JSON.parse(JSON.stringify(dataWithCompletitud)));
    setActiveTab('personas');
    setSuccessMessage({show: false, message: '', tab: ''});
    
    console.log('🚀 Inicializando modal para empresa:', empresa.nombre);
    console.log('🔑 Estado credenciales empresa:', {
      credentialsStatus: empresa.credentialsStatus,
      credentialsValid: empresa.credentialsValid,
      usuarioSol: empresa.usuarioSol,
      claveSol: empresa.claveSol,
      persistedCredStatus
    });
    
    // Establecer el estado de credenciales basado en el estado persistido
    if (persistedCredStatus === 'invalid') {
      console.log('🔴 Estableciendo credenciales como inválidas (persistido)');
      setCredentialsError('Credenciales inválidas, urgente: actualice sus credenciales');
      setCredentialsStatus('invalid');
    } else if (persistedCredStatus === 'valid') {
      console.log('🟢 Estableciendo credenciales como válidas (persistido)');
      setCredentialsError('');
      setCredentialsStatus('valid');
    } else {
      console.log('⚪ Credenciales en estado idle');
      setCredentialsError('');
      setCredentialsStatus('idle');
    }
    
    
    // Sincronizar datos de personas y roles con formData
    updatePersonasData(dataWithCompletitud);
  }
}, [empresa, isOpen]);

useEffect(() => {
  // Calcular completitud en tiempo real para mostrar en la UI
  // pero sin modificar formData hasta que se guarde
  const currentCompletitud = calculateCompletitudRealTime(formData, credentialsStatus, validationErrors);
  
  // Solo actualizar la visualización si estamos en el modal
  if (isOpen) {
    // Actualizar solo para mostrar, no para persistir
    console.log('📊 Completitud calculada en tiempo real:', currentCompletitud);
    
    // Actualizar la barra de progreso en tiempo real en la tabla principal
    if (onProgressUpdate && empresa?.id) {
      onProgressUpdate(empresa.id, currentCompletitud);
    }
  }
}, [formData, credentialsStatus, validationErrors, isOpen, onProgressUpdate, empresa?.id]);

  
  useEffect(() => {
    // Validar credenciales automáticamente cuando se abre el tab de credenciales
    if (activeTab === 'credenciales' && isOpen && formData.usuarioSol && formData.claveSol) {
      console.log('🔄 Validando automáticamente al entrar al tab de credenciales');
      
      // Actualizar el ref con los valores actuales
      currentCredentials.current = {
        usuarioSol: formData.usuarioSol,
        claveSol: formData.claveSol
      };
      
      // Validar automáticamente después de un pequeño delay
      setTimeout(() => {
        validateCredentialsRealTime(formData.usuarioSol, formData.claveSol);
      }, 100);
    }
  }, [activeTab, isOpen]); // Ejecutar cuando cambie el tab activo

  if (!isOpen || !empresa) return null;


  const tabs = [
    { id: 'credenciales', label: 'Credenciales SUNAT', icon: FileText },
    { id: 'personas', label: 'Contacto', icon: User },
    { id: 'comercial', label: 'Información Comercial', icon: Briefcase }
  ];

  const handleInputChange = (field: string, value: any) => {
    // Validar el campo
    const error = validateField(field, value);
    const newValidationErrors = { ...validationErrors };
    
    if (error) {
      newValidationErrors[field] = error;
    } else {
      delete newValidationErrors[field];
    }
    
    setValidationErrors(newValidationErrors);
    
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

  // 1. MODIFICAR la función validateCredentialsRealTime
// Reemplaza toda la función con esta versión:

// 2. MODIFICAR la función handleSave para incluir completitud SOLO al guardar
// Reemplaza la función con esta versión:

const handleSave = async () => {
  // Verificar si hay cambios
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
  
  if (!hasChanges) {
    return; // No hacer nada si no hay cambios
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Calcular nuevo porcentaje de completitud SOLO al guardar
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
  
  // Actualizar personas asignadas solo si no es tab de credenciales
  if (activeTab !== 'credenciales') {
    updatePersonasData(updatedFormData);
  }
  
  // Mostrar mensaje de éxito
  const successMsg = activeTab === 'credenciales' ? 'Credenciales actualizadas correctamente' : 'Se han guardado los cambios correctamente';
  setSuccessMessage({show: true, message: successMsg, tab: activeTab});
  
  // Actualizar el estado original con los nuevos datos
  setOriginalFormData(JSON.parse(JSON.stringify(updatedFormData)));
  
  // Si es el tab de credenciales, guardar permanentemente los cambios
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
  
  // Crear datos actualizados con el estado actual de credenciales
  let updatedFormData = { ...formData };
  
  // Si hay cambios O si el estado de credenciales ha cambiado, guardar
  const credentialsChanged = (
    originalFormData.credentialsStatus !== credentialsStatus ||
    originalFormData.usuarioSol !== formData.usuarioSol ||
    originalFormData.claveSol !== formData.claveSol
  );
  
  if (hasChanges || credentialsChanged) {
    console.log('💾 Guardando cambios al cerrar modal:', {
      hasChanges,
      credentialsChanged,
      currentCredentialsStatus: credentialsStatus
    });
    
    // Calcular completitud y agregar estado de credenciales
    const newCompletitud = calculateCompletitud(formData, credentialsStatus);
    updatedFormData = { 
      ...updatedFormData, 
      completitud: newCompletitud,
      credentialsStatus: credentialsStatus,
      credentialsValid: credentialsStatus === 'valid'
    };
    
    onSave(updatedFormData);
  }
  
  onClose();
};

const handleTabChange = (newTab: string) => {
  // Si estamos saliendo del tab de credenciales, limpiar timeout si existe
  if (activeTab === 'credenciales' && newTab !== 'credenciales') {
    console.log('🔄 Saliendo del tab de credenciales, limpiando timeout');
    if (validationTimeout) {
      clearTimeout(validationTimeout);
      setValidationTimeout(null);
    }
  }
  
  setActiveTab(newTab);
};
  
const validateCredentialsRealTime = async (usuario: string, clave: string) => {
  console.log('🔍 validateCredentialsRealTime llamada con:', { usuario, clave });
  
  if (!usuario || !clave) {
    console.log('❌ Falta usuario o clave, manteniendo estado anterior o poniendo idle');
    // Si no hay credenciales, mantener idle (no cambiar si ya tenía un estado)
    if (credentialsStatus !== 'idle') {
      setCredentialsStatus('idle');
      setCredentialsError('');
    }
    return;
  }
  
  console.log('⏳ Iniciando validación en tiempo real...');
  setCredentialsStatus('checking');
  setCredentialsError('');
  
  try {
    // Simular validación en tiempo real (más rápida)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Solo estos usuarios/claves son inválidos
    const isInvalidUser = usuario.toUpperCase() === 'USUARIOMAL';
    const isInvalidPassword = clave === 'CLAVEMAL';
    const isInvalid = isInvalidUser || isInvalidPassword;
    
    console.log('🧪 Validación result:', { 
      usuario: usuario.toUpperCase(), 
      clave, 
      isInvalidUser,
      isInvalidPassword,
      isInvalid,
      previousStatus: credentialsStatus
    });
    
    if (isInvalid) {
      console.log('❌ Credenciales inválidas - marcando como inválidas');
      setCredentialsError('Credenciales inválidas, urgente: actualice sus credenciales');
      setCredentialsStatus('invalid');
    } else {
      console.log('✅ Credenciales VÁLIDAS - marcando como válidas');
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
  
  // Actualizar el ref inmediatamente
  currentCredentials.current = {
    ...currentCredentials.current,
    [field]: value
  };
  
  handleInputChange(field, value);
  
  // Cancelar timeout anterior
  if (validationTimeout) {
    clearTimeout(validationTimeout);
  }
  
  // Configurar nuevo timeout para validación automática
  const newTimeout = setTimeout(() => {
    // Usar los valores del ref que se mantienen actualizados
    const usuario = currentCredentials.current.usuarioSol;
    const clave = currentCredentials.current.claveSol;
    
    console.log('⚡ Timeout ejecutado, valores del ref:', { usuario, clave });
    
    // Validación inmediata si tenemos usuario y clave
    if (usuario && clave) {
      validateCredentialsRealTime(usuario, clave);
    } else {
      console.log('⚠️ Faltan campos, limpiando estado');
      setCredentialsStatus('idle');
      setCredentialsError('');
    }
  }, 800); // También puedes aumentar a 800ms o 1000ms si quieres más tiempo
  
  setValidationTimeout(newTimeout);
};
  
  const handlePersonaSave = async (personaId: string) => {
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

      // Verificar si el representante/administrador/contador puede tener empresas relacionadas
      if (persona.nombre && shouldTriggerDiscovery(persona.nombre)) {
        await triggerAutoDiscovery(persona.nombre);
      }
    }
    
    setSuccessMessage({show: true, message: 'Se han guardado los cambios correctamente', tab: 'personas'});
    setExpandedPersona(null);
    setTimeout(() => {
      setSuccessMessage({show: false, message: '', tab: ''});
    }, 3000);
  };

  // Funciones para auto-descubrimiento
  const triggerAutoDiscovery = async (personName: string) => {
    try {
      const companies = await discoverRelatedCompanies(personName);
      
      if (companies.length > 0) {
        setRelatedCompanies(companies);
        setDiscoveredPersonName(personName);
        setShowAutoDiscovery(true);
      }
    } catch (error) {
      console.error('Error en auto-descubrimiento:', error);
    }
  };

  const handleViewRelatedCompaniesDetails = () => {
    console.log('🔍 Ver Detalles clicked, datos:', {
      companies: relatedCompanies,
      personName: discoveredPersonName,
      empresa: empresa?.nombre
    });
    
    // Cerrar AutoDiscovery y EditCompanyModal
    setShowAutoDiscovery(false);
    onClose();
    
    // Emitir evento para mostrar RelatedCompaniesModal en Empresas.tsx
    setTimeout(() => {
      console.log('📡 Emitiendo evento showRelatedCompaniesModal');
      window.dispatchEvent(new CustomEvent('showRelatedCompaniesModal', { 
        detail: { 
          companies: relatedCompanies,
          personName: discoveredPersonName,
          empresa: empresa
        } 
      }));
    }, 200);
  };


  const handleAddRelatedCompanies = (companies: RelatedCompany[]) => {
    // Agregar las empresas relacionadas como nuevas empresas en el listado
    const newCompanies = companies.map((company, index) => ({
      id: company.id,
      nombre: company.nombre,
      ruc: company.ruc,
      estado: "Activo", // Estado por defecto
      condicion: "Habido", // Condición por defecto
      completitud: 20, // Completitud básica
      logo: null,
      usuarioSol: "",
      claveSol: "",
      credentialsStatus: "idle" as const,
      credentialsValid: false,
      // Agregar información del representante que desencadenó el descubrimiento
      discoveredBy: discoveredPersonName,
      discoveredFrom: empresa.nombre,
      // Agregar propiedades adicionales requeridas por Empresas.tsx
      personas: [
        { 
          id: 1, 
          nombre: discoveredPersonName, 
          iniciales: discoveredPersonName.split(' ').map(n => n[0]).join('').toUpperCase(), 
          cargo: "Representante Legal", 
          estado: "activo" as const 
        }
      ],
      tendencia: { 
        porcentaje: 0, 
        direccion: "up" as const, 
        datos: [20, 20, 20, 20, 20, 20]
      },
      semaforoTributario: { 
        estado: "green" as const,
        texto: "Empresa nueva"
      },
      proximaObligacion: { 
        tipo: "IGV", 
        mes: "Próximo mes", 
        diasRestantes: 30, 
        vencido: false
      }
    }));

    // Emitir evento personalizado para notificar a empresas.tsx
    window.dispatchEvent(new CustomEvent('addDiscoveredCompanies', { 
      detail: newCompanies 
    }));

    // Mostrar mensaje de confirmación
    const companiesText = newCompanies.length === 1 ? 'empresa vinculada' : 'empresas vinculadas';
    setSuccessMessage({
      show: true, 
      message: `Se ha${newCompanies.length === 1 ? '' : 'n'} añadido ${newCompanies.length} ${companiesText}`, 
      tab: 'personas'
    });

    // Cerrar modal de AutoDiscovery
    setShowAutoDiscovery(false);

    // Auto-ocultar mensaje después de 4 segundos
    setTimeout(() => {
      setSuccessMessage({show: false, message: '', tab: ''});
    }, 4000);
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
                                    <div>
                                      <input
                                        type="text"
                                        value={persona.nombre}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const updatedPersonas = personasData.map(p => 
                                            p.id === persona.id ? {...p, nombre: value} : p
                                          );
                                          setPersonasData(updatedPersonas);
                                          
                                          // También actualizar en formData y validar
                                          let newFormData = { ...formData };
                                          let fieldName = '';
                                          if (persona.rol === 'Representante Legal') {
                                            fieldName = 'representanteNombres';
                                            newFormData.representanteNombres = value;
                                          } else if (persona.rol === 'Administrador') {
                                            fieldName = 'adminNombre';
                                            newFormData.adminNombre = value;
                                          } else if (persona.rol === 'Contador') {
                                            fieldName = 'contadorNombre';
                                            newFormData.contadorNombre = value;
                                          }
                                          
                                          // Validar el campo
                                          const error = validateField(fieldName, value);
                                          const newValidationErrors = { ...validationErrors };
                                          
                                          if (error) {
                                            newValidationErrors[fieldName] = error;
                                          } else {
                                            delete newValidationErrors[fieldName];
                                          }
                                          
                                          setValidationErrors(newValidationErrors);
                                          
                                          // Actualizar completitud en tiempo real
                                          const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                          newFormData.completitud = newCompletitud;
                                          setFormData(newFormData);
                                        }}
                                        className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                                          validationErrors[
                                            persona.rol === 'Representante Legal' ? 'representanteNombres' :
                                            persona.rol === 'Administrador' ? 'adminNombre' : 'contadorNombre'
                                          ] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Nombre completo"
                                      />
                                      {validationErrors[
                                        persona.rol === 'Representante Legal' ? 'representanteNombres' :
                                        persona.rol === 'Administrador' ? 'adminNombre' : 'contadorNombre'
                                      ] && (
                                        <p className="text-xs text-red-600 mt-1">
                                          {validationErrors[
                                            persona.rol === 'Representante Legal' ? 'representanteNombres' :
                                            persona.rol === 'Administrador' ? 'adminNombre' : 'contadorNombre'
                                          ]}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">DNI</label>
                                    <div>
                                      <input
                                        type="text"
                                        value={persona.dni}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const updatedPersonas = personasData.map(p => 
                                            p.id === persona.id ? {...p, dni: value} : p
                                          );
                                          setPersonasData(updatedPersonas);
                                          
                                          // También actualizar en formData y validar
                                          let newFormData = { ...formData };
                                          let fieldName = '';
                                          if (persona.rol === 'Representante Legal') {
                                            fieldName = 'representanteDni';
                                            newFormData.representanteDni = value;
                                          } else if (persona.rol === 'Administrador') {
                                            fieldName = 'adminDni';
                                            newFormData.adminDni = value;
                                          } else if (persona.rol === 'Contador') {
                                            fieldName = 'contadorDni';
                                            newFormData.contadorDni = value;
                                          }
                                          
                                          // Validar el campo
                                          const error = validateField(fieldName, value);
                                          const newValidationErrors = { ...validationErrors };
                                          
                                          if (error) {
                                            newValidationErrors[fieldName] = error;
                                          } else {
                                            delete newValidationErrors[fieldName];
                                          }
                                          
                                          setValidationErrors(newValidationErrors);
                                          
                                          // Actualizar completitud en tiempo real
                                          const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                          newFormData.completitud = newCompletitud;
                                          setFormData(newFormData);
                                        }}
                                        className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                                          validationErrors[
                                            persona.rol === 'Representante Legal' ? 'representanteDni' :
                                            persona.rol === 'Administrador' ? 'adminDni' : 'contadorDni'
                                          ] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="12345678"
                                        maxLength={8}
                                      />
                                      {validationErrors[
                                        persona.rol === 'Representante Legal' ? 'representanteDni' :
                                        persona.rol === 'Administrador' ? 'adminDni' : 'contadorDni'
                                      ] && (
                                        <p className="text-xs text-red-600 mt-1">
                                          {validationErrors[
                                            persona.rol === 'Representante Legal' ? 'representanteDni' :
                                            persona.rol === 'Administrador' ? 'adminDni' : 'contadorDni'
                                          ]}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                    <div>
                                      <input
                                        type="email"
                                        value={persona.email}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const updatedPersonas = personasData.map(p => 
                                            p.id === persona.id ? {...p, email: value} : p
                                          );
                                          setPersonasData(updatedPersonas);
                                          
                                          // También actualizar en formData y validar
                                          let newFormData = { ...formData };
                                          let fieldName = '';
                                          if (persona.rol === 'Representante Legal') {
                                            fieldName = 'representanteEmail';
                                            newFormData.representanteEmail = value;
                                          } else if (persona.rol === 'Administrador') {
                                            fieldName = 'adminEmail';
                                            newFormData.adminEmail = value;
                                          } else if (persona.rol === 'Contador') {
                                            fieldName = 'contadorEmail';
                                            newFormData.contadorEmail = value;
                                          }
                                          
                                          // Validar el campo
                                          const error = validateField(fieldName, value);
                                          const newValidationErrors = { ...validationErrors };
                                          
                                          if (error) {
                                            newValidationErrors[fieldName] = error;
                                          } else {
                                            delete newValidationErrors[fieldName];
                                          }
                                          
                                          setValidationErrors(newValidationErrors);
                                          
                                          // Actualizar completitud en tiempo real
                                          const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                          newFormData.completitud = newCompletitud;
                                          setFormData(newFormData);
                                        }}
                                        className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                                          validationErrors[
                                            persona.rol === 'Representante Legal' ? 'representanteEmail' :
                                            persona.rol === 'Administrador' ? 'adminEmail' : 'contadorEmail'
                                          ] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="email@empresa.com"
                                      />
                                      {validationErrors[
                                        persona.rol === 'Representante Legal' ? 'representanteEmail' :
                                        persona.rol === 'Administrador' ? 'adminEmail' : 'contadorEmail'
                                      ] && (
                                        <p className="text-xs text-red-600 mt-1">
                                          {validationErrors[
                                            persona.rol === 'Representante Legal' ? 'representanteEmail' :
                                            persona.rol === 'Administrador' ? 'adminEmail' : 'contadorEmail'
                                          ]}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                    <div>
                                      <input
                                        type="tel"
                                        value={persona.telefono}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const updatedPersonas = personasData.map(p => 
                                            p.id === persona.id ? {...p, telefono: value} : p
                                          );
                                          setPersonasData(updatedPersonas);
                                          
                                          // También actualizar en formData y validar
                                          let newFormData = { ...formData };
                                          let fieldName = '';
                                          if (persona.rol === 'Representante Legal') {
                                            fieldName = 'representanteTelefono';
                                            newFormData.representanteTelefono = value;
                                          } else if (persona.rol === 'Administrador') {
                                            fieldName = 'adminTelefono';
                                            newFormData.adminTelefono = value;
                                          } else if (persona.rol === 'Contador') {
                                            fieldName = 'contadorTelefono';
                                            newFormData.contadorTelefono = value;
                                          }
                                          
                                          // Validar el campo
                                          const error = validateField(fieldName, value);
                                          const newValidationErrors = { ...validationErrors };
                                          
                                          if (error) {
                                            newValidationErrors[fieldName] = error;
                                          } else {
                                            delete newValidationErrors[fieldName];
                                          }
                                          
                                          setValidationErrors(newValidationErrors);
                                          
                                          // Actualizar completitud en tiempo real
                                          const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                          newFormData.completitud = newCompletitud;
                                          setFormData(newFormData);
                                        }}
                                        className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                                          validationErrors[
                                            persona.rol === 'Representante Legal' ? 'representanteTelefono' :
                                            persona.rol === 'Administrador' ? 'adminTelefono' : 'contadorTelefono'
                                          ] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="987654321"
                                        maxLength={9}
                                      />
                                      {validationErrors[
                                        persona.rol === 'Representante Legal' ? 'representanteTelefono' :
                                        persona.rol === 'Administrador' ? 'adminTelefono' : 'contadorTelefono'
                                      ] && (
                                        <p className="text-xs text-red-600 mt-1">
                                          {validationErrors[
                                            persona.rol === 'Representante Legal' ? 'representanteTelefono' :
                                            persona.rol === 'Administrador' ? 'adminTelefono' : 'contadorTelefono'
                                          ]}
                                        </p>
                                      )}
                                    </div>
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
                      <div>
                        <input
                          type="text"
                          value={formData.facturacionAnual || ''}
                          onChange={(e) => handleInputChange('facturacionAnual', e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                            validationErrors.facturacionAnual ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="1500000"
                        />
                        {validationErrors.facturacionAnual && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.facturacionAnual}</p>
                        )}
                      </div>
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
                    <div>
                      <input
                        type="number"
                        value={formData.numTrabajadores || ''}
                        onChange={(e) => handleInputChange('numTrabajadores', e.target.value)}
                        className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                          validationErrors.numTrabajadores ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="25"
                        min="0"
                      />
                      {validationErrors.numTrabajadores && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.numTrabajadores}</p>
                      )}
                    </div>
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
                      <div>
                        <input
                          type="text"
                          value={formData.sector || ''}
                          onChange={(e) => handleInputChange('sector', e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                            validationErrors.sector ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="Construcción"
                        />
                        {validationErrors.sector && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.sector}</p>
                        )}
                      </div>
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
                      <div>
                        <input
                          type="number"
                          value={formData.porcentajeGastosPersonal || ''}
                          onChange={(e) => handleInputChange('porcentajeGastosPersonal', e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                            validationErrors.porcentajeGastosPersonal ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                          }`}
                          placeholder="40"
                          min="0"
                          max="100"
                        />
                        {validationErrors.porcentajeGastosPersonal && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.porcentajeGastosPersonal}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">% Gastos Operativos</label>
                      <div>
                        <input
                          type="number"
                          value={formData.porcentajeGastosOperativos || ''}
                          onChange={(e) => handleInputChange('porcentajeGastosOperativos', e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                            validationErrors.porcentajeGastosOperativos ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                          }`}
                          placeholder="35"
                          min="0"
                          max="100"
                        />
                        {validationErrors.porcentajeGastosOperativos && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.porcentajeGastosOperativos}</p>
                        )}
                      </div>
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
                <div>
                  <p className="text-blue-100 text-sm">{empresa.nombre}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="bg-blue-500 rounded-full h-2 w-32">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-300" 
                        style={{ width: `${calculateCompletitudRealTime(formData, credentialsStatus, validationErrors)}%` }}
                      ></div>
                    </div>
                    <span className="text-blue-100 text-xs">
                      {calculateCompletitudRealTime(formData, credentialsStatus, validationErrors)}% completo
                    </span>
                  </div>
                </div>
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
                  onClick={() => handleTabChange(tab.id)}
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
            Cancelar
          </button>
          {/* Solo mostrar botón Guardar en tabs que no tienen guardado individual */}
          {activeTab === 'comercial' && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>Guardar Cambios</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto-discovery modals */}
      <AutoDiscoveryNotification
        isVisible={showAutoDiscovery}
        personName={discoveredPersonName}
        relatedCompanies={relatedCompanies}
        onClose={() => setShowAutoDiscovery(false)}
        onViewDetails={handleViewRelatedCompaniesDetails}
        onAddAll={handleAddRelatedCompanies}
      />

    </div>
  );
};

export default EditCompanyModal;