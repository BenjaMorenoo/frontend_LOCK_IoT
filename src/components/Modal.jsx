import { FaTimes } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

export default function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      <div 
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md relative animate-scaleIn border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        {title && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-institutional-gold-gradient rounded-lg">
                <HiSparkles className="text-white text-base sm:text-lg" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold bg-institutional-gold-gradient bg-clip-text text-white">
                {title}
              </h2>
            </div>
            <div className="h-1 bg-institutional-gold-gradient rounded-full"></div>
          </div>
        )}
        
        {/* Botón de cerrar mejorado */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110 touch-manipulation"
        >
          <FaTimes className="text-base sm:text-lg" />
        </button>
        
        {/* Contenido */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}
