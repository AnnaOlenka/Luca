import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Shield,
  FileCheck,
  RefreshCw,
  AlertTriangle,
  Save,
  Loader2,
  Trash2,
  Edit
} from 'lucide-react';
import validCredentialsData from '../../data/validCredentials.json';

interface ImportedCompany {
  id: string;
  ruc: string;
  usuario: string;
  claveSol: string;
}

interface VerificationResult extends ImportedCompany {
  verified: boolean;
  error?: string;
  companyData?: {
    razonSocial: string;
    estado: string;
    condicion: string;
    direccion: string;
    actividadPrincipal: string;
  };
  status: 'idle' | 'pending' | 'success' | 'error';
  validationState?: {
    ruc: 'valid' | 'invalid' | 'duplicate' | 'inactive' | 'validating' | 'error_conexion' | null;
    credentials: 'valid' | 'invalid' | 'validating' | 'error_conexion' | null;
  };
}

const mockSunatAPI = {
  verificarCredenciales: (ruc: string, usuario: string, clave: string, existingRucs: string[] = []) => {
    return new Promise<{ success: boolean; error?: string; data?: any; validationState?: any }>((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Validar formato básico del RUC
        const isValidRucFormat = ruc.length === 11 && /^\d+$/.test(ruc);
        const hasCredentials = usuario.trim().length > 0 && clave.trim().length > 0;

        // 1. Validar formato de RUC
        if (!isValidRucFormat) {
          resolve({
            success: false,
            error: 'RUC inválido - debe tener 11 dígitos numéricos',
            validationState: {
              ruc: 'invalid',
              credentials: null
            }
          });
          return;
        }

        // 2. Validar que existan credenciales
        if (!hasCredentials) {
          const errorMsg = !usuario.trim() && !clave.trim() 
            ? 'Usuario y clave SOL son requeridos'
            : !usuario.trim() 
            ? 'Usuario SOL requerido'
            : 'Clave SOL requerida';
          
          resolve({
            success: false,
            error: errorMsg,
            validationState: {
              ruc: 'valid',
              credentials: 'invalid'
            }
          });
          return;
        }

        // 3. Buscar RUC en validCredentials.json
        const validRuc = validCredentialsData.validRucs.find(r => r.ruc === ruc);
        
        if (!validRuc) {
          // RUC no existe en SUNAT
          resolve({
            success: false,
            error: 'RUC inválido o no existe en SUNAT',
            validationState: {
              ruc: 'invalid',
              credentials: null
            }
          });
          return;
        }

        // 4. Verificar si el RUC simula error de conexión
        if (validRuc.status === 'error_conexion') {
          resolve({
            success: false,
            error: 'Error de conexión con SUNAT - Intente nuevamente',
            validationState: {
              ruc: 'error_conexion',
              credentials: 'error_conexion'
            }
          });
          return;
        }

        // 5. Verificar si el RUC está inactivo
        if (validRuc.status === 'inactive') {
          resolve({
            success: false,
            error: 'Empresa inactiva en SUNAT (se puede verificar con credenciales)',
            validationState: {
              ruc: 'inactive',
              credentials: null
            }
          });
          return;
        }

        // 6. Verificar RUC duplicado en el sistema
        if (existingRucs && existingRucs.includes(ruc)) {
          resolve({
            success: false,
            error: 'Este RUC ya está registrado en el sistema',
            validationState: {
              ruc: 'duplicate',
              credentials: null
            }
          });
          return;
        }
        
        // 7. Verificar credenciales
        const validCredential = validCredentialsData.validCredentials.find(
          c => c.solUser === usuario && c.solPassword === clave
        );

        if (!validCredential) {
          // Credenciales inválidas
          resolve({
            success: false,
            error: 'Usuario o contraseña SOL incorrectos',
            validationState: {
              ruc: validRuc.status === 'active' ? 'valid' : 'inactive',
              credentials: 'invalid'
            }
          });
          return;
        }

        // 8. Simular error de conexión específico para ciertas credenciales
        if (usuario === 'CONEXION01' || usuario === 'TIMEOUT07') {
          resolve({
            success: false,
            error: 'Error de conexión con SUNAT al validar credenciales',
            validationState: {
              ruc: 'valid',
              credentials: 'error_conexion'
            }
          });
          return;
        }

        // 9. Éxito - RUC válido y credenciales correctas
        resolve({
          success: true,
          data: {
            razonSocial: validRuc.businessName,
            estado: validRuc.sunatStatus,
            condicion: validRuc.sunatCondition,
            direccion: `AV. ${['PRINCIPAL', 'COMERCIAL', 'INDUSTRIAL', 'CENTRAL'][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 999) + 100}`,
            distrito: 'LIMA',
            actividadPrincipal: '4711 - VENTA AL POR MENOR EN COMERCIOS NO ESPECIALIZADOS'
          },
          validationState: {
            ruc: validRuc.status === 'active' ? 'valid' : 'inactive',
            credentials: 'valid'
          }
        });
      }, Math.random() * 1000 + 500); // Random delay between 500-1500ms
    });
  }
};

