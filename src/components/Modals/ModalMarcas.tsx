import React from 'react';
import { X, Award, Download } from 'lucide-react';

// Declaración de tipos para jsPDF
declare global {
  interface Window {
    jspdf?: any;
  }
}

interface Marca {
  id: string;
  nombre: string;
  numeroResolucion: string;
  fechaResolucion: string;
  claseNiza: string;
  descripcionServicios: string;
  titular: string;
  plazoVigencia: string;
  estado: 'Registrada' | 'En trámite' | 'Vencida' | 'Cancelada';
  baseLegal: string;
}

interface ModalMarcasProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: {
    id: string;
    nombre: string;
    ruc: string;
  } | null;
}

const ModalMarcas: React.FC<ModalMarcasProps> = ({ isOpen, onClose, empresa }) => {
  // Datos de ejemplo para marcas registradas
  const mockMarcasData: Marca[] = [
    {
      id: 'marca-1',
      nombre: 'TECHSOLUTIONS',
      numeroResolucion: '025871-2023/DSD-INDECOPI',
      fechaResolucion: '15/03/2023',
      claseNiza: 'Clase 35',
      descripcionServicios: 'Servicios de publicidad; gestión de negocios comerciales; administración comercial; trabajos de oficina; servicios de consultoría empresarial y organizacional',
      titular: 'Rodriguez Martinez Carlos Alberto (Perú)',
      plazoVigencia: '10 años (15/03/2023 – 15/03/2033)',
      estado: 'Registrada',
      baseLegal: 'Decisión 486, D. Leg. 1033, D. Leg. 1075 y modificatorias'
    },
    {
      id: 'marca-2',
      nombre: 'INNOVASOFT',
      numeroResolucion: '031456-2024/DSD-INDECOPI',
      fechaResolucion: '22/07/2024',
      claseNiza: 'Clase 09',
      descripcionServicios: 'Aparatos e instrumentos científicos, de investigación, de navegación, geodésicos, fotográficos, cinematográficos, audiovisuales, ópticos; software de aplicación informática',
      titular: 'Garcia Fernandez Maria Elena (Perú)',
      plazoVigencia: '10 años (22/07/2024 – 22/07/2034)',
      estado: 'En trámite',
      baseLegal: 'Decisión 486, D. Leg. 1033, D. Leg. 1075 y modificatorias'
    }
  ];

  const downloadMarcasPDF = async () => {
    try {
      // Cargar jsPDF dinámicamente desde el CDN
      if (!window.jspdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => downloadMarcasPDF();
        document.head.appendChild(script);
        return;
      }

      // @ts-ignore - jsPDF se carga globalmente
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Configurar fuente y título
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('REGISTRO DE MARCAS - INDECOPI', 20, 20);
      
      if (empresa) {
        doc.setFontSize(14);
        doc.text(`Empresa: ${empresa.nombre}`, 20, 35);
        doc.text(`RUC: ${empresa.ruc}`, 20, 45);
      }

      let yPosition = 60;

      // Agregar información de cada marca
      mockMarcasData.forEach((marca, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(`${index + 1}. ${marca.nombre}`, 20, yPosition);
        yPosition += 15;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        
        const details = [
          `Número de Resolución: ${marca.numeroResolucion}`,
          `Fecha de Resolución: ${marca.fechaResolucion}`,
          `Clase: ${marca.claseNiza}`,
          `Estado: ${marca.estado}`,
          `Titular: ${marca.titular}`,
          `Plazo de Vigencia: ${marca.plazoVigencia}`,
          `Base Legal: ${marca.baseLegal}`,
          `Descripción: ${marca.descripcionServicios}`
        ];

        details.forEach(detail => {
          const lines = doc.splitTextToSize(detail, 170);
          doc.text(lines, 20, yPosition);
          yPosition += lines.length * 7;
        });

        yPosition += 10;
      });

      // Pie de página
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('Documento generado desde el sistema - ' + new Date().toLocaleDateString(), 20, doc.internal.pageSize.height - 20);

      // Descargar el PDF
      doc.save(`Marcas_${empresa?.nombre}_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtelo nuevamente.');
    }
  };

  if (!isOpen || !empresa) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
          
          {/* Header */}
          <div className="bg-purple-600 text-black p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">Marcas Registradas</h2>
                <p className="text-purple-100 text-sm">
                  {empresa.nombre} - RUC: {empresa.ruc}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadMarcasPDF}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-purple-800 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={onClose}
                className="text-purple-200 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(85vh-140px)] overflow-y-auto">
            {mockMarcasData.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay marcas registradas
                </h3>
                <p className="text-gray-500 text-sm">
                  Esta empresa no tiene marcas registradas en INDECOPI.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {mockMarcasData.map((marca, index) => (
                  <div key={marca.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Marca Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">{marca.nombre}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          marca.estado === 'Registrada' ? 'bg-green-100 text-green-800' :
                          marca.estado === 'En trámite' ? 'bg-yellow-100 text-yellow-800' :
                          marca.estado === 'Vencida' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {marca.estado}
                        </span>
                      </div>
                    </div>

                    {/* Marca Details - Diseño más compacto en 2 columnas */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        
                        {/* Fila 1 */}
                        <div>
                          <label className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                            Número de Resolución
                          </label>
                          <p className="text-left text-gray-900 font-mono text-xs">
                            {marca.numeroResolucion}
                          </p>
                        </div>
                        <div>
                          <label className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                            Fecha de Resolución
                          </label>
                          <p className="text-left text-gray-900">
                            {marca.fechaResolucion}
                          </p>
                        </div>

                        {/* Fila 2 */}
                        <div>
                          <label className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                            Clase (Niza)
                          </label>
                          <p className="text-left text-gray-900 font-medium">
                            {marca.claseNiza}
                          </p>
                        </div>
                        <div>
                          <label className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                            Plazo de Vigencia
                          </label>
                          <p className="text-left text-gray-900">
                            {marca.plazoVigencia}
                          </p>
                        </div>

                        {/* Fila 3 */}
                        <div>
                          <label className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                            Titular
                          </label>
                          <p className="text-left text-gray-900">
                            {marca.titular}
                          </p>
                        </div>
                        <div>
                          <label className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                            Base Legal
                          </label>
                          <p className="text-left text-gray-900 text-xs">
                            {marca.baseLegal}
                          </p>
                        </div>
                      </div>

                      {/* Descripción completa - ancho completo */}
                      <div className="mt-4 col-span-2">
                        <label className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                          Descripción de Productos/Servicios
                        </label>
                        <div className=" bg-gray-900 rounded-lg">
                          <p className="text-left text-gray-900 text-xs leading-relaxed">
                            {marca.descripcionServicios}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Información obtenida de INDECOPI
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalMarcas;