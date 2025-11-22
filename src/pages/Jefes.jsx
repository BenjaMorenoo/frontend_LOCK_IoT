import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function Jefes() {
  const [jefes, setJefes] = useState([]);
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rut, setRut] = useState("");
  const [escuelaId, setEscuelaId] = useState("");
  const [escuelas, setEscuelas] = useState([]);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentSedeId, setCurrentSedeId] = useState(null);

  useEffect(() => {
    // obtener role y sede desde token y pasar a loaders
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

    loadJefes();
    loadEscuelas(role, sede);
  }, []);

  const loadJefes = async () => {
    try { const data = await apiFetch('/api/jefes'); setJefes(data || []); } catch(e){ console.error(e); }
  };

  const loadEscuelas = async (roleParam, sedeParam) => {
    try {
      const roleToUse = typeof roleParam !== 'undefined' ? roleParam : currentRole;
      const sedeToUse = typeof sedeParam !== 'undefined' ? sedeParam : currentSedeId;
      let url = '/api/escuelas';
      if (roleToUse === 'cetcom' && sedeToUse) url += `?sede_id=${sedeToUse}`;
      const escuelasData = await apiFetch(url) || [];
      // Cargar sedes para mostrar el nombre de la sede en el select (evita confusión)
      let sedesMap = {};
      try {
        const sedes = await apiFetch('/api/sedes') || [];
        sedes.forEach(s => { sedesMap[String(s.id)] = s.nombre; });
      } catch (e) {
        // si falla, no es crítico; seguimos sin nombres de sedes
        console.warn('No se pudieron cargar sedes para etiquetar escuelas');
      }

      const mapped = escuelasData.map(sc => ({ ...sc, sede_nombre: sedesMap[String(sc.sede_id)] || null }));
      setEscuelas(mapped);
    } catch(e){ console.error(e); }
  };

  const createJefe = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const body = { primer_nombre: primerNombre, segundo_nombre: segundoNombre, primer_apellido: primerApellido, segundo_apellido: segundoApellido, rut, escuela_id: escuelaId || undefined, email: email || undefined };
        if (password) body.password = password;
        await apiFetch(`/api/jefes/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        setMsg('Jefe actualizado');
        setEditingId(null);
      } else {
        await apiFetch('/api/jefes', { method: 'POST', body: JSON.stringify({ primer_nombre: primerNombre, segundo_nombre: segundoNombre, primer_apellido: primerApellido, segundo_apellido: segundoApellido, rut, escuela_id: escuelaId || undefined, email, password }) });
        setMsg('Jefe creado');
      }
      setPrimerNombre(''); setSegundoNombre(''); setPrimerApellido(''); setSegundoApellido(''); setRut(''); setEscuelaId(''); loadJefes();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
        <h2 className="text-xl font-bold">Gestión de Jefes de Carrera</h2>
        <p className="text-sm text-gray-600">Crear, editar y asignar jefes a escuelas</p>
      </div>

      {msg && <div className="p-3 bg-blue-50 rounded">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Crear Jefe de Carrera</h3>
          <form onSubmit={createJefe} className="space-y-2">
            <div className="grid md:grid-cols-2 gap-2">
              <input placeholder="Primer nombre" value={primerNombre} onChange={e=>setPrimerNombre(e.target.value)} required className="w-full p-2 border rounded" />
              <input placeholder="Segundo nombre" value={segundoNombre} onChange={e=>setSegundoNombre(e.target.value)} className="w-full p-2 border rounded" />
              <input placeholder="Primer apellido" value={primerApellido} onChange={e=>setPrimerApellido(e.target.value)} required className="w-full p-2 border rounded" />
              <input placeholder="Segundo apellido" value={segundoApellido} onChange={e=>setSegundoApellido(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <input placeholder="Email (login)" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-2 border rounded" />
              <input placeholder="Contraseña (opcional)" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <input placeholder="RUT" value={rut} onChange={e=>setRut(e.target.value)} className="w-full p-2 border rounded" />
            <select value={escuelaId} onChange={e=>setEscuelaId(e.target.value)} className="w-full p-2 border rounded">
              <option value="">(Seleccionar escuela)</option>
              {escuelas.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}{s.sede_nombre ? ` — ${s.sede_nombre}` : ''}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-institutional-gold-gradient text-white rounded">Crear Jefe</button>
          </form>
        </div>

        <div className="bg-white p-4 rounded-xl shadow overflow-auto max-h-96">
          <h3 className="font-semibold mb-2">Jefes de Carrera</h3>
          {jefes.length === 0 ? <p className="text-sm text-gray-500">No hay jefes registrados</p> : (
            <div className="space-y-2">
              {jefes.map(j => (
                <div key={j.id} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{j.primer_nombre} {j.primer_apellido}</div>
                    <div className="text-xs text-gray-500">RUT: {j.rut} — Escuela ID: {j.escuela_id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingId(j.id); setPrimerNombre(j.primer_nombre || ''); setSegundoNombre(j.segundo_nombre || ''); setPrimerApellido(j.primer_apellido || ''); setSegundoApellido(j.segundo_apellido || ''); setRut(j.rut || ''); setEscuelaId(j.escuela_id || ''); }} className="px-2 py-1 bg-yellow-500 text-white rounded text-sm">Editar</button>
                    <button onClick={async ()=>{ if (!confirm('Eliminar este jefe?')) return; try { await apiFetch(`/api/jefes/${j.id}`, { method: 'DELETE' }); setMsg('Jefe eliminado'); loadJefes(); } catch(e){ setMsg('Error: '+e.message); } }} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Eliminar</button>
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