// Función para generar mensajes de error más descriptivos basados en validationState
const getDetailedErrorMessage = (company: VerificationResult) => {
  const { ruc, usuario, claveSol, validationState, error } = company;
  
  const hasRuc = ruc.trim().length > 0;
  const hasValidRuc = hasRuc && ruc.trim().length === 11 && /^\d+$/.test(ruc.trim());
  const hasUser = usuario.trim().length > 0;
  const hasPassword = claveSol.trim().length > 0;
  
  // Si tenemos validationState, usar esa información para generar mensajes específicos
  if (validationState) {
    const { ruc: rucState, credentials: credState } = validationState;
    
    // Errores de RUC
    if (rucState === 'invalid') {
      if (!hasValidRuc) {
        return 'RUC debe tener 11 dígitos numéricos';
      }
      return 'RUC inválido o no existe en SUNAT';
    }
    if (rucState === 'duplicate') {
      return 'Este RUC ya está registrado en el sistema';
    }
    if (rucState === 'inactive') {
      return 'Empresa inactiva en SUNAT (se puede verificar con credenciales)';
    }
    if (rucState === 'error_conexion') {
      return 'Error de conexión con SUNAT al validar RUC';
    }
    
    // Errores de credenciales cuando RUC es válido
    if (rucState === 'valid' && credState === 'invalid') {
      if (!hasUser && !hasPassword) {
        return 'Usuario y contraseña SOL son requeridos';
      }
      if (!hasUser) {
        return 'Usuario SOL requerido';
      }
      if (!hasPassword) {
        return 'Contraseña SOL requerida';
      }
      return 'Usuario o contraseña SOL incorrectos';
    }
    if (credState === 'error_conexion') {
      return 'Error de conexión con SUNAT al validar credenciales';
    }
  }
  
  // Fallback a validaciones básicas si no hay validationState
  if (!hasRuc) {
    return 'RUC requerido';
  }
  if (!hasValidRuc) {
    return 'RUC debe tener 11 dígitos numéricos';
  }
  if (!hasUser) {
    return 'Usuario SOL requerido';
  }
  if (!hasPassword) {
    return 'Contraseña SOL requerida';
  }
  
  // Usar el error específico del API como fallback
  return error || 'Error de validación';
};

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (companies: any[]) => void;
  existingRucs?: string[]; // RUCs ya existentes en el sistema
}

