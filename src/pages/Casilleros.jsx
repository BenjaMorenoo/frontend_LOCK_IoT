import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { FaPlus, FaArchive, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { HiSparkles, HiCollection } from "react-icons/hi";
import { MdAdd, MdStorage } from "react-icons/md";
import Modal from "../components/Modal";

export default function Casilleros() {
  const [casilleros, setCasilleros] = useState([]);
  const [msg, setMsg] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [numero, setNumero] = useState("");

  useEffect(() => {
    loadCasilleros();
  }, []);

  const loadCasilleros = async () => {
    try {
      const data = await apiFetch("/api/casilleros");
      setCasilleros(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addCasillero = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/casilleros", {
        method: "POST",
        body: JSON.stringify({ numero }),
      });
      setMsg("Casillero agregado correctamente");
      setNumero("");
      setIsOpen(false);
      loadCasilleros();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-institutional-gold-gradient rounded-xl shadow-institutional">
              <HiCollection className="text-white text-xl sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bold bg-institutional-gold-gradient bg-clip-text text-white">
                Gestión de Casilleros
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Administra los casilleros del sistema</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="group bg-institutional-gold-gradient hover:gold-shimmer text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 sm:gap-3 transition-all duration-300 transform hover:scale-105 shadow-institutional hover:shadow-institutional-lg text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <MdAdd className="text-base sm:text-lg group-hover:animate-pulse" />
            <span className="sm:inline">Añadir Casillero</span>
          </button>
        </div>
      </div>

      {/* Mensaje de estado */}
      {msg && (
        <div className={`p-4 rounded-xl border-l-4 ${
          msg.includes('correctamente') 
            ? 'bg-green-50 border-green-400 text-green-700'
            : msg.includes('Error')
            ? 'bg-red-50 border-red-400 text-red-700'
            : 'bg-blue-50 border-blue-400 text-blue-700'
        } flex items-center gap-3 animate-slideInLeft`}>
          {msg.includes('correctamente') && <FaCheckCircle className="text-green-500" />}
          {msg.includes('Error') && <FaExclamationTriangle className="text-red-500" />}
          <span className="font-medium">{msg}</span>
        </div>
      )}

      {/* Lista de casilleros */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-institutional-gold-gradient p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FaArchive className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Casilleros Disponibles</h3>
              <p className="text-white/80 text-xs sm:text-sm">{casilleros.length} casilleros en el sistema</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {casilleros.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {casilleros.map((casillero, index) => (
                <div
                  key={casillero.id}
                  className="group bg-gradient-to-br from-white to-institutional-gold-light/10 p-6 rounded-xl border border-institutional-gold-light/20 hover:shadow-institutional hover:border-institutional-gold-light transition-all duration-300 transform hover:scale-105 animate-scaleIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-institutional-gold-gradient rounded-xl shadow-institutional group-hover:scale-110 transition-transform duration-300 mb-4">
                      <MdStorage className="text-white text-2xl" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">CASILLERO</p>
                      <p className="font-bold text-gray-800 text-xl">#{casillero.numero}</p>
                    </div>
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{color: 'var(--institutional-gold)'}}>
                      <HiSparkles className="text-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaArchive className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium">No hay casilleros registrados</p>
              <p className="text-gray-400 text-sm">Añade el primer casillero para comenzar</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Agregar Casillero">
        <form onSubmit={addCasillero} className="flex flex-col gap-4">
          <input
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full px-4 py-3 bg-white/80 border-2 border-institutional-gold-light rounded-xl text-black placeholder-gray-500 focus:ring-2 focus:border-institutional-gold focus:bg-white outline-none transition-all duration-300 shadow-institutional"
            style={{'--tw-ring-color': 'var(--institutional-gold)'}}
            required
          />
          <button
            type="submit"
            className="bg-institutional-gold-gradient hover:gold-shimmer text-white font-bold px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-institutional"
          >
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
