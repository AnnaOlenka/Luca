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

  const handleDelete = (companyId: string) => {
    const updatedResults = verificationResults.filter(company => company.id !== companyId);
    setVerificationResults(updatedResults);
  };

  const validCompanies = verificationResults.filter(c => c.verified);
  const errorCompanies = verificationResults.filter(c => !c.verified);
  const totalCount = verificationResults.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={!isProcessing ? handleClose : undefined} />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Upload className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold text-left">Importar Empresas por CSV</h2>
                  <p className="text-blue-100">Carga masiva de empresas con sus credenciales</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="text-white hover:bg-blue-700 rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content - Scrolleable */}
          <div className="p-6 flex-1 overflow-y-auto" style={{maxHeight: 'calc(600px - 140px)'}}>
            {step === 'upload' && (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                     1. Descarga la plantilla CSV
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 text-left ">
                    El archivo debe contener las columnas: <strong>RUC, Usuario, Clave SOL</strong>
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Plantilla</span>
                  </button>
                </div>
                <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    2. Sube tu archivo CSV
                  </h3>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors  ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Arrastra tu archivo CSV aquí o haz clic para seleccionar
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Solo archivos .csv</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Seleccionar Archivo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Archivo seleccionado: <strong>{file.name}</strong>
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 'preview' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    3. Empresas a importar ({importedCompanies.length})
                  </h3>
                  <div className="text-sm text-gray-500">
                    Se verificarán las credenciales con SUNAT antes de importar
                  </div>
                </div>

                <div className="max-h-32 overflow-y-auto border rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-center">RUC</th>
                        <th className="p-3 text-center">Usuario SOL</th>
                        <th className="p-3 text-center">Clave SOL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedCompanies.map((company) => (
                        <tr key={company.id} className="border-t">
                          <td className="p-3 font-mono">{company.ruc}</td>
                          <td className="p-3">{company.usuario}</td>
                          <td className="p-3">{'*'.repeat(company.claveSol.length)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Antes de continuar:</p>
                      <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                        <li>Se verificarán las credenciales de cada empresa con SUNAT</li>
                        <li>Solo las empresas con credenciales válidas serán importadas</li>
                        <li>Las empresas inválidas aparecerán en un reporte de errores</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'connecting' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Verificando credenciales con SUNAT...
                </h3>

                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
                  {importedCompanies.map((company, index) => {
                    const result = verificationResults.find(r => r.id === company.id);
                    const isCurrentlyVerifying = currentVerifyingIndex === index;
                    const isCompleted = result !== undefined;
                    const isUpcoming = index > currentVerifyingIndex;

                    return (
                      <div key={company.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {isCurrentlyVerifying ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : isCompleted ? (
                            result.verified ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )
                          ) : isUpcoming ? (
                            <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                          ) : null}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-sm font-medium">{company.ruc}</span>
                            <span className="text-sm text-gray-600">{company.usuario}</span>
                          </div>

                          {isCurrentlyVerifying && (
                            <div className="text-sm text-blue-600 mt-1">
                              Verificando credenciales...
                            </div>
                          )}

                          {result && (
                            <div className="mt-1">
                              {result.verified ? (
                                <div className="text-sm text-green-700">
                                  <div className="font-medium">{result.companyData?.razonSocial}</div>
                                  <div className="text-xs">{result.companyData?.estado} - {result.companyData?.condicion}</div>
                                </div>
                              ) : (
                                <div className="text-sm text-red-700">
                                  <div className="font-medium">Error de verificación</div>
                                  <div className="text-xs">{getDetailedErrorMessage(result)}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 text-right">
                          {isCurrentlyVerifying && (
                            <span className="text-xs text-blue-600">Verificando...</span>
                          )}
                          {result?.verified && (
                            <span className="text-xs text-green-600 font-medium">✓ Válida</span>
                          )}
                          {result && !result.verified && (
                            <span className="text-xs text-red-600 font-medium">✗ Error</span>
                          )}
                          {isUpcoming && (
                            <span className="text-xs text-gray-400">Pendiente</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {verificationResults.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Progreso de verificación</span>
                        <span className="text-gray-600">{totalCount} de {importedCompanies.length} ({Math.round((totalCount / importedCompanies.length) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all bg-blue-600"
                          style={{width: `${(totalCount / importedCompanies.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Verificadas: <strong className="text-green-700">{validCompanies.length}</strong></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Con errores: <strong className="text-red-700">{errorCompanies.length}</strong></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          <span>Procesadas: <strong>{totalCount} de {importedCompanies.length}</strong></span>
                        </div>
                      </div>

                      {!isProcessing && totalCount === importedCompanies.length && (
                        <div className="text-blue-600 font-medium">
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
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  Resultados de la Verificación
                </h3>

                {/* Resumen en 3 columnas - siempre horizontal para ahorrar espacio */}
                <div className="grid grid-cols-3 mb-6 gap-x-12">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-800">{validCompanies.length}</div>
                        <div className="text-xs text-green-700">Válidas</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-800">{errorCompanies.length}</div>
                        <div className="text-xs text-red-700">Con Errores</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-blue-600 mr-2" />
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-800">{totalCount}</div>
                        <div className="text-xs text-blue-700">Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {validCompanies.length > 0 && (
                  <>
                    <h4 className="text-lg font-semibold mb-2 flex items-center space-x-2 text-left">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Empresas Válidas ({validCompanies.length})</span>
                    </h4>
                    <div className="max-h-60 overflow-y-auto border rounded-lg mb-6">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="p-3 text-center">RUC</th>
                            <th className="p-3 text-center">Razón Social</th>
                            <th className="p-3 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validCompanies.map((company) => (
                            <tr key={company.id} className="border-t">
                              <td className="p-3 font-mono">{company.ruc}</td>
                              <td className="p-3">{company.companyData?.razonSocial}</td>
                              <td className="p-3">
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
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
                    <h4 className="text-lg font-semibold mb-2 flex items-center space-x-2 text-left">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span>Empresas con Errores ({errorCompanies.length})</span>
                    </h4>
                    <div className="max-h-60 overflow-y-auto border rounded-lg mb-6">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="p-3 text-center">RUC</th>
                            <th className="p-3 text-center">Usuario</th>
                            <th className="p-3 text-center">Error de Validación</th>
                            <th className="p-3 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errorCompanies.map((company) => (
                            <React.Fragment key={company.id}>
                              <tr className="border-t">
                                <td className="p-3 font-mono">{company.ruc}</td>
                                <td className="p-3">{company.usuario}</td>
                                <td className="p-3 text-red-700">{getDetailedErrorMessage(company)}</td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center space-x-2">
                                    <button
                                      onClick={() => handleEdit(company)}
                                      className="text-blue-600 hover:text-blue-800"
                                      aria-label="Editar"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(company.id)}
                                      className="text-red-600 hover:text-red-800"
                                      aria-label="Eliminar"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {editingCompanyId === company.id && (
                                <tr className="bg-gray-100 border-b-2 border-blue-400">
                                  <td colSpan={4} className="p-4">
                                    <div className="p-4 border rounded-lg bg-white shadow-inner">
                                      <h5 className="text-md font-semibold mb-3">Editar credenciales para {company.ruc}</h5>
                                      <div className="flex flex-col space-y-3">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                                          <input
                                            type="text"
                                            value={editingForm.ruc}
                                            onChange={(e) => setEditingForm({...editingForm, ruc: e.target.value})}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario SOL</label>
                                          <input
                                            type="text"
                                            value={editingForm.usuario}
                                            onChange={(e) => setEditingForm({...editingForm, usuario: e.target.value})}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Clave SOL</label>
                                          <input
                                            type="password"
                                            value={editingForm.claveSol}
                                            onChange={(e) => setEditingForm({...editingForm, claveSol: e.target.value})}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-4">
                                          <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                          >
                                            Cancelar
                                          </button>
                                          <button
                                            onClick={() => handleSaveEdit(company.id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center space-x-2"
                                          >
                                            <Save className="w-4 h-4" />
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
            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={() => handleConnectCompanies(importedCompanies)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Verificar y Conectar Empresas</span>
                </button>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                {errorCompanies.length > 0 && (
                  <button
                    onClick={retryFailedVerifications}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                  >
                    <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>{isProcessing ? 'Reintentando...' : `Reintentar Errores (${errorCompanies.length})`}</span>
                  </button>
                )}

                <button
                  onClick={handleImportValidCompanies}
                  disabled={validCompanies.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Importar Empresas Válidas ({validCompanies.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportCsvModal;