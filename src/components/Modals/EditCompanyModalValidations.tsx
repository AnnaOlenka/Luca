import React from 'react';

// Tipos de validación
export type ValidationResult = {
  isValid: boolean;
  message: string;
};

// Tipo para la configuración de validación
export type FieldValidationConfig = {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  length?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  patternMessage?: string;
};

// Configuración de validaciones por campo
export const ValidationConfig: Record<string, FieldValidationConfig> = {
  // Tab Personas
  representanteNombres: {
    required: false,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    patternMessage: "El nombre solo debe contener letras y espacios"
  },
  representanteDni: {
    required: false,
    length: 8,
    pattern: /^\d{8}$/,
    patternMessage: "El DNI debe tener exactamente 8 números"
  },
  representanteEmail: {
    required: false,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    patternMessage: "Ingrese un correo electrónico válido"
  },
  representanteTelefono: {
    required: false,
    pattern: /^9\d{8}$/,
    patternMessage: "El teléfono debe empezar con 9 y tener 9 dígitos"
  },
  adminNombre: {
    required: false,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    patternMessage: "El nombre solo debe contener letras y espacios"
  },
  adminDni: {
    required: false,
    length: 8,
    pattern: /^\d{8}$/,
    patternMessage: "El DNI debe tener exactamente 8 números"
  },
  adminEmail: {
    required: false,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    patternMessage: "Ingrese un correo electrónico válido"
  },
  adminTelefono: {
    required: false,
    pattern: /^9\d{8}$/,
    patternMessage: "El teléfono debe empezar con 9 y tener 9 dígitos"
  },
  contadorNombre: {
    required: false,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
    patternMessage: "El nombre solo debe contener letras y espacios"
  },
  contadorDni: {
    required: false,
    length: 8,
    pattern: /^\d{8}$/,
    patternMessage: "El DNI debe tener exactamente 8 números"
  },
  contadorEmail: {
    required: false,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    patternMessage: "Ingrese un correo electrónico válido"
  },
  contadorTelefono: {
    required: false,
    pattern: /^9\d{8}$/,
    patternMessage: "El teléfono debe empezar con 9 y tener 9 dígitos"
  },

  // Tab Comercial
  facturacionAnual: {
    required: false,
    pattern: /^\d{1,3}(,\d{3})*(\.\d{2})?$/,
    patternMessage: "Ingrese un monto válido (ej: 1,500,000 o 1,500,000.00)"
  },
  numTrabajadores: {
    required: false,
    min: 1,
    max: 10000,
    pattern: /^\d+$/,
    patternMessage: "El número de trabajadores debe ser un número entero positivo"
  },
  volumenMensual: {
    required: false,
    pattern: /^\d+$/,
    patternMessage: "El volumen mensual debe ser un número entero"
  },
  metaIngresosMensual: {
    required: false,
    pattern: /^\d{1,3}(,\d{3})*(\.\d{2})?$/,
    patternMessage: "Ingrese un monto válido (ej: 85,000 o 85,000.00)"
  },
  promedioEgresosMensual: {
    required: false,
    pattern: /^\d{1,3}(,\d{3})*(\.\d{2})?$/,
    patternMessage: "Ingrese un monto válido (ej: 35,000 o 35,000.00)"
  },
  porcentajeGastosPersonal: {
    required: false,
    min: 0,
    max: 100,
    pattern: /^\d{1,2}(\.\d{1,2})?$|^100(\.0{1,2})?$/,
    patternMessage: "Ingrese un porcentaje válido entre 0 y 100"
  },
  porcentajeGastosOperativos: {
    required: false,
    min: 0,
    max: 100,
    pattern: /^\d{1,2}(\.\d{1,2})?$|^100(\.0{1,2})?$/,
    patternMessage: "Ingrese un porcentaje válido entre 0 y 100"
  },
  porcentajeRentaAnual: {
    required: false,
    min: 0,
    max: 50,
    pattern: /^\d{1,2}(\.\d{1,2})?$/,
    patternMessage: "Ingrese un porcentaje válido entre 0 y 50"
  },
  sector: {
    required: false,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    patternMessage: "El sector solo debe contener letras y espacios"
  },
  estacionalidad: {
    required: false,
    maxLength: 200,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:-]+$/,
    patternMessage: "Caracteres no válidos en la descripción"
  },

  // Tab Credenciales
  usuarioSol: {
    required: false,
    minLength: 6,
    maxLength: 20,
    pattern: /^[A-Z0-9]+$/,
    patternMessage: "El usuario SOL debe contener solo letras mayúsculas y números"
  },
  claveSol: {
    required: false,
    minLength: 6,
    maxLength: 50,
    patternMessage: "La clave debe tener entre 6 y 50 caracteres"
  },

  // Tab Marcas
  nombreMarca: {
    required: false,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s&.-]+$/,
    patternMessage: "El nombre de marca contiene caracteres no válidos"
  }
};

// Función principal de validación
export const validateField = (fieldName: string, value: any): ValidationResult => {
  const config = ValidationConfig[fieldName];
  
  if (!config) {
    return { isValid: true, message: '' };
  }

  // Convertir valor a string para validación
  const stringValue = String(value || '').trim();

  // Validación de campo requerido
  if (config.required && !stringValue) {
    return { isValid: false, message: 'Este campo es obligatorio' };
  }

  // Si el campo está vacío y no es requerido, es válido
  if (!stringValue) {
    return { isValid: true, message: '' };
  }

  // Validación de longitud mínima
  if (config.minLength && stringValue.length < config.minLength) {
    return { isValid: false, message: `Debe tener al menos ${config.minLength} caracteres` };
  }

  // Validación de longitud máxima
  if (config.maxLength && stringValue.length > config.maxLength) {
    return { isValid: false, message: `No debe superar ${config.maxLength} caracteres` };
  }

  // Validación de longitud exacta
  if (config.length && stringValue.length !== config.length) {
    return { isValid: false, message: `Debe tener exactamente ${config.length} caracteres` };
  }

  // Validación de valor mínimo (para números)
  if (config.min !== undefined) {
    const numValue = parseFloat(stringValue);
    if (isNaN(numValue) || numValue < config.min) {
      return { isValid: false, message: `El valor debe ser mayor o igual a ${config.min}` };
    }
  }

  // Validación de valor máximo (para números)
  if (config.max !== undefined) {
    const numValue = parseFloat(stringValue);
    if (isNaN(numValue) || numValue > config.max) {
      return { isValid: false, message: `El valor debe ser menor o igual a ${config.max}` };
    }
  }

  // Validación de patrón
  if (config.pattern && !config.pattern.test(stringValue)) {
    return { isValid: false, message: config.patternMessage || 'Formato no válido' };
  }

  return { isValid: true, message: '' };
};

// Función para validar múltiples campos
export const validateMultipleFields = (data: Record<string, any>, fieldNames: string[]): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};
  
  fieldNames.forEach(fieldName => {
    results[fieldName] = validateField(fieldName, data[fieldName]);
  });
  
  return results;
};

// Función para validar todo un formulario por tab
export const validateTabFields = (tabName: string, data: Record<string, any>): Record<string, ValidationResult> => {
  let fieldNames: string[] = [];

  switch (tabName) {
    case 'personas':
      fieldNames = [
        'representanteNombres', 'representanteDni', 'representanteEmail', 'representanteTelefono',
        'adminNombre', 'adminDni', 'adminEmail', 'adminTelefono',
        'contadorNombre', 'contadorDni', 'contadorEmail', 'contadorTelefono'
      ];
      break;
    case 'comercial':
      fieldNames = [
        'facturacionAnual', 'numTrabajadores', 'volumenMensual', 'sector', 'estacionalidad',
        'metaIngresosMensual', 'promedioEgresosMensual', 'porcentajeGastosPersonal',
        'porcentajeGastosOperativos', 'porcentajeRentaAnual'
      ];
      break;
    case 'credenciales':
      fieldNames = ['usuarioSol', 'claveSol'];
      break;
    case 'marcas':
      fieldNames = ['nombreMarca'];
      break;
    default:
      return {};
  }

  return validateMultipleFields(data, fieldNames);
};

