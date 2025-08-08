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
  Loader2
} from 'lucide-react';

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
}

const mockSunatAPI = {
  verificarCredenciales: (ruc: string, usuario: string, clave: string) => {
    return new Promise<{ success: boolean; error?: string; data?: any }>((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Mock validation logic
        const isValidRuc = ruc.length === 11 && /^\d+$/.test(ruc);
        const hasCredentials = usuario && clave;

        if (!isValidRuc) {
          resolve({
            success: false,
            error: 'RUC inválido - debe tener 11 dígitos numéricos'
          });
          return;
        }

        if (!hasCredentials) {
          resolve({
            success: false,
            error: 'Usuario y clave SOL son requeridos'
          });
          return;
        }

        const failingRucs = ['20111111111', '20222222222', '20184452123', '15493998971'];
        if (failingRucs.includes(ruc)) {
          resolve({
            success: false,
            error: 'Credenciales incorrectas - Usuario o clave SOL inválidos'
          });
          return;
        }

        const suspendedRucs = ['20333333333'];
        if (suspendedRucs.includes(ruc)) {
          resolve({
            success: false,
            error: 'RUC suspendido temporalmente por SUNAT'
          });
          return;
        }

        const mockCompanyNames = [
          'COMERCIAL IMPORTADORA DEL SUR S.A.C.',
          'CONSTRUCTORA EDIFICACIONES MODERNAS E.I.R.L.',
          'SERVICIOS TECNOLÓGICOS AVANZADOS S.A.',
          'DISTRIBUIDORA COMERCIAL NORTE S.R.L.',
          'INVERSIONES Y PROYECTOS LIMA S.A.C.'
        ];

        const randomIndex = Math.floor(Math.random() * mockCompanyNames.length);

        resolve({
          success: true,
          data: {
            razonSocial: mockCompanyNames[randomIndex],
            estado: 'ACTIVO',
            condicion: 'HABIDO',
            direccion: `AV. ${['PRINCIPAL', 'COMERCIAL', 'INDUSTRIAL', 'CENTRAL'][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 999) + 100}`,
            distrito: 'LIMA',
            actividadPrincipal: '4711 - VENTA AL POR MENOR EN COMERCIOS NO ESPECIALIZADOS'
          }
        });
      }, Math.random() * 1000 + 500); // Random delay between 500-1500ms
    });
  }
};

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (companies: any[]) => void;
}

const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importedCompanies, setImportedCompanies] = useState<ImportedCompany[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'connecting' | 'results'>('upload');
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [currentVerifyingIndex, setCurrentVerifyingIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    for (let i = 0; i < companiesToVerify.length; i++) {
      setCurrentVerifyingIndex(i);
      const company = companiesToVerify[i];

      try {
        const verification = await mockSunatAPI.verificarCredenciales(
          company.ruc,
          company.usuario,
          company.claveSol
        );

        const result: VerificationResult = {
          ...company,
          verified: verification.success,
          error: verification.success ? undefined : verification.error,
          companyData: verification.success ? verification.data : undefined,
          status: verification.success ? 'success' : 'error'
        };

        results.push(result);
        setVerificationResults([...results]);

      } catch (error) {
        const result: VerificationResult = {
          ...company,
          verified: false,
          error: 'Error de conexión con SUNAT',
          companyData: undefined,
          status: 'error'
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
  };

  const handleClose = () => {
    if (isProcessing) return;
    onClose();
    resetModal();
  };

  const downloadTemplate = () => {
    const csvContent = "RUC,Usuario,Clave SOL\n20123456789,usuario1,clave123\n20987654321,usuario2,clave456\n20111111111,usuariomal,clavemal\n20333333333,usuariosus,clavesus";
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
            status: verification.success ? 'success' : 'error'
          };
          setVerificationResults([...updatedResults]);
        } catch (error) {
          updatedResults[i] = {
            ...updatedResults[i],
            verified: false,
            error: 'Error de conexión con SUNAT',
            status: 'error'
          };
          setVerificationResults([...updatedResults]);
        }
      }
    }
    setIsProcessing(false);
  };

  const validCompanies = verificationResults.filter(c => c.verified);
  const errorCompanies = verificationResults.filter(c => !c.verified);
  const totalCount = verificationResults.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={!isProcessing ? handleClose : undefined} />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {/* Content */}
          <div className="p-6">
            {step === 'upload' && (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                    Descarga la plantilla CSV
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
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                    Sube tu archivo CSV
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
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                    Empresas a importar ({importedCompanies.length})
                  </h3>
                  <div className="text-sm text-gray-500">
                    Se verificarán las credenciales con SUNAT antes de importar
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">RUC</th>
                        <th className="p-3 text-left">Usuario SOL</th>
                        <th className="p-3 text-left">Clave SOL</th>
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

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
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

                <div className="flex justify-end">
                  <button
                    onClick={() => handleConnectCompanies(importedCompanies)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    disabled={isProcessing}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Verificar y Conectar Empresas</span>
                  </button>
                </div>
              </div>
            )}

            {step === 'connecting' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">4</span>
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
                                  <div className="text-xs">{result.error}</div>
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
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">✓</span>
                  Resultados de la Verificación
                </h3>

                {/* Resumen en 3 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-green-800">{validCompanies.length}</div>
                        <div className="text-sm text-green-700">Empresas Válidas</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-red-800">{errorCompanies.length}</div>
                        <div className="text-sm text-red-700">Con Errores</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileCheck className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-blue-800">{totalCount}</div>
                        <div className="text-sm text-blue-700">Total Procesadas</div>
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
                            <th className="p-3 text-left">RUC</th>
                            <th className="p-3 text-left">Razón Social</th>
                            <th className="p-3 text-left">Estado</th>
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
                            <th className="p-3 text-left">RUC</th>
                            <th className="p-3 text-left">Usuario</th>
                            <th className="p-3 text-left">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errorCompanies.map((company) => (
                            <tr key={company.id} className="border-t">
                              <td className="p-3 font-mono">{company.ruc}</td>
                              <td className="p-3">{company.usuario}</td>
                              <td className="p-3 text-red-700">{company.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 mt-4">
                  {errorCompanies.length > 0 && (
                    <button
                      onClick={retryFailedVerifications}
                      className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{isProcessing ? 'Reintentando...' : `Reintentar Errores (${errorCompanies.length})`}</span>
                    </button>
                  )}
                  {validCompanies.length > 0 && (
                    <button
                      onClick={handleImportValidCompanies}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      <Save className="w-4 h-4" />
                      <span>Importar Solo Empresas Válidas ({validCompanies.length})</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCsvModal;