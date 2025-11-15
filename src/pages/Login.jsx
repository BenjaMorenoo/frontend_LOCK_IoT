import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "../assets/logo-duoc.svg";
import { apiFetch } from "../utils/api";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user || null));
        navigate("/dashboard");
      } else {
        // response may be null or contain an error message
        setError((response && response.error) || 'Credenciales inválidas');
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-institutional-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-institutional-gold-gradient rounded-full opacity-20 blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-institutional-gold-gradient rounded-full opacity-15 blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-institutional-gold-gradient rounded-full opacity-10 blur-xl animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8 animate-scaleIn">
          {/* Logo limpio, más grande y sin fondo dorado */}
          <div className="mb-4">
            {/* Fondo oscuro para que el logo blanco sea visible */}
            <div className="inline-flex items-center justify-center bg-gray-900/90 p-3 rounded-md shadow-md mx-auto w-fit">
              <img src={logo} alt="Logo institucional" className="w-28 h-auto block" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">LockIoT</h1>
          <p className="text-gray-600 font-medium">Sistema de Cerraduras Inteligentes</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-institutional-lg border border-institutional-gold-light/30 p-8 hover-lift">
          <div className="text-center mb-8">
            <div className="bg-institutional-gold-gradient text-white py-3 px-6 rounded-2xl mb-6 gold-shimmer">
              <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-slideInLeft">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-slideInLeft" style={{animationDelay: '0.1s'}}>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-institutional-gold transition-colors duration-300" />
                <input
                  type="text"
                  name="username"
                  placeholder="Usuario"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-institutional-gold focus:border-institutional-gold transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-institutional-gold-light"
                  required
                />
              </div>
            </div>

            <div className="animate-slideInLeft" style={{animationDelay: '0.2s'}}>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-institutional-gold transition-colors duration-300" />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-institutional-gold focus:border-institutional-gold transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-institutional-gold-light"
                  required
                />
              </div>
            </div>

            <div className="animate-slideInRight" style={{animationDelay: '0.3s'}}>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-institutional-gold-gradient hover:scale-105 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-institutional hover:shadow-institutional-lg gold-shimmer"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>

          <div className="text-center mt-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <p className="text-sm text-gray-500 font-medium">
              © 2025 LockIoT {/*- Sistema de Control de Acceso */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