// Función para verificar si hay errores en un conjunto de validaciones
export const hasValidationErrors = (validations: Record<string, ValidationResult>): boolean => {
  return Object.values(validations).some(validation => !validation.isValid);
};

// Función para obtener solo los errores
export const getValidationErrors = (validations: Record<string, ValidationResult>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(validations).forEach(([field, validation]) => {
    if (!validation.isValid) {
      errors[field] = validation.message;
    }
  });
  
  return errors;
};

// Componente para mostrar mensaje de validación
interface ValidationMessageProps {
  validation: ValidationResult;
  show?: boolean;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ validation, show = true }) => {
  if (!show || validation.isValid || !validation.message) {
    return null;
  }

  return (
    <div className="mt-1 text-xs text-red-600 flex items-start space-x-1">
      <span className="text-red-500 font-bold mt-0.5">•</span>
      <span>{validation.message}</span>
    </div>
  );
};

// Hook personalizado para manejar validaciones en tiempo real
export const useFieldValidation = (fieldName: string, value: any, enabled: boolean = true) => {
  const [validation, setValidation] = React.useState<ValidationResult>({ isValid: true, message: '' });

  React.useEffect(() => {
    if (!enabled) return;
    
    const timer = setTimeout(() => {
      const result = validateField(fieldName, value);
      setValidation(result);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
  }, [fieldName, value, enabled]);

  return validation;
};

// Validaciones específicas para casos especiales
export const customValidations = {
  // Validar RUC peruano
  validateRUC: (ruc: string): ValidationResult => {
    if (!ruc) return { isValid: false, message: 'RUC es obligatorio' };
    if (!/^\d{11}$/.test(ruc)) return { isValid: false, message: 'RUC debe tener 11 dígitos' };
    
    // Validar primer dígito según tipo de contribuyente
    const firstDigit = ruc[0];
    const validFirstDigits = ['1', '2']; // 10: Persona Natural, 20: Persona Jurídica
    
    if (!validFirstDigits.some(valid => ruc.startsWith(valid))) {
      return { isValid: false, message: 'RUC debe empezar con 10 o 20' };
    }
    
    return { isValid: true, message: '' };
  },

  // Validar que los porcentajes no sumen más de 100%
  validatePercentageSum: (percentages: number[], maxSum: number = 100): ValidationResult => {
    const sum = percentages.reduce((acc, curr) => acc + (curr || 0), 0);
    if (sum > maxSum) {
      return { isValid: false, message: `La suma no debe superar ${maxSum}%` };
    }
    return { isValid: true, message: '' };
  },

  // Validar fechas
  validateDate: (dateString: string, format: 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'DD/MM/YYYY'): ValidationResult => {
    if (!dateString) return { isValid: true, message: '' };
    
    let regex: RegExp;
    if (format === 'DD/MM/YYYY') {
      regex = /^\d{2}\/\d{2}\/\d{4}$/;
    } else {
      regex = /^\d{4}-\d{2}-\d{2}$/;
    }
    
    if (!regex.test(dateString)) {
      return { isValid: false, message: `Formato de fecha debe ser ${format}` };
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { isValid: false, message: 'Fecha no válida' };
    }
    
    return { isValid: true, message: '' };
  }
};

// Mensajes de validación en español
export const ValidationMessages = {
  email: 'Ingrese un correo electrónico válido',
  phone: 'Ingrese un número de teléfono válido',
  numeric: 'Este campo debe contener solo números',
  alphanumeric: 'Este campo debe contener solo letras y números',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No debe superar ${max} caracteres`,
  exactLength: (length: number) => `Debe tener exactamente ${length} caracteres`,
  minValue: (min: number) => `El valor debe ser mayor o igual a ${min}`,
  maxValue: (max: number) => `El valor debe ser menor o igual a ${max}`,
  invalidFormat: 'Formato no válido'
};