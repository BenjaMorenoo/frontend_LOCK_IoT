import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [msg, setMsg] = useState("");
  const [admins, setAdmins] = useState([]);
  

  useEffect(() => {
    loadSedes();
    loadAdmins();
  }, []);

  const loadSedes = async () => {
    try {
      const data = await apiFetch('/api/sedes');
      setSedes(data || []);
    } catch (err) {
      console.error(err);
      setMsg('Error cargando sedes: ' + err.message);
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await apiFetch('/api/admins');
      setAdmins(data || []);
    } catch (err) {
      // si no está autorizado, no hace nada
      console.warn('No se pudieron cargar admins:', err.message);
    }
  };

  const createSede = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/api/sedes', { method: 'POST', body: JSON.stringify({ nombre, ciudad }) });
      setMsg('Sede creada');
      setNombre(''); setCiudad('');
      loadSedes();
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  };

  const assignCetcom = async (sedeId, adminId) => {
    try {
      await apiFetch(`/api/sedes/${sedeId}/assign-cetcom`, { method: 'POST', body: JSON.stringify({ admin_id: adminId }) });
      setMsg('CETCOM asignado');
    } catch (err) {
      setMsg('Error asignando CETCOM: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
        <h2 className="text-xl font-bold">Gestión de Sedes</h2>
        <p className="text-sm text-gray-600">Crear sedes y asignar el departamento CETCOM</p>
      </div>

      {msg && <div className="p-3 bg-blue-50 rounded">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Crear Sede</h3>
          <form onSubmit={createSede} className="space-y-2">
            <input placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)} required className="w-full p-2 border rounded" />
            <input placeholder="Ciudad" value={ciudad} onChange={e=>setCiudad(e.target.value)} className="w-full p-2 border rounded" />
            <button className="px-4 py-2 bg-institutional-gold-gradient text-white rounded">Crear</button>
          </form>
        </div>

        <div className="bg-white p-4 rounded-xl shadow overflow-auto max-h-96">
          <h3 className="font-semibold mb-2">Sedes existentes</h3>
          {sedes.length === 0 ? (
            <p className="text-sm text-gray-500">No hay sedes</p>
          ) : (
            <>
              {sedes.map(s => (
                <div key={s.id} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.nombre}</div>
                    <div className="text-xs text-gray-500">{s.ciudad}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {admins.length > 0 ? (
                      <>
                        <select id={`admin-${s.id}`} className="p-1 border rounded text-sm">
                          <option value="">Seleccionar admin</option>
                          {admins.map(a => <option key={a.id} value={a.id}>{a.username} ({a.role})</option>)}
                        </select>
                        <button onClick={() => {
                          const sel = document.getElementById(`admin-${s.id}`);
                          const adminId = sel ? sel.value : null;
                          assignCetcom(s.id, adminId);
                        }} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Asignar CETCOM</button>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500">Inicia sesión como superadmin para asignar CETCOM</div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
