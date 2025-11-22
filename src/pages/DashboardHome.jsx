import { useEffect, useState } from "react";
import { FaUser, FaDoorOpen, FaClipboardList, FaArchive, FaChartLine, FaClock, FaDownload } from "react-icons/fa";
import { HiSparkles, HiTrendingUp, HiUsers } from "react-icons/hi";
import { MdAccessTime, MdSecurity } from "react-icons/md";
import { apiFetch } from "../utils/api";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from "../assets/logo-duoc.svg";
import logoRaw from "../assets/logo-duoc.svg?raw";

export default function DashboardHome() {
  const [profesores, setProfesores] = useState([]);
  const [casilleros, setCasilleros] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    apiFetch("/api/profesores").then(setProfesores).catch(console.error);
    apiFetch("/api/casilleros").then(setCasilleros).catch(console.error);
    apiFetch("/api/logs").then(setLogs).catch(console.error);
  }, []);

  const recentLogs = logs.slice(0, 15);

  const generatePDF = () => {
    (async () => {
      const doc = new jsPDF();

      // Helper: cargar imagen y convertir a dataURL, devolver también dimensiones
      const loadImageDataUrl = (src, mime = 'image/png') => new Promise(async (resolve, reject) => {
        try {
          const img = new Image();
          img.crossOrigin = 'Anonymous';

          // If SVG file, fetch its text and build a data URL so canvas can render it reliably
          if (typeof src === 'string' && (src.trim().startsWith('<svg') || src.endsWith('.svg'))) {
            let svgText;
            if (src.trim().startsWith('<svg')) {
              svgText = src;
            } else {
              const resp = await fetch(src);
              if (!resp.ok) throw new Error('Fetch failed for svg');
              svgText = await resp.text();
            }
            // Reemplazar fills blancos en el SVG por un color oscuro para asegurar visibilidad
            const darkHex = '#121212';
            svgText = svgText
              .replace(/fill\s*=\s*(["'])?#(?:fff|ffffff)\1/gi, `fill="${darkHex}"`)
              .replace(/fill\s*=\s*(["'])?white\1/gi, `fill="${darkHex}"`)
              .replace(/style\s*=\s*(["'])(.*?)\1/gi, (m, q, style) => {
                const newStyle = style.replace(/fill\s*:\s*#(?:fff|ffffff)|fill\s*:\s*white/gi, `fill:${darkHex}`);
                return `style=${q}${newStyle}${q}`;
              });
            src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
          }

          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve({ dataUrl: canvas.toDataURL(mime), width: canvas.width, height: canvas.height });
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = (e) => reject(e);
          img.src = src;
        } catch (err) {
          reject(err);
        }
      });

      // Intentar añadir logo al encabezado (no bloquear si falla)
      try {
        const imgInfo = await loadImageDataUrl(logoRaw || logo);
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = 40; // mm (aumentado para mantener consistencia con Logs)
        const imgHeight = imgWidth * (imgInfo.height / imgInfo.width);
        const x = 20;
        const y = 12;
        // Dibujar fondo para que el logo blanco sea visible
        doc.setFillColor(184, 134, 11); // fondo dorado oscuro
        doc.rect(x - 2, y - 2, imgWidth + 4, imgHeight + 4, 'F');
        doc.addImage(imgInfo.dataUrl, 'PNG', x, y, imgWidth, imgHeight);
      } catch (err) {
        console.warn('No se pudo cargar el logo para el PDF:', err);
      }
    
    // Encabezado del documento
    doc.setFontSize(20);
    doc.setTextColor(184, 134, 11); // Color dorado institucional
    doc.text('Reporte de Actividad Reciente', 20, 30);
    
    // Fecha de generación
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${fechaActual}`, 20, 45);
    
    if (recentLogs.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('No hay registros de actividad reciente para mostrar.', 20, 70);
    } else {
      // Preparar datos para la tabla
      const tableData = recentLogs.map(log => [
        log.profesor,
        log.casillero.toString(),
        log.fecha_hora
      ]);
      
      // Crear tabla usando helper tolerante a la forma en que el plugin fue registrado
      const callAutoTable = (doc, opts) => {
        try {
          if (doc && typeof doc.autoTable === 'function') {
            return doc.autoTable(opts);
          }
          if (typeof autoTable === 'function') {
            return autoTable(doc, opts);
          }
          if (typeof window !== 'undefined' && typeof window.jspdfAutoTable === 'function') {
            return window.jspdfAutoTable(doc, opts);
          }
          console.error('jspdf-autotable: plugin not found (tried doc.autoTable, default import, window.jspdfAutoTable)');
        } catch (err) {
          console.error('Error calling autoTable:', err);
        }
      };

      callAutoTable(doc, {
        head: [['Profesor', 'Casillero', 'Fecha/Hora']],
        body: tableData,
        startY: 60,
        theme: 'grid',
        headStyles: {
          fillColor: [184, 134, 11], // Color dorado institucional
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [252, 248, 227] // Fondo dorado claro
        },
        margin: { top: 60, left: 20, right: 40 }
      });
      
      // Agregar total de registros
      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total de registros mostrados: ${recentLogs.length}`, 20, finalY);
    }
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    }
    
      // Descargar el PDF con formato `Reporte_carros-YYYY-MM-DD.pdf`
      doc.save(`Reporte_Carros-${new Date().toISOString().split('T')[0]}.pdf`);
    })();
  };

  const statsCards = [
    {
      title: "Profesores",
      value: profesores.length,
      icon: HiUsers,
      gradient: "from-institutional-gold to-institutional-gold-light",
      bgGradient: "from-white to-institutional-gold-light/10",
      description: "Usuarios registrados"
    },
    {
      title: "Casilleros",
      value: casilleros.length,
      icon: FaArchive,
      gradient: "from-institutional-gold-dark to-institutional-gold",
      bgGradient: "from-institutional-gold-light/5 to-white",
      description: "Unidades disponibles"
    },
    {
      title: "Aperturas",
      value: logs.length,
      icon: FaChartLine,
      gradient: "from-institutional-gold to-institutional-gold-dark",
      bgGradient: "from-white to-institutional-gold-light/15",
      description: "Total de accesos"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Estadísticas en tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`group relative bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-1">{card.description}</p>
                  <p className="text-gray-800 font-semibold text-lg mb-2">{card.title}</p>
                  <p className={`text-4xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-black`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-black text-2xl" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          );
        })}
      </div>

      {/* Últimas aperturas */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-institutional-gold-gradient p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdAccessTime className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
                <p className="text-white/80 text-sm">Últimas aperturas de casilleros</p>
              </div>
            </div>
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 hover:border-white/40"
              title="Descargar PDF de actividad reciente"
            >
              <FaDownload className="text-sm" />
              <span className="hidden sm:inline font-medium">Descargar PDF</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {recentLogs.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-institutional-gold-light scrollbar-track-gray-100">
              {recentLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white to-institutional-gold-light/5 rounded-xl border border-institutional-gold-light/20 hover:shadow-institutional hover:border-institutional-gold-light transition-all duration-300 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-3 bg-institutional-gold-gradient rounded-xl shadow-institutional group-hover:scale-110 transition-transform duration-300">
                    <MdSecurity className="text-white text-lg" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">PROFESOR</p>
                      <p className="font-semibold text-gray-800">{log.profesor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">CASILLERO</p>
                      <p className="font-semibold text-gray-800">{log.casillero}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">FECHA/HORA</p>
                      <p className="font-semibold text-gray-800">{log.fecha_hora}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{color: 'var(--institutional-gold)'}}>
                    <HiSparkles className="text-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaClock className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium">No hay actividad reciente</p>
              <p className="text-gray-400 text-sm">Los registros aparecerán aquí cuando se abran casilleros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
