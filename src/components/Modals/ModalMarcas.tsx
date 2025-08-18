import React from 'react';
import { X, Award, Download } from 'lucide-react';

// Declaración de tipos para jsPDF y autoTable
declare global {
  interface Window {
    jspdf?: any;
    autoTable?: any;
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
      // Cargar jsPDF y autoTable dinámicamente desde el CDN
      if (!window.jspdf || !window.autoTable) {
        // Cargar jsPDF primero
        if (!window.jspdf) {
          const jsPDFScript = document.createElement('script');
          jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          
          await new Promise((resolve) => {
            jsPDFScript.onload = resolve;
            document.head.appendChild(jsPDFScript);
          });
        }

        // Cargar autoTable después
        if (!window.autoTable) {
          const autoTableScript = document.createElement('script');
          autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js';
          
          await new Promise((resolve) => {
            autoTableScript.onload = resolve;
            document.head.appendChild(autoTableScript);
          });
        }
      }

      // @ts-ignore - jsPDF se carga globalmente
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      let yPosition = 20;

      // Header del documento con colores corporativos
      doc.setFillColor(76, 29, 149); // Color púrpura del header
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      
      doc.setTextColor(255, 255, 255); // Texto blanco
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('REGISTRO DE MARCAS - INDECOPI', 14, 20);
      
      if (empresa) {
        doc.setFontSize(12);
        doc.text(`Empresa: ${empresa.nombre} - RUC: ${empresa.ruc}`, 14, 30);
      }

      yPosition = 50;

      // Procesar cada marca
      mockMarcasData.forEach((marca, index) => {
        // Verificar espacio disponible
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }

        // Header de la marca
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`${marca.nombre}`, 14, yPosition);
        
        // Badge del estado
        const estadoColor = marca.estado === 'Registrada' ? [34, 197, 94] :
                           marca.estado === 'En trámite' ? [234, 179, 8] :
                           marca.estado === 'Vencida' ? [239, 68, 68] :
                           [107, 114, 128];
        
        const estadoText = marca.estado;
        const estadoWidth = doc.getStringUnitWidth(estadoText) * 8 + 8;
        const estadoX = doc.internal.pageSize.width - 14 - estadoWidth;
        
        doc.setFillColor(estadoColor[0], estadoColor[1], estadoColor[2]);
        doc.roundedRect(estadoX, yPosition - 5, estadoWidth, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(estadoText, estadoX + 4, yPosition);

        yPosition += 15;

        // Crear tabla con el formato exacto del div
        const tableData = [
          ['Número de Resolución', marca.numeroResolucion],
          ['Fecha de Resolución', marca.fechaResolucion],
          ['Clase (Niza)', marca.claseNiza],
          ['Titular', marca.titular],
          ['Plazo de Vigencia', marca.plazoVigencia],
          ['Base Legal', marca.baseLegal],
          ['Descripción de Productos/Servicios', marca.descripcionServicios],
        ];
        
        // @ts-ignore - autoTable se carga globalmente
        doc.autoTable({
          startY: yPosition,
          body: tableData,
          theme: 'plain', // Cambiar de 'grid' a 'plain' para control total
          styles: {
            fontSize: 10,
            cellPadding: 12, // Aumentar padding para coincidir con el diseño
            valign: 'middle',
            lineWidth: 0, // Quitar todos los bordes por defecto
          },
          columnStyles: {
            0: {
              cellWidth: 60,
              fillColor: [249, 250, 251], // bg-gray-50
              textColor: [74, 85, 104], // color: #4a5568
              fontStyle: 'bold',
              halign: 'left',
            },
            1: {
              cellWidth: 120,
              fillColor: [255, 255, 255], // bg-white
              textColor: [26, 32, 44], // color: #1a202c
              fontStyle: 'normal',
              halign: 'left',
            },
          },
          margin: { left: 14, right: 14 },
          // Dibujar bordes manualmente para evitar duplicados
          didDrawCell: function (data: any) {
            const { cell, row, column } = data;
            
            // Dibujar borde superior para todas las celdas
            if (row.index === 0) {
              doc.setDrawColor(229, 231, 235);
              doc.setLineWidth(0.5);
              doc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
            }
            
            // Dibujar borde izquierdo para todas las celdas
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.5);
            doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
            
            // Dibujar borde derecho solo en la última columna
            if (column.index === 1) {
              doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            }
            
            // Dibujar borde inferior para todas las celdas
            doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
            
            // Dibujar borde vertical entre columnas (solo entre columna 0 y 1)
            if (column.index === 0) {
              doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            }
          },
        });

        // @ts-ignore
        yPosition = doc.lastAutoTable.finalY + 15;
      });

      // Footer del documento
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(
          'Información obtenida de INDECOPI - Documento generado el ' + new Date().toLocaleDateString(), 
          14, 
          doc.internal.pageSize.height - 10
        );
        doc.text(
          `Página ${i} de ${pageCount}`, 
          doc.internal.pageSize.width - 14 - 30, 
          doc.internal.pageSize.height - 10
        );
      }

      // Descargar el PDF
      doc.save(`Marcas_${empresa?.nombre}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtelo nuevamente.');
    }
  };

  if (!isOpen || !empresa) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Modal */}
        <div 
          className="relative flex flex-col shadow-xl"
          style={{ 
            width: '100%',
            maxWidth: '56rem', 
            maxHeight: '37.5rem', 
            borderRadius: '0.75rem', 
            backgroundColor: 'white' 
          }}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between" style={{ backgroundColor: '#4c1d95', color: 'white', borderRadius: '0.75rem 0.75rem 0 0' }}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Marcas Registradas</h2>
                <p className="text-purple-200 text-sm">
                  {empresa.nombre} - RUC: {empresa.ruc}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadMarcasPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md"
                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              >
                <Download className="w-4 h-4" />
                <span>Descargar en PDF</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-2"
                style={{ color: 'white', backgroundColor: 'transparent', border: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3b0764'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto">
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
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">{marca.nombre}</h3>
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

                    {/* Marca Details - Estructura de tabla con dos columnas */}
                    <div className="divide-y divide-gray-200">
                      {/* Número de Resolución */}
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-3 bg-gray-50 border-r border-gray-200">
                          <span className="font-semibold" style={{ color: '#4a5568', fontSize: '0.875rem' }}>Número de Resolución:</span>
                        </div>
                        <div className="px-4 py-3">
                          <span style={{ color: '#1a202c', fontSize: '0.875rem' }}>{marca.numeroResolucion}</span>
                        </div>
                      </div>

                      {/* Fecha de Resolución */}
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-3 bg-gray-50 border-r border-gray-200">
                          <span className="font-semibold" style={{ color: '#4a5568', fontSize: '0.875rem' }}>Fecha de Resolución:</span>
                        </div>
                        <div className="px-4 py-3">
                          <span style={{ color: '#1a202c', fontSize: '0.875rem' }}>{marca.fechaResolucion}</span>
                        </div>
                      </div>

                      {/* Clase (Niza) */}
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-3 bg-gray-50 border-r border-gray-200">
                          <span className="font-semibold" style={{ color: '#4a5568', fontSize: '0.875rem' }}>Clase (Niza):</span>
                        </div>
                        <div className="px-4 py-3">
                          <span style={{ color: '#1a202c', fontSize: '0.875rem' }}>{marca.claseNiza}</span>
                        </div>
                      </div>

                      {/* Titular */}
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-3 bg-gray-50 border-r border-gray-200">
                          <span className="font-semibold" style={{ color: '#4a5568', fontSize: '0.875rem' }}>Titular:</span>
                        </div>
                        <div className="px-4 py-3">
                          <span style={{ color: '#1a202c', fontSize: '0.875rem' }}>{marca.titular}</span>
                        </div>
                      </div>

                      {/* Plazo de Vigencia */}
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-3 bg-gray-50 border-r border-gray-200">
                          <span className="font-semibold" style={{ color: '#4a5568', fontSize: '0.875rem' }}>Plazo de Vigencia:</span>
                        </div>
                        <div className="px-4 py-3">
                          <span style={{ color: '#1a202c', fontSize: '0.875rem' }}>{marca.plazoVigencia}</span>
                        </div>
                      </div>

                      {/* Base Legal */}
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-3 bg-gray-50 border-r border-gray-200">
                          <span className="font-semibold" style={{ color: '#4a5568', fontSize: '0.875rem' }}>Base Legal:</span>
                        </div>
                        <div className="px-4 py-3">
                          <span style={{ color: '#1a202c', fontSize: '0.875rem' }}>{marca.baseLegal}</span>
                        </div>
                      </div>

                      {/* Descripción de Productos/Servicios */}
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-3 bg-gray-50 border-r border-gray-200">
                          <span className="font-semibold" style={{ color: '#4a5568', fontSize: '0.875rem' }}>Descripción de Productos/Servicios:</span>
                        </div>
                        <div className="px-4 py-3">
                          <p style={{ color: '#1a202c', fontSize: '0.875rem' }}>
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
          <div className="px-6 py-4" style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 0.75rem 0.75rem' }}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Información obtenida de INDECOPI
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#6b7280', color: 'white', border: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
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