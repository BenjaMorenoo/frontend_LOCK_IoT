import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { FaHistory, FaUser, FaArchive, FaClock, FaDownload } from "react-icons/fa";
import { HiSparkles, HiClipboardList } from "react-icons/hi";
import { MdAccessTime, MdSecurity } from "react-icons/md";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Logs() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        apiFetch("/api/logs").then(setLogs).catch(console.error);
    }, []);

    const generatePDF = () => {
        const doc = new jsPDF();
        
        // Configurar colores institucionales
        const goldColor = [218, 165, 32]; // Dorado institucional
        const darkGoldColor = [184, 134, 11]; // Dorado oscuro
        
        // Encabezado del documento
        doc.setFillColor(...goldColor);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Historial de Aperturas', 105, 20, { align: 'center' });
        
        // Fecha de generación
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const currentDate = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Fecha de generación: ${currentDate}`, 20, 45);
        
        if (logs.length === 0) {
            doc.setFontSize(14);
            doc.text('No hay registros de actividad disponibles.', 105, 80, { align: 'center' });
        } else {
            // Preparar datos para la tabla
            const tableData = logs.map(log => [
                log.profesor,
                `#${log.casillero}`,
                new Date(log.fecha_hora).toLocaleDateString('es-ES'),
                new Date(log.fecha_hora).toLocaleTimeString('es-ES')
            ]);
            
            // Crear tabla
            const tableResult = autoTable(doc, {
                head: [['Profesor', 'Casillero', 'Fecha', 'Hora']],
                body: tableData,
                startY: 55,
                theme: 'grid',
                headStyles: {
                    fillColor: goldColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 12
                },
                bodyStyles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                alternateRowStyles: {
                    fillColor: [252, 248, 227] // Dorado muy claro
                },
                margin: { left: 20, right: 20 },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 35, halign: 'center' },
                    3: { cellWidth: 35, halign: 'center' }
                }
            });
            
            // Total de registros
            const finalY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...darkGoldColor);
            doc.text(`Total de registros: ${logs.length}`, 20, finalY);
        }
        
        // Numeración de páginas
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        }
        
        // Descargar el PDF
        doc.save(`historial-aperturas-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-4 sm:space-y-8 overflow-x-hidden">
            {/* Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-institutional-gold-gradient rounded-xl shadow-institutional">
                            <HiClipboardList className="text-white text-xl sm:text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-3xl font-bold bg-institutional-gold-gradient bg-clip-text text-transparent">
                                Historial de Aperturas
                            </h2>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">Registro completo de accesos al sistema</p>
                        </div>
                    </div>
                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 px-4 py-2 bg-institutional-gold-gradient text-white rounded-xl shadow-institutional hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium text-sm sm:text-base"
                        title="Descargar PDF"
                    >
                        <FaDownload className="text-sm" />
                        <span className="hidden sm:inline">Descargar PDF</span>
                        <span className="sm:hidden">PDF</span>
                    </button>
                </div>
            </div>

            {/* Lista de logs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-institutional-gold-gradient p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FaHistory className="text-white text-lg sm:text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white">Registro de Actividad</h3>
                            <p className="text-white/80 text-xs sm:text-sm">{logs.length} registros encontrados</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 sm:p-6 max-h-96 overflow-y-auto overflow-x-hidden">
                    {logs.length > 0 ? (
                        <div className="space-y-4">
                            {logs.map((log, index) => (
                                <div
                                    key={log.id}
                                    className="group bg-gradient-to-r from-white to-institutional-gold-light/5 p-4 sm:p-6 rounded-xl border border-institutional-gold-light/20 hover:shadow-institutional hover:border-institutional-gold-light transition-all duration-300 transform hover:scale-[1.02] animate-slideInLeft"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                        <div className="p-3 sm:p-4 bg-institutional-gold-gradient rounded-xl shadow-institutional group-hover:scale-110 transition-transform duration-300">
                                            <MdSecurity className="text-white text-lg sm:text-xl" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FaUser style={{color: 'var(--institutional-gold)'}} className="flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500 font-medium">PROFESOR</p>
                                                        <p className="font-bold text-gray-800 truncate">{log.profesor}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FaArchive style={{color: 'var(--institutional-gold-dark)'}} className="flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500 font-medium">CASILLERO</p>
                                                        <p className="font-bold text-gray-800">#{log.casillero}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <MdAccessTime style={{color: 'var(--institutional-gold)'}} className="flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500 font-medium">FECHA Y HORA</p>
                                                    <p className="font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded-lg text-sm break-all">
                                                        {new Date(log.fecha_hora).toLocaleString('es-ES', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{color: 'var(--institutional-gold)'}}>
                                            <HiSparkles className="text-xl" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <FaHistory className="text-gray-400 text-xl" />
                            </div>
                            <p className="text-gray-500 font-medium">No hay registros de actividad</p>
                            <p className="text-gray-400 text-sm">Los accesos aparecerán aquí cuando se utilicen los casilleros</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
