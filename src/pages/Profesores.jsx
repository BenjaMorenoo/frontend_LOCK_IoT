import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { FaUserPlus, FaUser, FaIdCard, FaCheckCircle, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { HiSparkles, HiUserGroup } from "react-icons/hi";
import { MdPersonAdd, MdPerson } from "react-icons/md";
import Modal from "../components/Modal";
import { io } from "socket.io-client";

// Conexión al backend con socket.io
//const socket = io("https://backend-lock-iot.onrender.com"); // Cambiar a URL del hosting si es necesario
const socket = io("https://api-lockiot.ironhost.cl"); // conexion a ironhost
//const socket = io("https://walks-flexibility-handle-local.trycloudflare.com"); // conexion a ironhost local


export default function Profesores() {
  const [profesores, setProfesores] = useState([]);
  const [msg, setMsg] = useState("");

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [rut, setRut] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [lastUID, setLastUID] = useState(""); // Buffer temporal de UID
  
  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profesorToDelete, setProfesorToDelete] = useState(null);

  useEffect(() => {
    loadProfesores();

    // Registrar listener en el server para recibir solo UIDs de nuestra sede (si aplica)
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.sede_id) {
          socket.emit('register_listener', { sede_id: payload.sede_id });
        }
      }
    } catch (e) {
      console.warn('No se pudo registrar listener por token inválido', e);
    }

    // Escuchar evento de nueva tarjeta desde el backend
    socket.on("nueva-tarjeta", async (uid) => {
      setLastUID(uid); // Guardar siempre la UID
      // Revisar si ya está registrada
      const profesoresData = await apiFetch("/api/profesores");
      const profesorExistente = profesoresData.find((p) => p.tarjeta_uid === uid);

      if (profesorExistente) {
        const full = profesorExistente.nombre || `${profesorExistente.primer_nombre || ''} ${profesorExistente.primer_apellido || ''}`.trim();
        setMsg(`⚠️ Esta tarjeta ya está asignada a: ${full}`);
      } else {
        setMsg(`Tarjeta lista para asignar`);
        if (isOpen) setTarjeta(uid); // Solo autocompleta si el modal está abierto
      }
    });

    return () => {
      socket.off("nueva-tarjeta");
      // intentar unregister del room de sede si estaba registrado
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload && payload.sede_id) {
            socket.emit('unregister_listener', { sede_id: payload.sede_id });
          }
        }
      } catch (e) {
        // noop
      }
    };
  }, [isOpen]);

  useEffect(() => {
    // Cuando se abre el modal, poner la última UID si está disponible y no está duplicada
    if (isOpen && lastUID) {
      apiFetch("/api/profesores").then((profesoresData) => {
        const profesorExistente = profesoresData.find((p) => p.tarjeta_uid === lastUID);
        if (!profesorExistente) setTarjeta(lastUID);
      });
    }
  }, [isOpen, lastUID]);

  const loadProfesores = async () => {
    try {
      const data = await apiFetch("/api/profesores");
      setProfesores(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addProfesor = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/profesores", {
        method: "POST",
        body: JSON.stringify({
          primer_nombre: primerNombre,
          segundo_nombre: segundoNombre,
          primer_apellido: primerApellido,
          segundo_apellido: segundoApellido,
          rut: rut,
          tarjeta_uid: tarjeta
        }),
      });
      setMsg("Profesor agregado correctamente");
      setPrimerNombre(""); setSegundoNombre(""); setPrimerApellido(""); setSegundoApellido(""); setRut("");
      setTarjeta("");
      setIsOpen(false);
      loadProfesores();
    } catch (err) {
      setMsg("❌ Error: " + err.message);
    }
  };

  const deleteProfesor = async () => {
    if (!profesorToDelete) return;
    
    try {
      await apiFetch(`/api/profesores/${profesorToDelete.id}`, {
        method: "DELETE",
      });
      setMsg(`Profesor ${profesorToDelete.nombre} eliminado correctamente. Los logs se mantienen en el historial.`);
      setDeleteModalOpen(false);
      setProfesorToDelete(null);
      loadProfesores();
    } catch (err) {
      setMsg("❌ " + err.message);
      setDeleteModalOpen(false);
      setProfesorToDelete(null);
    }
  };

  const handleDeleteClick = (profesor) => {
    setProfesorToDelete(profesor);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-institutional-gold-gradient rounded-xl shadow-institutional">
              <HiUserGroup className="text-white text-xl sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bold bg-institutional-gold-gradient bg-clip-text text-white">
                Gestión de Profesores
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Administra los usuarios del sistema</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="group bg-institutional-gold-gradient hover:gold-shimmer text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 sm:gap-3 transition-all duration-300 transform hover:scale-105 shadow-institutional hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <MdPersonAdd className="text-base sm:text-lg group-hover:animate-pulse" />
            <span className="sm:inline">Añadir Profesor</span>
          </button>
        </div>
      </div>

      {/* Mensaje de estado */}
      {msg && (
        <div className={`p-4 rounded-xl border-l-4 ${
          msg.includes('✅') 
            ? 'bg-green-50 border-green-400 text-green-700'
            : msg.includes('⚠️')
            ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
            : 'bg-blue-50 border-blue-400 text-blue-700'
        } flex items-center gap-3 animate-slideInLeft`}>
          {msg.includes('✅') && <FaCheckCircle className="text-green-500" />}
          {msg.includes('⚠️') && <FaExclamationTriangle className="text-yellow-500" />}
          <span className="font-medium">{msg}</span>
        </div>
      )}

      {/* Lista de profesores */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-institutional-gold-gradient p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FaUser className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Profesores Registrados</h3>
              <p className="text-white/80 text-xs sm:text-sm">{profesores.length} usuarios en el sistema</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {profesores.length > 0 ? (
            <div className="grid gap-4">
              {profesores.map((profesor, index) => (
                <div
                  key={profesor.id}
                  className="group bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="p-3 sm:p-4 bg-institutional-gold-gradient rounded-xl shadow-institutional group-hover:scale-110 transition-transform duration-300">
                      <FaUser className="text-white text-lg sm:text-xl" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">NOMBRE COMPLETO</p>
                        <p className="font-bold text-gray-800 text-lg">{profesor.nombre || `${profesor.primer_nombre || ''} ${profesor.segundo_nombre || ''} ${profesor.primer_apellido || ''} ${profesor.segundo_apellido || ''}`.replace(/\s+/g,' ').trim()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">UID TARJETA</p>
                        <div className="flex items-center gap-2">
                          <MdPerson style={{color: 'var(--institutional-gold)'}} />
                            <p className="font-mono text-gray-700 bg-white/50 px-3 py-1 rounded-lg text-sm border border-institutional-gold-light">
                            {profesor.tarjeta_uid}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteClick(profesor)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-110 shadow-lg"
                        title="Eliminar profesor"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{color: 'var(--institutional-gold)'}}>
                        <HiSparkles className="text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaUser className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium">No hay profesores registrados</p>
              <p className="text-gray-400 text-sm">Añade el primer profesor para comenzar</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Agregar Profesor">
        <form onSubmit={addProfesor} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Primer nombre" value={primerNombre} onChange={(e)=>setPrimerNombre(e.target.value)} className="w-full px-4 py-3 bg-white/80 border-2 border-institutional-gold-light rounded-xl" required />
            <input placeholder="Segundo nombre" value={segundoNombre} onChange={(e)=>setSegundoNombre(e.target.value)} className="w-full px-4 py-3 bg-white/80 border-2 border-institutional-gold-light rounded-xl" />
            <input placeholder="Primer apellido" value={primerApellido} onChange={(e)=>setPrimerApellido(e.target.value)} className="w-full px-4 py-3 bg-white/80 border-2 border-institutional-gold-light rounded-xl" required />
            <input placeholder="Segundo apellido" value={segundoApellido} onChange={(e)=>setSegundoApellido(e.target.value)} className="w-full px-4 py-3 bg-white/80 border-2 border-institutional-gold-light rounded-xl" />
          </div>
          <input placeholder="RUT" value={rut} onChange={(e)=>setRut(e.target.value)} className="w-full px-4 py-3 bg-white/80 border-2 border-institutional-gold-light rounded-xl" />
          <input
            placeholder="UID Tarjeta"
            value={tarjeta}
            onChange={(e) => setTarjeta(e.target.value)}
            className="w-full px-4 py-3 bg-white/80 border-2 border-institutional-gold-light rounded-xl text-black placeholder-gray-500 focus:ring-2 focus:border-institutional-gold focus:bg-white outline-none transition-all duration-300 shadow-institutional font-mono"
            style={{'--tw-ring-color': 'var(--institutional-gold)'}}
          />
          <button
            type="submit"
            className="bg-institutional-gold-gradient hover:gold-shimmer text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-institutional"
          >
            Guardar
          </button>
        </form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmar Eliminación">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <FaExclamationTriangle className="text-blue-500 text-xl" />
            <div>
              <p className="font-semibold text-blue-800">¿Estás seguro de eliminar este profesor?</p>
              <p className="text-blue-600 text-sm">Los logs de acceso se mantendrán en el historial para conservar el registro completo.</p>
            </div>
          </div>
          
          {profesorToDelete && (
            <div className="p-4 bg-gray-50 rounded-xl border">
              <p className="font-semibold text-gray-800">{profesorToDelete.nombre}</p>
              <p className="text-gray-600 text-sm font-mono">{profesorToDelete.tarjeta_uid}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={deleteProfesor}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
