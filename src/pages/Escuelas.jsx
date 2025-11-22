import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function Escuelas() {
  const [escuelas, setEscuelas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [sedeId, setSedeId] = useState("");
  const [sedes, setSedes] = useState([]);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentSedeId, setCurrentSedeId] = useState(null);

  useEffect(() => {
    // obtener role y sede desde token y pasarlos a las cargas para evitar race conditions
    let role = null;
    let sede = null;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role || null;
        sede = payload.sede_id || null;
        setCurrentRole(role);
        setCurrentSedeId(sede);
      }
    } catch (e) { /* ignore */ }

    loadEscuelas(role, sede);
    loadSedes(role, sede);
  }, []);

  const loadEscuelas = async (roleParam, sedeParam) => {
    try {
      const roleToUse = typeof roleParam !== 'undefined' ? roleParam : currentRole;
      const sedeToUse = typeof sedeParam !== 'undefined' ? sedeParam : currentSedeId;
      let url = '/api/escuelas';
      if (roleToUse === 'cetcom' && sedeToUse) url += `?sede_id=${sedeToUse}`;
      const data = await apiFetch(url);
      setEscuelas(data || []);
    } catch (err) { console.error(err); setMsg('Error: ' + err.message); }
  };

  const loadSedes = async (roleParam, sedeParam) => {
    try {
      const all = await apiFetch('/api/sedes') || [];
      const roleToUse = typeof roleParam !== 'undefined' ? roleParam : currentRole;
      const sedeToUse = typeof sedeParam !== 'undefined' ? sedeParam : currentSedeId;
      if (roleToUse === 'cetcom' && sedeToUse) {
        const only = all.filter(x => String(x.id) === String(sedeToUse));
        setSedes(only);
        setSedeId(sedeToUse);
      } else {
        setSedes(all);
      }
    } catch(e){ console.error(e); }
  };

  const createEscuela = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiFetch(`/api/escuelas/${editingId}`, { method: 'PUT', body: JSON.stringify({ nombre, sede_id: sedeId || undefined }) });
        setMsg('Escuela actualizada');
        setEditingId(null);
      } else {
        await apiFetch('/api/escuelas', { method: 'POST', body: JSON.stringify({ nombre, sede_id: sedeId || undefined }) });
        setMsg('Escuela creada');
      }
      setNombre(''); setSedeId(''); loadEscuelas();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
        <h2 className="text-xl font-bold">Gestión de Escuelas</h2>
        <p className="text-sm text-gray-600">Crear y editar escuelas; CETCOM puede crear dentro de su sede</p>
      </div>

      {msg && <div className="p-3 bg-blue-50 rounded">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Crear Escuela</h3>
          <form onSubmit={createEscuela} className="space-y-2">
            <input placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)} required className="w-full p-2 border rounded" />
            <select value={sedeId} onChange={e=>setSedeId(e.target.value)} className="w-full p-2 border rounded" disabled={currentRole === 'cetcom'}>
              <option value="">(Asignar sede opcional)</option>
              {sedes.map(s=> <option key={s.id} value={s.id}>{s.nombre} - {s.ciudad}</option>)}
            </select>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-institutional-gold-gradient text-white rounded">{editingId ? 'Actualizar Escuela' : 'Crear Escuela'}</button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setNombre(''); setSedeId(''); }} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-4 rounded-xl shadow overflow-auto max-h-96">
          <h3 className="font-semibold mb-2">Escuelas</h3>
          {escuelas.length === 0 ? <p className="text-sm text-gray-500">No hay escuelas</p> : (
            <div className="space-y-2">
              {escuelas.map(e => (
                <div key={e.id} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{e.nombre}</div>
                    <div className="text-xs text-gray-500">Sede ID: {e.sede_id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingId(e.id); setNombre(e.nombre); setSedeId(e.sede_id || ''); }} className="px-2 py-1 bg-yellow-500 text-white rounded text-sm">Editar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