const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ isOpen, onClose, onImportSuccess, existingRucs = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importedCompanies, setImportedCompanies] = useState<ImportedCompany[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'connecting' | 'results'>('upload');
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [currentVerifyingIndex, setCurrentVerifyingIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({
    ruc: '',
    usuario: '',
    claveSol: ''
  });
  const [editingErrors, setEditingErrors] = useState({
  ruc: '',
  usuario: '',
  claveSol: ''
});

  // Estilos CSS responsivos
  const styles = `
    .import-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
    .import-modal-container { background-color: white; border-radius: 0.75rem; width: 100%; max-width: 56rem; max-height: 90vh; height: 37.5rem; min-height: 37.5rem; display: flex; flex-direction: column; box-shadow: 0 1.25rem 1.5625rem -0.3125rem rgba(0, 0, 0, 0.1), 0 0.625rem 0.625rem -0.3125rem rgba(0, 0, 0, 0.04); overflow: hidden; z-index: 10000; position: relative; }
    .import-modal-header { background-color: #2563eb; color: white; padding: 1.5rem; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; position: sticky; top: 0; z-index: 10; }
    .import-modal-title { font-size: 1.25rem; font-weight: 700; text-align: left; }
    .import-modal-subtitle { color: #bfdbfe; font-size: 0.875rem; margin-top: 0.25rem; }
    .import-modal-close-btn { color: white; padding: 0.5rem; border-radius: 0.5rem; transition: background-color 0.2s; border: none; background: none; cursor: pointer; }
    .import-modal-close-btn:hover { background-color: #1d4ed8; }
    .import-modal-close-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .import-modal-content { flex: 1; overflow-y: auto; padding: 1.5rem; }
    .import-modal-footer { border-top: 1px solid #e5e7eb; padding: 1rem; background-color: #f9fafb; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
    .import-modal-btn-primary { background-color: #2563eb; color: white; padding: 0.5rem 1.5rem; justify-content: center; margin: 0 auto; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .import-modal-btn-primary:hover { background-color: #1d4ed8; }
    .import-modal-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .import-modal-btn-secondary { background-color: #6b7280; color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .import-modal-btn-secondary:hover { background-color: #4b5563; }
    .import-modal-btn-green { background-color: #16a34a; color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .import-modal-btn-green:hover { background-color: #15803d; }
    .import-modal-btn-yellow { background-color: #eab308; color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .import-modal-btn-yellow:hover { background-color: #ca8a04; }
    .import-modal-btn-simple { color: #2563eb; border: none; background: none; cursor: pointer; transition: color 0.2s; }
    .import-modal-btn-simple:hover { color: #1d4ed8; }
    .import-modal-btn-simple-red { color: #dc2626; border: none; background: none; cursor: pointer; transition: color 0.2s; }
    .import-modal-btn-simple-red:hover { color: #b91c1c; }
    .import-modal-section { margin-bottom: 1.5rem; padding: 1rem; background-color: #f9fafb; border-radius: 0.5rem; }
    .import-modal-drag-area { border: 2px dashed #d1d5db; border-radius: 0.5rem; padding: 2rem; text-align: center; transition: all 0.2s; }
    .import-modal-drag-area.active { border-color: #2563eb; background-color: #eff6ff; }
    .import-modal-drag-area:hover { border-color: #9ca3af; }
    .import-modal-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .import-modal-table th, .import-modal-table td { padding: 0.75rem; text-align: center; border-bottom: 1px solid #e5e7eb; }
    .import-modal-table th { background-color: #f9fafb; font-weight: 500; color: #374151; position: sticky; top: 0; }
    .import-modal-table-container { max-height: 16rem; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 1rem; }
    .import-modal-progress-bar { width: 100%; background-color: #e5e7eb; border-radius: 9999px; height: 0.75rem; }
    .import-modal-progress-fill { height: 0.75rem; border-radius: 9999px; transition: all 0.3s; background-color: #2563eb; }
    .import-modal-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; margin-bottom: 1.5rem; }
    .import-modal-summary-card { border-radius: 0.5rem; padding: 0.75rem; display: flex; align-items: center; justify-content: center; }
    .import-modal-summary-card.green { background-color: #f0fdf4; border: 1px solid #bbf7d0; }
    .import-modal-summary-card.red { background-color: #fef2f2; border: 1px solid #fecaca; }
    .import-modal-summary-card.blue { background-color: #eff6ff; border: 1px solid #bfdbfe; }
    .import-modal-form-group { margin-bottom: 0.75rem; }
    .import-modal-form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
    .import-modal-form-input { width: 100%; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); font-size: 0.875rem; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; }
    .import-modal-form-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
    .import-modal-form-input.error { border-color: #dc2626; }
    .import-modal-form-input.error:focus { border-color: #dc2626; box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2); }
    .import-modal-error-text { margin-top: 0.25rem; font-size: 0.875rem; color: #dc2626; }
    .import-modal-edit-form { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background-color: white; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .import-modal-alert { padding: 1rem; border-radius: 0.5rem; border: 1px solid #fbbf24; background-color: #fffbeb; display: flex; align-items: flex-start; }
    .import-modal-verification-item { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 0.5rem; }
    .import-modal-spinner { width: 1.25rem; height: 1.25rem; border: 2px solid #2563eb; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; }
    .import-modal-hidden { display: none; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 48rem) {
      .import-modal-backdrop { padding: 0.5rem; }
      .import-modal-container { height: 90vh; min-height: 90vh; }
      .import-modal-header { padding: 1rem; }
      .import-modal-title { font-size: 1.125rem; }
      .import-modal-content { padding: 1rem; }
      .import-modal-footer { padding: 0.75rem; }
      .import-modal-summary-grid { grid-template-columns: 1fr; gap: 1rem; }
    }
    @media (max-width: 30rem) {
      .import-modal-container { max-width: 95vw; }
      .import-modal-drag-area { padding: 1.5rem; }
      .import-modal-table th, .import-modal-table td { padding: 0.5rem; font-size: 0.75rem; }
    }
  `;

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      alert('Por favor selecciona un archivo CSV válido');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('El archivo CSV debe contener al menos una fila de datos además de la cabecera');
        setIsProcessing(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const expectedHeaders = ['ruc', 'usuario', 'clave sol'];

      const hasValidHeaders = expectedHeaders.every(header =>
        headers.includes(header) || headers.includes(header.replace(' ', ''))
      );

      if (!hasValidHeaders) {
        alert('El archivo CSV debe contener las columnas: RUC, Usuario, Clave SOL');
        setIsProcessing(false);
        return;
      }

      const companies: ImportedCompany[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= 3 && values[0]) {
          companies.push({
            id: `temp-${i}`,
            ruc: values[0],
            usuario: values[1] || '',
            claveSol: values[2] || ''
          });
        }
      }

      setImportedCompanies(companies);
      setStep('preview');
      setIsProcessing(false);
    };

    reader.readAsText(csvFile);
  };

  const handleConnectCompanies = async (companiesToVerify: ImportedCompany[]) => {
    setStep('connecting');
    setIsProcessing(true);
    setVerificationResults([]);
    setCurrentVerifyingIndex(0);

    const results: VerificationResult[] = [];
    const processedRucs = new Set<string>(); // Para detectar duplicados dentro del mismo archivo

    for (let i = 0; i < companiesToVerify.length; i++) {
      setCurrentVerifyingIndex(i);
      const company = companiesToVerify[i];

      // Verificar duplicados dentro del mismo archivo CSV
      if (processedRucs.has(company.ruc)) {
        const result: VerificationResult = {
          ...company,
          verified: false,
          error: 'RUC duplicado en el archivo CSV',
          status: 'error',
          validationState: {
            ruc: 'duplicate',
            credentials: null
          }
        };
        results.push(result);
        setVerificationResults([...results]);
        continue;
      }
      
      processedRucs.add(company.ruc);

      try {
        // Crear una copia del arreglo existingRucs que incluya los RUCs ya existentes
        const allExistingRucs = [...existingRucs];
        
        const verification = await mockSunatAPI.verificarCredenciales(
          company.ruc,
          company.usuario,
          company.claveSol,
          allExistingRucs
        );

        const result: VerificationResult = {
          ...company,
          verified: verification.success,
          error: verification.success ? undefined : verification.error,
          companyData: verification.success ? verification.data : undefined,
          status: verification.success ? 'success' : 'error',
          validationState: verification.validationState || null
        };

        results.push(result);
        setVerificationResults([...results]);

      } catch (error) {
        const result: VerificationResult = {
          ...company,
          verified: false,
          error: 'Error de conexión con SUNAT',
          companyData: undefined,
          status: 'error',
          validationState: {
            ruc: 'error_conexion',
            credentials: 'error_conexion'
          }
        };
        results.push(result);
        setVerificationResults([...results]);
      }
    }

    setCurrentVerifyingIndex(-1);
    setIsProcessing(false);
    setStep('results');
  };

  const handleImportValidCompanies = () => {
    const validCompanies = verificationResults
      .filter(company => company.verified)
      .map((company, index) => ({
        id: `imported-${Date.now()}-${index}`,
        nombre: company.companyData?.razonSocial || `Empresa ${company.ruc}`,
        ruc: company.ruc,
        estado: company.companyData?.estado || 'ACTIVO',
        condicion: company.companyData?.condicion || 'HABIDO',
        completitud: 75,
        razonSocial: company.companyData?.razonSocial || `EMPRESA ${company.ruc} S.A.C.`,
        nombreComercial: company.companyData?.razonSocial || `EMPRESA ${company.ruc}`,
        direccion: company.companyData?.direccion || "AV. IMPORTACION S/N",
        provincia: "LIMA",
        departamento: "LIMA",
        representanteNombres: "REPRESENTANTE",
        representanteApellidos: "LEGAL",
        actividadPrincipal: company.companyData?.actividadPrincipal || "4711 - COMERCIO AL POR MENOR",
        usuarioSol: company.usuario,
        claveSol: company.claveSol,
        personas: [
          { id: 1, nombre: "Representante Legal", iniciales: "RL", cargo: "Gerente", estado: "activo" }
        ],
        tendencia: {
          porcentaje: Math.random() > 0.5 ? Math.round(Math.random() * 15 + 5) : -Math.round(Math.random() * 10 + 2),
          direccion: Math.random() > 0.5 ? "up" : "down",
          datos: Array.from({ length: 6 }, () => Math.round(Math.random() * 40 + 30))
        },
        semaforoTributario: { estado: "green", texto: "Sin observaciones" },
        proximaObligacion: { tipo: "IGV", mes: "Setiembre", diasRestantes: Math.round(Math.random() * 25 + 5), vencido: false }
      }));

    if (validCompanies.length > 0) {
      onImportSuccess(validCompanies);
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1500);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setImportedCompanies([]);
    setVerificationResults([]);
    setCurrentVerifyingIndex(-1);
    setIsProcessing(false);
    setDragActive(false);
    setEditingCompanyId(null);
  };

  const handleClose = () => {
    if (isProcessing) return;
    onClose();
    resetModal();
  };

  const downloadTemplate = () => {
    // Usar datos del archivo validCredentials.json para la plantilla
    let csvContent = "RUC,Usuario,Clave SOL\n";
    
    // Añadir algunos ejemplos válidos
    csvContent += "20123456789,ROCAFUER01,password123\n";
    csvContent += "20987654321,ADMIN001,Sol123456\n";
    csvContent += "20654321987,USER002,Clave789\n";
    
    // Añadir algunos ejemplos con errores para demostrar validaciones
    csvContent += "20456789123,CONTA03,Pass2024\n"; // RUC inactivo
    csvContent += "20888999000,GERENTE4,Sol987654\n"; // RUC inactivo
    csvContent += "20999888777,CONEXION01,ErrorConn123\n"; // Error de conexión
    csvContent += "12345678901,USUARIO_MAL,clave_incorrecta\n"; // RUC y credenciales inválidas
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_empresas.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const retryFailedVerifications = async () => {
    setIsProcessing(true);
    const failedCompanies = verificationResults.filter(c => c.status === 'error');

    if (failedCompanies.length === 0) {
      alert("No hay empresas con errores para reintentar.");
      setIsProcessing(false);
      return;
    }

    const updatedResults = [...verificationResults];

    for (let i = 0; i < updatedResults.length; i++) {
      if (updatedResults[i].status === 'error') {
        const company = updatedResults[i];
        updatedResults[i].status = 'pending';
        setVerificationResults([...updatedResults]);

        try {
          const verification = await mockSunatAPI.verificarCredenciales(
            company.ruc,
            company.usuario,
            company.claveSol
          );

          updatedResults[i] = {
            ...updatedResults[i],
            verified: verification.success,
            error: verification.success ? undefined : verification.error,
            companyData: verification.success ? verification.data : undefined,
            status: verification.success ? 'success' : 'error',
            validationState: verification.validationState || null
          };
          setVerificationResults([...updatedResults]);
        } catch (error) {
          updatedResults[i] = {
            ...updatedResults[i],
            verified: false,
            error: 'Error de conexión con SUNAT',
            status: 'error',
            validationState: {
              ruc: 'error_conexion',
              credentials: 'error_conexion'
            }
          };
          setVerificationResults([...updatedResults]);
        }
      }
    }
    setIsProcessing(false);
  };

  const handleEdit = (company: VerificationResult) => {
    setEditingCompanyId(company.id);
    setEditingForm({
      ruc: company.ruc,
      usuario: company.usuario,
      claveSol: company.claveSol,
    });
  };

  const handleSaveEdit = (companyId: string) => {
    // AÑADIR ESTA VALIDACIÓN ANTES DE LA LÓGICA EXISTENTE:
      const ruc = editingForm.ruc.trim();
      const usuario = editingForm.usuario.trim();
      const claveSol = editingForm.claveSol.trim();

      // Validar que todos los campos sean obligatorios
      if (!ruc || !usuario || !claveSol) {
        alert('Todos los campos son obligatorios');
        return;
      }

      // Validar formato del RUC (11 dígitos numéricos)
      if (ruc.length !== 11 || !/^\d+$/.test(ruc)) {
        alert('El RUC debe tener exactamente 11 dígitos numéricos');
        return;
      }
    const updatedResults = verificationResults.map(company => {
      if (company.id === companyId) {
        return {
          ...company,
          ruc: editingForm.ruc,
          usuario: editingForm.usuario,
          claveSol: editingForm.claveSol,
          status: 'error',
          error: 'Credenciales actualizadas. Por favor, reintente la verificación.',
          verified: false,
          companyData: undefined,
          validationState: {
            ruc: null,
            credentials: null
          }
        } as VerificationResult;
      }
      return company;
    });

    setVerificationResults(updatedResults);
    setEditingCompanyId(null);
  };

  const handleCancelEdit = () => {
    setEditingCompanyId(null);
  };

  const validateEditingField = (field: string, value: string) => {
  let error = '';
  
  if (!value.trim()) {
    error = 'Este campo es obligatorio';
  } else if (field === 'ruc') {
    if (value.length !== 11) {
      error = 'El RUC debe tener exactamente 11 dígitos';
    } else if (!/^\d+$/.test(value)) {
      error = 'El RUC solo debe contener números';
    }
  }
  
  setEditingErrors(prev => ({
    ...prev,
    [field]: error
  }));
  
  return error === '';
};

  const handleDelete = (companyId: string) => {
    const updatedResults = verificationResults.filter(company => company.id !== companyId);
    setVerificationResults(updatedResults);
  };

  const validCompanies = verificationResults.filter(c => c.verified);
  const errorCompanies = verificationResults.filter(c => !c.verified);
  const totalCount = verificationResults.length;

  return (
    <>
      <style>{styles}</style>
      <div className="import-modal-backdrop" onClick={!isProcessing ? handleClose : undefined}>
        <div className="import-modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="import-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Upload style={{ width: '1.5rem', height: '1.5rem' }} />
                <div>
                  <h2 className="import-modal-title">Importar Empresas por CSV</h2>
                  <p className="import-modal-subtitle">Carga masiva de empresas con sus credenciales</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="import-modal-close-btn"
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          </div>

          {/* Content - Scrolleable */}
          <div className="import-modal-content">
            {step === 'upload' && (
              <>
                <div className="import-modal-section">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                     1. Descarga la plantilla CSV
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', textAlign: 'left' }}>
                    El archivo debe contener las columnas: <strong>RUC, Usuario, Clave SOL</strong>
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="import-modal-btn-green"
                  >
                    <Download style={{ width: '1rem', height: '1rem' }} />
                    <span>Descargar Plantilla</span>
                  </button>
                </div>
                <div className="import-modal-section">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    2. Sube tu archivo CSV
                  </h3>
                  <div
                    className={`import-modal-drag-area ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' }}>
                      Arrastra tu archivo CSV aquí o haz clic para seleccionar
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Solo archivos .csv</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="import-modal-btn-primary"
                    >
                      Seleccionar Archivo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="import-modal-hidden"
                    />
                  </div>
                  {file && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      Archivo seleccionado: <strong>{file.name}</strong>
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 'preview' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    3. Empresas a importar ({importedCompanies.length})
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Se verificarán las credenciales con SUNAT antes de importar
                  </div>
                </div>

                <div className="import-modal-table-container">
                  <table className="import-modal-table">
                    <thead>
                      <tr>
                        <th>RUC</th>
                        <th>Usuario SOL</th>
                        <th>Clave SOL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedCompanies.map((company) => (
                        <tr key={company.id}>
                          <td style={{ fontFamily: 'monospace' }}>{company.ruc}</td>
                          <td>{company.usuario}</td>
                          <td>{'*'.repeat(company.claveSol.length)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="import-modal-alert">
                  <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#d97706', marginRight: '0.5rem', marginTop: '0.125rem' }} />
                  <div style={{ fontSize: '0.875rem' }}>
                    <p style={{ fontWeight: 500, color: '#92400e', marginBottom: '0.25rem' }}>Antes de continuar:</p>
                    <ul style={{ color: '#a16207', lineHeight: 1.5, listStyleType: 'disc', paddingLeft: '1.25rem' }}>
                      <li>Se verificarán las credenciales de cada empresa con SUNAT</li>
                      <li>Solo las empresas con credenciales válidas serán importadas</li>
                      <li>Las empresas inválidas aparecerán en un reporte de errores</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {step === 'connecting' && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  Verificando credenciales con SUNAT...
                </h3>

                <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {importedCompanies.map((company, index) => {
                    const result = verificationResults.find(r => r.id === company.id);
                    const isCurrentlyVerifying = currentVerifyingIndex === index;
                    const isCompleted = result !== undefined;
                    const isUpcoming = index > currentVerifyingIndex;

                    return (
                      <div key={company.id} className="import-modal-verification-item">
                        <div style={{ flexShrink: 0, width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isCurrentlyVerifying ? (
                            <div className="import-modal-spinner"></div>
                          ) : isCompleted ? (
                            result.verified ? (
                              <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
                            ) : (
                              <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
                            )
                          ) : isUpcoming ? (
                            <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', backgroundColor: '#e5e7eb' }}></div>
                          ) : null}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 500 }}>{company.ruc}</span>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{company.usuario}</span>
                          </div>

                          {isCurrentlyVerifying && (
                            <div style={{ fontSize: '0.875rem', color: '#2563eb', marginTop: '0.25rem' }}>
                              Verificando credenciales...
                            </div>
                          )}

                          {result && (
                            <div style={{ marginTop: '0.25rem' }}>
                              {result.verified ? (
                                <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                                  <div style={{ fontWeight: 500 }}>{result.companyData?.razonSocial}</div>
                                  <div style={{ fontSize: '0.75rem' }}>{result.companyData?.estado} - {result.companyData?.condicion}</div>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                                  <div style={{ fontWeight: 500 }}>Error de verificación</div>
                                  <div style={{ fontSize: '0.75rem' }}>{getDetailedErrorMessage(result)}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          {isCurrentlyVerifying && (
                            <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Verificando...</span>
                          )}
                          {result?.verified && (
                            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}>✓ Válida</span>
                          )}
                          {result && !result.verified && (
                            <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>✗ Error</span>
                          )}
                          {isUpcoming && (
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Pendiente</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {verificationResults.length > 0 && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 500, color: '#374151' }}>Progreso de verificación</span>
                        <span style={{ color: '#6b7280' }}>{totalCount} de {importedCompanies.length} ({Math.round((totalCount / importedCompanies.length) * 100)}%)</span>
                      </div>
                      <div className="import-modal-progress-bar">
                        <div
                          className="import-modal-progress-fill"
                          style={{width: `${(totalCount / importedCompanies.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                          <span>Verificadas: <strong style={{ color: '#15803d' }}>{validCompanies.length}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                          <span>Con errores: <strong style={{ color: '#dc2626' }}>{errorCompanies.length}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#d1d5db', borderRadius: '50%' }}></div>
                          <span>Procesadas: <strong>{totalCount} de {importedCompanies.length}</strong></span>
                        </div>
                      </div>

                      {!isProcessing && totalCount === importedCompanies.length && (
                        <div style={{ color: '#2563eb', fontWeight: 500 }}>
                          Verificación completada
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'results' && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                  Resultados de la Verificación
                </h3>

                {/* Resumen en 3 columnas - siempre horizontal para ahorrar espacio */}
                <div className="import-modal-summary-grid">
                  <div className="import-modal-summary-card green">
                    <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a', marginRight: '0.5rem' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>{validCompanies.length}</div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Válidas</div>
                    </div>
                  </div>

                  <div className="import-modal-summary-card red">
                    <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626', marginRight: '0.5rem' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b' }}>{errorCompanies.length}</div>
                      <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>Con Errores</div>
                    </div>
                  </div>

                  <div className="import-modal-summary-card blue">
                    <FileCheck style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb', marginRight: '0.5rem' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e40af' }}>{totalCount}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>Total</div>
                    </div>
                  </div>
                </div>

                {validCompanies.length > 0 && (
                  <>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                      <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
                      <span>Empresas Válidas ({validCompanies.length})</span>
                    </h4>
                    <div className="import-modal-table-container">
                      <table className="import-modal-table">
                        <thead>
                          <tr>
                            <th>RUC</th>
                            <th>Razón Social</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validCompanies.map((company) => (
                            <tr key={company.id}>
                              <td style={{ fontFamily: 'monospace' }}>{company.ruc}</td>
                              <td>{company.companyData?.razonSocial}</td>
                              <td>
                                <span style={{ backgroundColor: '#f0fdf4', color: '#166534', fontSize: '0.75rem', fontWeight: 500, padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>
                                  {company.companyData?.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {errorCompanies.length > 0 && (
                  <>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                      <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
                      <span>Empresas con Errores ({errorCompanies.length})</span>
                    </h4>
                    <div className="import-modal-table-container">
                      <table className="import-modal-table">
                        <thead>
                          <tr>
                            <th>RUC</th>
                            <th>Usuario</th>
                            <th>Error de Validación</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errorCompanies.map((company) => (
                            <React.Fragment key={company.id}>
                              <tr>
                                <td style={{ fontFamily: 'monospace' }}>{company.ruc}</td>
                                <td>{company.usuario}</td>
                                <td style={{ color: '#dc2626' }}>{getDetailedErrorMessage(company)}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <button
                                      onClick={() => handleEdit(company)}
                                      className="import-modal-btn-simple"
                                      aria-label="Editar"
                                    >
                                      <Edit style={{ width: '1rem', height: '1rem' }} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(company.id)}
                                      className="import-modal-btn-simple-red"
                                      aria-label="Eliminar"
                                    >
                                      <Trash2 style={{ width: '1rem', height: '1rem' }} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {editingCompanyId === company.id && (
                                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #2563eb' }}>
                                  <td colSpan={4} style={{ padding: '1rem' }}>
                                    <div className="import-modal-edit-form">
                                      <h5 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Editar credenciales para {company.ruc}</h5>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {/* Fila con los 3 inputs */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                          <div className="import-modal-form-group">
                                            <label className="import-modal-form-label">RUC *</label>
                                            <input
                                              type="text"
                                              value={editingForm.ruc}
                                              onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 11) {
                                                  setEditingForm({...editingForm, ruc: value});
                                                  validateEditingField('ruc', value);
                                                }
                                              }}
                                              onBlur={(e) => validateEditingField('ruc', e.target.value)}
                                              className={`import-modal-form-input ${editingErrors.ruc ? 'error' : ''}`}
                                              placeholder="11 dígitos numéricos"
                                              maxLength={11}
                                            />
                                            {editingErrors.ruc && (
                                              <p className="import-modal-error-text">{editingErrors.ruc}</p>
                                            )}
                                          </div>
                                          
                                          <div className="import-modal-form-group">
                                            <label className="import-modal-form-label">Usuario SOL *</label>
                                            <input
                                              type="text"
                                              value={editingForm.usuario}
                                              onChange={(e) => {
                                                setEditingForm({...editingForm, usuario: e.target.value});
                                                validateEditingField('usuario', e.target.value);
                                              }}
                                              onBlur={(e) => validateEditingField('usuario', e.target.value)}
                                              className={`import-modal-form-input ${editingErrors.usuario ? 'error' : ''}`}
                                              placeholder="Usuario SOL"
                                            />
                                            {editingErrors.usuario && (
                                              <p className="import-modal-error-text">{editingErrors.usuario}</p>
                                            )}
                                          </div>
                                          
                                          <div className="import-modal-form-group">
                                            <label className="import-modal-form-label">Clave SOL *</label>
                                            <input
                                              type="password"
                                              value={editingForm.claveSol}
                                              onChange={(e) => {
                                                setEditingForm({...editingForm, claveSol: e.target.value});
                                                validateEditingField('claveSol', e.target.value);
                                              }}
                                              onBlur={(e) => validateEditingField('claveSol', e.target.value)}
                                              className={`import-modal-form-input ${editingErrors.claveSol ? 'error' : ''}`}
                                              placeholder="Clave SOL"
                                            />
                                            {editingErrors.claveSol && (
                                              <p className="import-modal-error-text">{editingErrors.claveSol}</p>
                                            )}
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                                          <button
                                            onClick={handleCancelEdit}
                                            className="import-modal-btn-secondary"
                                          >
                                            Cancelar
                                          </button>
                                            <button
                                              onClick={() => handleSaveEdit(company.id)}
                                              disabled={
                                                !editingForm.ruc.trim() || 
                                                !editingForm.usuario.trim() || 
                                                !editingForm.claveSol.trim() || 
                                                editingForm.ruc.length !== 11 ||
                                                !!editingErrors.ruc || 
                                                !!editingErrors.usuario || 
                                                !!editingErrors.claveSol
                                              }
                                              className="import-modal-btn-primary"
                                              style={{ opacity: (
                                                !editingForm.ruc.trim() || 
                                                !editingForm.usuario.trim() || 
                                                !editingForm.claveSol.trim() || 
                                                editingForm.ruc.length !== 11 ||
                                                !!editingErrors.ruc || 
                                                !!editingErrors.usuario || 
                                                !!editingErrors.claveSol
                                              ) ? 0.5 : 1 }}
                                            >
                                              <Save style={{ width: '1rem', height: '1rem' }} />
                                              <span>Guardar</span>
                                            </button>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          {step === 'preview' && (
            <div className="import-modal-footer">
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleConnectCompanies(importedCompanies)}
                  className="import-modal-btn-primary"
                >
                  <Shield style={{ width: '1rem', height: '1rem' }} />
                  <span>Verificar y Conectar Empresas</span>
                </button>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="import-modal-footer">
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                {errorCompanies.length > 0 && (
                  <button
                    onClick={retryFailedVerifications}
                    className="import-modal-btn-yellow"
                    disabled={isProcessing}
                    style={{ opacity: isProcessing ? 0.5 : 1 }}
                  >
                    <RefreshCw style={{ width: '1rem', height: '1rem', animation: isProcessing ? 'spin 1s linear infinite' : 'none' }} />
                    <span>{isProcessing ? 'Reintentando...' : `Reintentar Errores (${errorCompanies.length})`}</span>
                  </button>
                )}

                <button
                  onClick={handleImportValidCompanies}
                  disabled={validCompanies.length === 0}
                  className="import-modal-btn-green"
                  style={{ opacity: validCompanies.length === 0 ? 0.5 : 1 }}
                >
                  <FileCheck style={{ width: '1rem', height: '1rem' }} />
                  <span>Importar Empresas Válidas ({validCompanies.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImportCsvModal;