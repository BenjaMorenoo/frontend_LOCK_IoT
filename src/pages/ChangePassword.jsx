import { useState } from "react";
import { apiFetch } from "../utils/api";
import { FaKey, FaLock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { HiSparkles, HiShieldCheck } from "react-icons/hi";
import { MdSecurity } from "react-icons/md";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setMsg("Contraseña cambiada correctamente");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-institutional-gold-gradient rounded-xl shadow-institutional">
            <HiShieldCheck className="text-white text-xl sm:text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-institutional-gold-gradient bg-clip-text text-white">
              Cambiar Contraseña
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Actualiza tu contraseña de acceso al sistema</p>
          </div>
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

      {/* Formulario */}
      <div className="max-w-md mx-auto px-4 sm:px-0">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-institutional-gold-gradient p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdSecurity className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Seguridad de la Cuenta</h3>
                <p className="text-white/80 text-xs sm:text-sm">Mantén tu cuenta protegida</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            {/* Campo contraseña actual */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaLock className="text-gray-500 text-sm" />
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-institutional-gold-light rounded-xl focus:ring-2 focus:border-institutional-gold focus:bg-white/30 outline-none transition-all duration-200 bg-white/20 backdrop-blur-sm text-sm sm:text-base"
                  required
                />
                <FaKey className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </div>

            {/* Campo nueva contraseña */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaLock className="text-gray-500 text-sm" />
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-institutional-gold-light rounded-xl focus:ring-2 focus:border-institutional-gold focus:bg-white/30 outline-none transition-all duration-200 bg-white/20 backdrop-blur-sm text-sm sm:text-base"
                  required
                />
                <FaKey className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="group w-full bg-institutional-gold-gradient hover:gold-shimmer text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-institutional hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
            >
              <HiSparkles className="text-base sm:text-lg group-hover:animate-pulse" />
              Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
