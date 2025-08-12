import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle, Trash2, Clock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface CompanyData {
  id: string;
  ruc: string;
  businessName: string;
  sunatStatus?: string;
  sunatCondition?: string;
  solUser: string;
  solPassword: string;
  isValid: boolean;
  status: 'validando' | 'no_valido' | 'incompleto' | 'verificada';
  validationState: {
    ruc: 'valid' | 'invalid' | 'duplicate' | 'inactive' | 'validating' | null;
    credentials: 'valid' | 'invalid' | 'validating' | null;
  };
  expanded: boolean;
}

interface CompanyAccordionItemProps {
  company: CompanyData;
  companyNumber: number;
  isLastCompany: boolean;
  onUpdate: (id: string, field: string, value: string) => void;
  onDelete: (id: string) => void;
  onExpand: (id: string) => void;
  onValidate: (id: string, field: string, value: string) => void;
}

const CompanyAccordionItem: React.FC<CompanyAccordionItemProps> = ({
  company,
  companyNumber,
  isLastCompany,
  onUpdate,
  onDelete,
  onExpand,
  onValidate
}) => {
  const rucInputRef = useRef<HTMLInputElement>(null);

  const [realTimeValidation, setRealTimeValidation] = useState({
    ruc: null as string | null,
    solUser: null as string | null,
    solPassword: null as string | null
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Auto-focus RUC field for last company if it's the most recently added
  useEffect(() => {
    if (isLastCompany && company.expanded && rucInputRef.current) {
      rucInputRef.current.focus();
      // Smooth scroll to show the new company
      rucInputRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isLastCompany, company.expanded]);

  const handleFieldChange = (field: string, value: string) => {
    onUpdate(company.id, field, value);
    
    // Real-time validation
    if (field === 'ruc') {
      validateRucRealTime(value);
      if (value.length === 11) {
        setTimeout(() => onValidate(company.id, field, value), 100);
      } else if (value.length === 0) {
        setTimeout(() => onValidate(company.id, 'clearRuc', ''), 50);
      } else if (value.length > 0 && value.length < 11 && company.validationState.ruc) {
        // Clear RUC validation and also clear credentials validation since RUC is invalid
        setTimeout(() => onValidate(company.id, 'clearRuc', ''), 50);
      }
    } else if (field === 'solUser') {
      validateSolUserRealTime(value);
      // Si el campo se vacía, limpiar la validación de credenciales
      if (!value.trim()) {
        setTimeout(() => onValidate(company.id, 'clearCredentials', ''), 50);
      } else if (value && company.solPassword && company.validationState.ruc === 'valid') {
        setTimeout(() => onValidate(company.id, 'credentials', value), 100);
      }
    } else if (field === 'solPassword') {
      validateSolPasswordRealTime(value);
      // Si el campo se vacía, limpiar la validación de credenciales
      if (!value.trim()) {
        setTimeout(() => onValidate(company.id, 'clearCredentials', ''), 50);
      } else if (value && company.solUser && company.validationState.ruc === 'valid') {
        setTimeout(() => onValidate(company.id, 'credentials', value), 100);
      }
    }
  };

  const validateRucRealTime = (ruc: string) => {
    if (ruc.length === 0) {
      setRealTimeValidation(prev => ({ ...prev, ruc: null }));
    } else if (!/^\d+$/.test(ruc)) {
      setRealTimeValidation(prev => ({ ...prev, ruc: 'El RUC debe contener solo números' }));
    } else if (ruc.length < 11) {
      setRealTimeValidation(prev => ({ ...prev, ruc: 'El RUC debe tener 11 dígitos' }));
    } else if (ruc.length === 11) {
      setRealTimeValidation(prev => ({ ...prev, ruc: null }));
    }
  };

  const validateSolUserRealTime = (solUser: string) => {
    setRealTimeValidation(prev => ({ ...prev, solUser: null }));
  };

  const validateSolPasswordRealTime = (solPassword: string) => {
    setRealTimeValidation(prev => ({ ...prev, solPassword: null }));
  };

  // Nueva función para generar los mensajes descriptivos del estado (puede retornar múltiples)
  const getDescriptiveStatusMessages = () => {
    const { ruc, solUser, solPassword, status, validationState } = company;
    
    const hasRuc = ruc.trim().length > 0;
    const hasValidRuc = hasRuc && ruc.trim().length === 11 && /^\d+$/.test(ruc.trim());
    const hasUser = solUser.trim().length > 0;
    const hasPassword = solPassword.trim().length > 0;
    
    // Verificar estados específicos
    const rucValid = validationState.ruc === 'valid' || validationState.ruc === 'inactive';
    const rucInvalid = (hasRuc && !hasValidRuc) || validationState.ruc === 'invalid' || validationState.ruc === 'duplicate';
    const credentialsValid = validationState.credentials === 'valid';
    const credentialsInvalid = validationState.credentials === 'invalid';
    
    // Verificar si hay campos vacíos
    const rucEmpty = !hasRuc;
    const userEmpty = !hasUser;
    const passwordEmpty = !hasPassword;
    
    const messages = [];
    
    // Caso especial: RUC válido pero credenciales incompletas
    if (rucValid && (userEmpty || passwordEmpty)) {
      // Agregar etiqueta de RUC válido
      messages.push({ text: 'RUC válido', type: 'verified' });
      
      // Agregar etiqueta de incompleto para credenciales
      if (userEmpty && passwordEmpty) {
        messages.push({ text: 'Incompleto: Credenciales vacías', type: 'incomplete' });
      } else if (userEmpty) {
        messages.push({ text: 'Incompleto: Usuario vacío', type: 'incomplete' });
      } else if (passwordEmpty) {
        messages.push({ text: 'Incompleto: Contraseña vacía', type: 'incomplete' });
      }
      
      return messages;
    }
    
    // Caso especial: RUC válido pero credenciales inválidas
    if (rucValid && credentialsInvalid) {
      // Agregar etiqueta de RUC válido
      messages.push({ text: 'RUC válido', type: 'verified' });
      
      // Agregar etiqueta de credenciales inválidas
      messages.push({ text: 'Inválido: Credenciales inválidas', type: 'invalid' });
      
      return messages;
    }
    
    // Caso: Campos inválidos Y campos vacíos
    const hasInvalidFields = rucInvalid || credentialsInvalid;
    const hasEmptyFields = rucEmpty || userEmpty || passwordEmpty;
    
    if (hasInvalidFields && hasEmptyFields) {
      // Mensaje de inválidos
      if (rucInvalid && credentialsInvalid) {
        messages.push({ text: 'Inválido: RUC y credenciales inválidas', type: 'invalid' });
      } else if (rucInvalid) {
        messages.push({ text: 'Inválido: RUC inválido', type: 'invalid' });
      } else if (credentialsInvalid) {
        messages.push({ text: 'Inválido: Credenciales inválidas', type: 'invalid' });
      }
      
      // Mensaje de vacíos
      if (rucEmpty && userEmpty && passwordEmpty) {
        messages.push({ text: 'Incompleto: RUC y credenciales vacías', type: 'incomplete' });
      } else if (rucEmpty && userEmpty) {
        messages.push({ text: 'Incompleto: RUC y usuario vacíos', type: 'incomplete' });
      } else if (rucEmpty && passwordEmpty) {
        messages.push({ text: 'Incompleto: RUC y contraseña vacías', type: 'incomplete' });
      } else if (userEmpty && passwordEmpty) {
        messages.push({ text: 'Incompleto: Credenciales vacías', type: 'incomplete' });
      } else if (rucEmpty) {
        messages.push({ text: 'Incompleto: RUC vacío', type: 'incomplete' });
      } else if (userEmpty) {
        messages.push({ text: 'Incompleto: Usuario vacío', type: 'incomplete' });
      } else if (passwordEmpty) {
        messages.push({ text: 'Incompleto: Contraseña vacía', type: 'incomplete' });
      }
      
      return messages;
    }
    
    // Para casos simples, retornar una sola etiqueta
    switch (status) {
      case 'incompleto':
        if (hasRuc && !hasValidRuc) {
          return [{ text: 'Inválido: RUC inválido', type: 'invalid' }];
        }
        
        if (!hasRuc && !hasUser && !hasPassword) {
          return [{ text: 'Incompleto: RUC y credenciales vacías', type: 'incomplete' }];
        }
        if (!hasRuc && hasUser && hasPassword) {
          return [{ text: 'Incompleto: RUC vacío', type: 'incomplete' }];
        }
        if (hasRuc && !hasUser && !hasPassword) {
          return [{ text: 'Incompleto: Credenciales vacías', type: 'incomplete' }];
        }
        if (hasRuc && !hasUser && hasPassword) {
          return [{ text: 'Incompleto: Usuario vacío', type: 'incomplete' }];
        }
        if (hasRuc && hasUser && !hasPassword) {
          return [{ text: 'Incompleto: Contraseña vacía', type: 'incomplete' }];
        }
        if (!hasRuc && hasUser && !hasPassword) {
          return [{ text: 'Incompleto: RUC y contraseña vacías', type: 'incomplete' }];
        }
        if (!hasRuc && !hasUser && hasPassword) {
          return [{ text: 'Incompleto: RUC y usuario vacíos', type: 'incomplete' }];
        }
        
        return [{ text: 'Incompleto', type: 'incomplete' }];

      case 'no_valido':
        if (rucInvalid && credentialsInvalid) {
          return [{ text: 'Inválido: RUC y credenciales inválidas', type: 'invalid' }];
        }
        if (rucInvalid) {
          return [{ text: 'Inválido: RUC inválido', type: 'invalid' }];
        }
        if (credentialsInvalid) {
          return [{ text: 'Inválido: Credenciales inválidas', type: 'invalid' }];
        }
        return [{ text: 'Inválido', type: 'invalid' }];

      case 'verificada':
        return [{ text: 'Validado: RUC y credenciales validadas', type: 'verified' }];

      case 'validando':
        return [{ text: 'Validando...', type: 'validating' }];

      default:
        return [{ text: '', type: 'default' }];
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'verified':
        // Todos los estados verificados son verdes, incluso si la empresa está inactiva
        return 'text-green-600 bg-green-50';
      case 'validating':
        return 'text-blue-600 bg-blue-50';
      case 'invalid':
        return 'text-red-600 bg-red-50';
      case 'incomplete':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getFieldBorderColor = (field: string, state: string | null) => {
    if (!state) return 'border-gray-300 focus:border-blue-500';
    
    switch (state) {
      case 'valid':
        return 'border-green-500 focus:border-green-500';
      case 'invalid':
      case 'duplicate':
        return 'border-red-500 focus:border-red-500';
      case 'inactive':
        return 'border-yellow-500 focus:border-yellow-500';
      case 'validating':
        return 'border-blue-500 focus:border-blue-500';
      default:
        return 'border-gray-300 focus:border-blue-500';
    }
  };

  const getValidationIcon = (state: string | null) => {
    switch (state) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
      case 'duplicate':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'validating':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getValidationMessage = (field: string, state: string | null) => {
    switch (field) {
      case 'ruc':
        switch (state) {
          case 'valid':
            return 'RUC válido';
          case 'invalid':
            return 'RUC inválido o no existe';
          case 'duplicate':
            return 'Este RUC ya está registrado';
          case 'inactive':
            return 'Empresa inactiva en SUNAT (se puede verificar con credenciales)';
          case 'validating':
            return 'Validando RUC...';
          default:
            return '';
        }
      case 'credentials':
        switch (state) {
          case 'valid':
            return 'Credenciales válidas';
          case 'invalid':
            return 'Usuario o contraseña incorrectos';
          case 'validating':
            return 'Validando credenciales...';
          default:
            return '';
        }
      default:
        return '';
    }
  };

  const getSunatStatusColor = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'text-green-600 bg-green-100';
      case 'Baja Provisional por Oficio':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Accordion Header */}
      <div 
        className={`p-4 cursor-pointer transition-colors ${
          company.expanded ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => onExpand(company.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Chevron */}
            {company.expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            
            {/* Company Label */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {company.businessName || 'Nueva empresa'}
                </span>
                {/* Status indicator */}
                {company.status === 'verificada' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {company.status === 'validando' && (
                  <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                {company.status === 'no_valido' && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                {company.status === 'incompleto' && (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              {company.businessName && company.sunatStatus && company.sunatCondition && (
                <div className="flex items-start space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium h-auto leading-tight text-center ${getSunatStatusColor(company.sunatStatus)}`} style={{ maxWidth: '84px' }}>
                    <span className="w-full break-words">Estado: {company.sunatStatus}</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium h-auto leading-tight text-center text-blue-600 bg-blue-100" style={{ maxWidth: '84px' }}>
                    <span className="w-full break-words">Condición: {company.sunatCondition}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Status badges with descriptive messages - can be multiple */}
            <div className="flex flex-col items-end space-y-1">
              {getDescriptiveStatusMessages().map((message, index) => (
                message.text && (
                  <span 
                    key={index}
                    className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(message.type)}`}
                  >
                    {message.text}
                  </span>
                )
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(company.id);
              }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      {company.expanded && (
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="space-y-4">
            {/* RUC Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                RUC *
              </label>
              <div className="relative">
                <input
                  ref={rucInputRef}
                  type="text"
                  placeholder="Ingresa el RUC de 11 dígitos"
                  value={company.ruc}
                  onChange={(e) => handleFieldChange('ruc', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    getFieldBorderColor('ruc', company.validationState.ruc)
                  }`}
                  maxLength={11}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getValidationIcon(company.validationState.ruc)}
                </div>
              </div>
              
              {/* Real-time Validation Message */}
              {realTimeValidation.ruc && (
                <p className="text-sm mt-1 text-left text-red-600">
                  {realTimeValidation.ruc}
                </p>
              )}
              {/* Server Validation Message */}
              {!realTimeValidation.ruc && company.validationState.ruc && (
                <p className={`text-sm mt-1 text-left ${
                  company.validationState.ruc === 'valid' ? 'text-green-600' :
                  company.validationState.ruc === 'inactive' ? 'text-yellow-600' :
                  company.validationState.ruc === 'validating' ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  {getValidationMessage('ruc', company.validationState.ruc)}
                </p>
              )}
            </div>

            {/* SOL User Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Usuario SOL *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={company.solUser.trim() ? "Usuario SOL" : "Ingresa tu usuario"}
                  value={company.solUser}
                  onChange={(e) => handleFieldChange('solUser', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    getFieldBorderColor('credentials', company.validationState.credentials)
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {company.solUser && company.solPassword && 
                   getValidationIcon(company.validationState.credentials)}
                </div>
              </div>
              {/* Real-time Validation Message for SOL User */}
              {realTimeValidation.solUser && (
                <p className="text-sm text-red-600 mt-1 text-left">
                  {realTimeValidation.solUser}
                </p>
              )}
              {!realTimeValidation.solUser && company.validationState.credentials === 'validating' && (
                <p className="text-sm text-blue-600 mt-1 text-left">
                  Validando usuario...
                </p>
              )}
            </div>

            {/* SOL Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Contraseña SOL *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={company.solPassword.trim() ? "Contraseña SOL" : "Ingresa tu contraseña"}
                  value={company.solPassword}
                  onChange={(e) => handleFieldChange('solPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20 ${
                    getFieldBorderColor('credentials', company.validationState.credentials)
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  {company.solUser && company.solPassword && 
                   getValidationIcon(company.validationState.credentials)}
                </div>
              </div>
              {/* Real-time Validation Message for SOL Password */}
              {realTimeValidation.solPassword && (
                <p className="text-sm text-red-600 mt-1 text-left">
                  {realTimeValidation.solPassword}
                </p>
              )}
              {!realTimeValidation.solPassword && company.solPassword.trim() && company.validationState.credentials === 'invalid' && (
                <p className="text-sm text-red-600 mt-1 text-left">
                  Credenciales incorrectas
                </p>
              )}
              {!realTimeValidation.solPassword && company.solPassword.trim() && company.validationState.credentials === 'validating' && (
                <p className="text-sm text-blue-600 mt-1 text-left">
                  Validando contraseña...
                </p>
              )}
              {!realTimeValidation.solPassword && company.solUser.trim() && company.solPassword.trim() && company.validationState.credentials === 'valid' && (
                <p className="text-sm text-green-600 mt-1 text-left">
                  Credenciales válidas
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyAccordionItem;