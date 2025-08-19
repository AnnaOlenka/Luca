import React, { useState, useEffect,useRef } from 'react';
import { X, Edit3, Save, User, Briefcase, FileText, Calculator, Users, CheckCircle, ChevronDown, ChevronUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import AutoDiscoveryNotification from '../Notifications/AutoDiscoveryNotification';

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
  const [nextPersonaId, setNextPersonaId] = useState(4); // Para generar IDs únicos

  // Opciones de roles disponibles
  const roleOptions = [
    { value: 'Representante Legal', label: 'Representante Legal', color: 'bg-red-100 text-red-800' },
    { value: 'Administrador', label: 'Administrador', color: 'bg-orange-100 text-orange-800' },
    { value: 'Contador', label: 'Contador', color: 'bg-blue-100 text-blue-800' },
  ];

  // Estilos CSS responsivos
  const styles = `
    .edit-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
    .edit-modal-container { background-color: white; border-radius: 0.75rem; width: 100%; max-width: 56rem; max-height: 90vh; height: 37.5rem; min-height: 37.5rem; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .edit-modal-header { background-color: #2563eb; color: white; padding: 1rem; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; display: flex; align-items: center; justify-content: space-between; }
    .edit-modal-title { font-size: 1.25rem; font-weight: 600; }
    .edit-modal-subtitle { font-size: 0.875rem; opacity: 0.9; margin-top: 0.25rem; }
    .edit-modal-close-btn { color: white; padding: 0.5rem; border-radius: 0.375rem; transition: background-color 0.2s; border: none; background: none; cursor: pointer; }
    .edit-modal-close-btn:hover { background-color: rgba(255, 255, 255, 0.1); }
    .edit-modal-tabs { background-color: #f9fafb; padding: 0.35rem; border-bottom: 1px solid #e5e7eb; }
    .edit-modal-tab-list { display: flex; gap: 0.5rem; }
    .edit-modal-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; background: none; }
    .edit-modal-tab.active { background-color: white; color: #2563eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .edit-modal-tab:not(.active) { color: #6b7280; }
    .edit-modal-tab:not(.active):hover { background-color: rgba(255, 255, 255, 0.5); }
    .edit-modal-content { flex: 1; overflow-y: auto; padding: 1rem; }
    .edit-modal-footer { background-color: #f9fafb; padding: 0.75rem 1rem; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e7eb; }
    .edit-modal-save-btn { background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .edit-modal-save-btn:hover { background-color: #1d4ed8; }
    .edit-modal-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .edit-modal-completitud { font-size: 0.875rem; color: #6b7280; }
    .edit-modal-cancel-btn { padding: 0.5rem 1rem; color: #6b7280; background-color: transparent; border: none; border-radius: 0.5rem; fontSize: 0.875rem; cursor: pointer; transition: background-color 0.2s; }
    .edit-modal-cancel-btn:hover { background-color: #f3f4f6; }
    .edit-modal-add-contact-btn { background-color: #06b6d4; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .edit-modal-add-contact-btn:hover { background-color: #0891b2; }
    .edit-modal-edit-btn { background-color: #3b82f6; color: white; padding: 0.45rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.25rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .edit-modal-edit-btn:hover { background-color: #2563eb;}
    .edit-modal-delete-btn { background-color: #ef4444; color: white; padding: 0.5rem; border-radius: 0.375rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .edit-modal-delete-btn:hover { background-color: #dc2626; }
    .edit-modal-save-persona-btn { background-color: transparent; color: #2563eb; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.25rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .edit-modal-save-persona-btn:hover { background-color: #eff6ff; }
    @media (max-width: 48rem) {
      .edit-modal-backdrop { padding: 0.5rem; }
      .edit-modal-container { height: 90vh; min-height: 90vh; }
      .edit-modal-header { padding: 0.75rem; }
      .edit-modal-title { font-size: 1.125rem; }
      .edit-modal-tabs { padding: 0.75rem; }
      .edit-modal-tab { padding: 0.5rem 0.45rem; font-size: 0.8125rem; }
      .edit-modal-content { padding: 0.75rem; }
      .edit-modal-footer { padding: 0.75rem; }
    }
    @media (max-width: 30rem) {
      .edit-modal-container { max-width: 95vw; }
      .edit-modal-tab { padding: 0.5rem; font-size: 0.75rem; }
      .edit-modal-content { padding: 0.5rem; }
    }
  `;

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

  // Funciones para manejo de personas dinámicas
  const addNewPersona = () => {
    const newPersona = {
      id: nextPersonaId.toString(),
      rol: 'Representante Legal', // Rol por defecto
      nombre: '',
      dni: '',
      email: '',
      telefono: ''
    };
    
    setPersonasData([...personasData, newPersona]);
    setNextPersonaId(nextPersonaId + 1);
    setExpandedPersona(newPersona.id); // Expandir automáticamente para editar
  };

  const removePersona = (personaId: string) => {
    setPersonasData(personasData.filter(p => p.id !== personaId));
    if (expandedPersona === personaId) {
      setExpandedPersona(null);
    }
  };

  const updatePersonaRole = (personaId: string, newRole: string) => {
    const updatedPersonas = personasData.map(p => 
      p.id === personaId ? {...p, rol: newRole} : p
    );
    setPersonasData(updatedPersonas);
  };

  const getRoleColor = (role: string) => {
    const roleOption = roleOptions.find(option => option.value === role);
    return roleOption ? roleOption.color : 'bg-gray-100 text-gray-800';
  };

  const getFormFieldName = (role: string, fieldType: 'nombre' | 'dni' | 'email' | 'telefono'): string | null => {
    // Solo sincronizar con formData para los roles tradicionales
    if (role === 'Representante Legal') {
      return fieldType === 'nombre' ? 'representanteNombres' :
             fieldType === 'dni' ? 'representanteDni' :
             fieldType === 'email' ? 'representanteEmail' :
             fieldType === 'telefono' ? 'representanteTelefono' : null;
    } else if (role === 'Administrador') {
      return fieldType === 'nombre' ? 'adminNombre' :
             fieldType === 'dni' ? 'adminDni' :
             fieldType === 'email' ? 'adminEmail' :
             fieldType === 'telefono' ? 'adminTelefono' : null;
    } else if (role === 'Contador') {
      return fieldType === 'nombre' ? 'contadorNombre' :
             fieldType === 'dni' ? 'contadorDni' :
             fieldType === 'email' ? 'contadorEmail' :
             fieldType === 'telefono' ? 'contadorTelefono' : null;
    }
    // Para otros roles, no sincronizar con formData
    return null;
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
  const updatePersonasData = (data: any, customPersonas?: any[]) => {
    // Si se pasan personas personalizadas, usar esas
    if (customPersonas) {
      setPersonasData(customPersonas);
      return;
    }
    
    // Si no hay personas existentes, crear las por defecto
    if (personasData.length === 0) {
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
    }
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
    setActiveTab('credenciales');
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

  // Inyectar estilos CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => styleElement.remove();
  }, [styles]);

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
  


  const renderTabContent = () => {
    switch (activeTab) {
      case 'personas':
        return (
          <div className="h-full flex flex-col">
            <div className="border border-blue-200 rounded-lg p-1 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-blue-900 mb-1 flex items-center">
                  <Users className="w-5 h-4 mr-2 text-blue-600" />
                  Personas Asignadas
                </h3>
                <button
                  onClick={addNewPersona}
                  className="edit-modal-add-contact-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Contacto</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="bg-white border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-center font-medium text-gray-700">Asignación</th>
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
                            <span className={`px-1.7 py-0.7 text-xs font-medium ${getRoleColor(persona.rol)}`}>
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
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setExpandedPersona(expandedPersona === persona.id ? null : persona.id)}
                                className="edit-modal-edit-btn"
                              >
                                <Edit3 style={{ width: '0.75rem', height: '0.75rem' }} />
                                <span>Editar</span>
                                {expandedPersona === persona.id ? 
                                  <ChevronUp style={{ width: '0.75rem', height: '0.75rem' }} /> : 
                                  <ChevronDown style={{ width: '0.75rem', height: '0.75rem' }} />
                                }
                              </button>
                              {personasData.length > 1 && (
                                <button
                                  onClick={() => removePersona(persona.id)}
                                  className="edit-modal-delete-btn"
                                  title="Eliminar persona"
                                >
                                  <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Panel expandible de edición */}
                        {expandedPersona === persona.id && (
                          <tr className="border-t bg-blue-50">
                            <td colSpan={6} className="p-4">
                              <div className="bg-white border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">Editar {persona.rol}: {persona.nombre}</h4>
                                
                                {/* Dropdown de rol */}
                                <div className="mb-4">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Rol/Asignación</label>
                                  <select
                                    value={persona.rol}
                                    onChange={(e) => updatePersonaRole(persona.id, e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                  >
                                    {roleOptions.map(option => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

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
                                          
                                          // También actualizar en formData y validar (solo para roles tradicionales)
                                          const fieldName = getFormFieldName(persona.rol, 'nombre');
                                          let newFormData = { ...formData };
                                          let newValidationErrors = { ...validationErrors };
                                          
                                          if (fieldName) {
                                            newFormData[fieldName] = value;
                                            
                                            // Validar el campo
                                            const error = validateField(fieldName, value);
                                            
                                            if (error) {
                                              newValidationErrors[fieldName] = error;
                                            } else {
                                              delete newValidationErrors[fieldName];
                                            }
                                            
                                            // Actualizar completitud en tiempo real
                                            const newCompletitud = calculateCompletitud(newFormData, credentialsStatus);
                                            newFormData.completitud = newCompletitud;
                                          }
                                          
                                          setValidationErrors(newValidationErrors);
                                          setFormData(newFormData);
                                        }}
                                        className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 ${
                                          validationErrors[getFormFieldName(persona.rol, 'nombre') || ''] 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Nombre completo"
                                      />
                                      {validationErrors[getFormFieldName(persona.rol, 'nombre') || ''] && (
                                        <p className="text-xs text-red-600 mt-1">
                                          {validationErrors[getFormFieldName(persona.rol, 'nombre') || '']}
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
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                  <button
                                    onClick={() => setExpandedPersona(null)}
                                    className="edit-modal-cancel-btn"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => handlePersonaSave(persona.id)}
                                    className="edit-modal-save-persona-btn"
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
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%'}}>
            {/* Datos Operacionales */}
            <div>
              <h3 style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '2px dotted #d1d5db'}}>Datos Operacionales</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem'}}>
                <div style={{gridColumn: 'span 2'}}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                    <div>
                      <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Facturación Anual</label>
                      <div>
                        <input
                          type="text"
                          value={formData.facturacionAnual || ''}
                          onChange={(e) => handleInputChange('facturacionAnual', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.25rem 0.5rem',
                            border: `1px solid ${
                              validationErrors.facturacionAnual ? '#ef4444' : '#d1d5db'
                            }`,
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                          placeholder="1500000"
                        />
                        {validationErrors.facturacionAnual && (
                          <p style={{fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem'}}>{validationErrors.facturacionAnual}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Moneda</label>
                      <select
                        value={formData.moneda || 'PEN'}
                        onChange={(e) => handleInputChange('moneda', e.target.value)}
                        style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                      >
                        <option value="PEN">PEN - Soles</option>
                        <option value="USD">USD - Dólares</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>N° Trabajadores</label>
                  <div>
                    <input
                      type="number"
                      value={formData.numTrabajadores || ''}
                      onChange={(e) => handleInputChange('numTrabajadores', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.25rem 0.5rem',
                        border: `1px solid ${
                          validationErrors.numTrabajadores ? '#ef4444' : '#d1d5db'
                        }`,
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      placeholder="25"
                      min="0"
                    />
                    {validationErrors.numTrabajadores && (
                      <p style={{fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem'}}>{validationErrors.numTrabajadores}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Estacionalidad</label>
                  <input
                    type="text"
                    value={formData.estacionalidad || ''}
                    onChange={(e) => handleInputChange('estacionalidad', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                    placeholder="Mayor actividad en diciembre"
                  />
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Tipo de Trabajadores</label>
                  <select
                    value={formData.tipoTrabajadores || ''}
                    onChange={(e) => handleInputChange('tipoTrabajadores', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="PLANILLA">Planilla</option>
                    <option value="RECIBOS">Recibos por Honorarios</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Vol. Mensual</label>
                  <input
                    type="text"
                    value={formData.volumenMensual || ''}
                    onChange={(e) => handleInputChange('volumenMensual', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                    placeholder="150"
                  />
                </div>
              </div>
            </div>

            {/* Segmentación de Clientes */}
            <div>
              <h3 style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '2px dotted #d1d5db'}}>Segmentación de Clientes</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Tipo Principal</label>
                  <select
                    value={formData.tipoPrincipal || ''}
                    onChange={(e) => handleInputChange('tipoPrincipal', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="B2B">B2B - Empresas</option>
                    <option value="B2C">B2C - Consumidores</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Sector</label>
                  <div>
                    <input
                      type="text"
                      value={formData.sector || ''}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.25rem 0.5rem',
                        border: `1px solid ${
                          validationErrors.sector ? '#ef4444' : '#d1d5db'
                        }`,
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      placeholder="Construcción"
                    />
                    {validationErrors.sector && (
                      <p style={{fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem'}}>{validationErrors.sector}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Canales de Venta</label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <input
                        type="checkbox"
                        checked={formData.canalPresencial || false}
                        onChange={(e) => handleInputChange('canalPresencial', e.target.checked)}
                        style={{width: '0.75rem', height: '0.75rem'}}
                      />
                      <span style={{fontSize: '0.75rem', color: '#374151'}}>Presencial</span>
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <input
                        type="checkbox"
                        checked={formData.canalOnline || false}
                        onChange={(e) => handleInputChange('canalOnline', e.target.checked)}
                        style={{width: '0.75rem', height: '0.75rem'}}
                      />
                      <span style={{fontSize: '0.75rem', color: '#374151'}}>Online</span>
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <input
                        type="checkbox"
                        checked={formData.canalMarketplace || false}
                        onChange={(e) => handleInputChange('canalMarketplace', e.target.checked)}
                        style={{width: '0.75rem', height: '0.75rem'}}
                      />
                      <span style={{fontSize: '0.75rem', color: '#374151'}}>Marketplace</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración Financiera */}
            <div>
              <h3 style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '2px dotted #d1d5db'}}>Configuración Financiera</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Meta Mensual Ingresos</label>
                  <input
                    type="text"
                    value={formData.metaIngresosMensual || ''}
                    onChange={(e) => handleInputChange('metaIngresosMensual', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                    placeholder="85,000"
                  />
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Mes Mayor Ingreso</label>
                  <select
                    value={formData.mesMayorIngreso || ''}
                    onChange={(e) => handleInputChange('mesMayorIngreso', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
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
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Mes Menor Ingreso</label>
                  <select
                    value={formData.mesMenorIngreso || ''}
                    onChange={(e) => handleInputChange('mesMenorIngreso', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
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
              <div style={{marginTop: '0.75rem'}}>
                <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Promedio Mensual Egresos</label>
                <input
                  type="text"
                  value={formData.promedioEgresosMensual || ''}
                  onChange={(e) => handleInputChange('promedioEgresosMensual', e.target.value)}
                  style={{width: '33%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                  placeholder="35,000"
                />
              </div>
            </div>

            {/* Configuración Contable */}
            <div>
              <h3 style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '2px dotted #d1d5db'}}>Configuración Contable</h3>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Plan Contable</label>
                  <select
                    value={formData.planContable || ''}
                    onChange={(e) => handleInputChange('planContable', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                  >
                    <option value="">Seleccionar plan</option>
                    <option value="PCGE">PCGE</option>
                    <option value="PERSONALIZADO">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Moneda Funcional</label>
                  <select
                    value={formData.monedaFuncional || 'PEN'}
                    onChange={(e) => handleInputChange('monedaFuncional', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                  >
                    <option value="PEN">PEN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Período Fiscal</label>
                  <select
                    value={formData.periodoFiscal || ''}
                    onChange={(e) => handleInputChange('periodoFiscal', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                  >
                    <option value="">Seleccionar</option>
                    <option value="ENERO_DICIEMBRE">Ene - Dic</option>
                    <option value="JULIO_JUNIO">Jul - Jun</option>
                  </select>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem'}}>
                <input
                  type="checkbox"
                  id="librosElectronicos"
                  checked={formData.librosElectronicos || false}
                  onChange={(e) => handleInputChange('librosElectronicos', e.target.checked)}
                  style={{width: '0.75rem', height: '0.75rem'}}
                />
                <label htmlFor="librosElectronicos" style={{fontSize: '0.75rem', fontWeight: '500', color: '#374151'}}>
                  Libros Electrónicos Habilitados
                </label>
              </div>
            </div>

            {/* Configuración Tributaria */}
            <div>
              <h3 style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '2px dotted #d1d5db'}}>Configuración Tributaria</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>% Gastos Personal</label>
                  <div>
                    <input
                      type="number"
                      value={formData.porcentajeGastosPersonal || ''}
                      onChange={(e) => handleInputChange('porcentajeGastosPersonal', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.25rem 0.5rem',
                        border: `1px solid ${
                          validationErrors.porcentajeGastosPersonal ? '#ef4444' : '#d1d5db'
                        }`,
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      placeholder="40"
                      min="0"
                      max="100"
                    />
                    {validationErrors.porcentajeGastosPersonal && (
                      <p style={{fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem'}}>{validationErrors.porcentajeGastosPersonal}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>% Gastos Operativos</label>
                  <div>
                    <input
                      type="number"
                      value={formData.porcentajeGastosOperativos || ''}
                      onChange={(e) => handleInputChange('porcentajeGastosOperativos', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.25rem 0.5rem',
                        border: `1px solid ${
                          validationErrors.porcentajeGastosOperativos ? '#ef4444' : '#d1d5db'
                        }`,
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      placeholder="35"
                      min="0"
                      max="100"
                    />
                    {validationErrors.porcentajeGastosOperativos && (
                      <p style={{fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem'}}>{validationErrors.porcentajeGastosOperativos}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>% Renta Anual Estimado</label>
                  <input
                    type="number"
                    value={formData.porcentajeRentaAnual || ''}
                    onChange={(e) => handleInputChange('porcentajeRentaAnual', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                    placeholder="29.5"
                    step="0.1"
                    min="0"
                    max="50"
                  />
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Frecuencia Pagos</label>
                  <select
                    value={formData.frecuenciaPagosRenta || ''}
                    onChange={(e) => handleInputChange('frecuenciaPagosRenta', e.target.value)}
                    style={{width: '100%', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem', outline: 'none'}}
                  >
                    <option value="">Seleccionar</option>
                    <option value="MENSUAL">Mensual</option>
                    <option value="ANUAL">Anual</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Mensaje de éxito */}
            {successMessage.show && successMessage.tab === 'comercial' && (
              <div style={{marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <CheckCircle style={{width: '1rem', height: '1rem', color: '#059669', marginRight: '0.5rem'}} />
                  <span style={{fontSize: '0.875rem', color: '#065f46'}}>{successMessage.message}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'credenciales':
        return (
          <div className="grid grid-cols-1 gap-4 h-full ">
            <div className="bg-white border border-green-200 rounded-lg p-4">
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
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">{credentialsError}</span>
                  </div>
                </div>
              )}
              
              {/* Estado de validación */}
              {!credentialsError && (
                <div className="mt-6 bg-white border border-green-300 rounded-lg p-3">
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
    <div className="edit-modal-backdrop">
      <div className="edit-modal-container">
        {/* Header */}
        <div className="edit-modal-header" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Edit3 style={{ width: '1.5rem', height: '1.5rem' }} />
            <div>
              <h2 className="edit-modal-title">Editar Empresa</h2>
              <div>
                <p className="edit-modal-subtitle">{empresa.nombre}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              if (successMessage.show) return; // No cerrar si está mostrando mensaje
              handleModalClose();
            }} 
            className="edit-modal-close-btn"
            style={{ position: 'absolute', top: '1rem', right: '1rem' }}
            disabled={successMessage.show}
          >
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="edit-modal-tabs">
          <div className="edit-modal-tab-list">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`edit-modal-tab ${isActive ? 'active' : ''}`}
                  style={{ flex: '1', justifyContent: 'center', position: 'relative' }}
                >
                  <IconComponent style={{ width: '1rem', height: '1rem' }} />
                  <span>{tab.label}</span>
                  {/* Símbolo de alerta para credenciales inválidas */}
                  {tab.id === 'credenciales' && credentialsStatus === 'invalid' && (
                    <div style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', width: '1rem', height: '1rem', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>!</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="edit-modal-content">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="edit-modal-footer">
          <div className="edit-modal-completitud">
            {calculateCompletitudRealTime(formData, credentialsStatus, validationErrors)}% completo
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => {
                if (successMessage.show) return;
                handleModalClose();
              }} 
              className="edit-modal-cancel-btn"
              disabled={successMessage.show}
            >
              Cancelar
            </button>
            {/* Solo mostrar botón Guardar en tabs que no tienen guardado individual */}
            {activeTab === 'comercial' && (
              <button
                onClick={handleSave}
                className="edit-modal-save-btn"
              >
                <Save style={{ width: '1rem', height: '1rem' }} />
                <span>Guardar Cambios</span>
              </button>
            )}
          </div>
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