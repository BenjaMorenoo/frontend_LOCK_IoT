import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cetcom");
  const [sedeId, setSedeId] = useState("");
  const [sedes, setSedes] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadAdmins(); loadSedes(); }, []);

  const loadAdmins = async () => {
    try {
      const data = await apiFetch('/api/admins');
      setAdmins(data || []);
    } catch (err) {
      setMsg('No autorizado o error cargando admins');
    }
  };

  const loadSedes = async () => {
    try {
      const data = await apiFetch('/api/sedes');
      setSedes(data || []);
    } catch (e) {}
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    if (role !== 'cetcom') {
      if (!username || username.trim().length === 0) return setMsg('Usuario requerido');
      if (!password || password.trim().length === 0) return setMsg('Contraseña requerida');
    }
    // si es CETCOM, requerimos seleccionar sede para generar el email
    let emailToSend = null;
    if (role === 'cetcom') {
      if (!sedeId) return setMsg('Selecciona una sede para crear CETCOM');
      const sede = sedes.find(s => String(s.id) === String(sedeId));
      const nombre = sede ? (sede.nombre || '') : '';
      // eliminar diacríticos, caracteres no alfanuméricos y espacios
      const clean = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let slug = clean.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '').toLowerCase();
      if (!slug || slug.length === 0) slug = `sede${sedeId}`;
      emailToSend = `cetcom@${slug}.lockiot.cl`;
    }
    // si username vacío y es cetcom, usaremos el email como username
    const finalUsername = username && username.trim().length > 0 ? username : (emailToSend || username);
    // si password vacío y es cetcom, usamos el email como contraseña por defecto
    const passwordToSend = (role === 'cetcom' && (!password || password.trim().length === 0)) ? (emailToSend) : password;
    try {
      await apiFetch('/api/admins', { method: 'POST', body: JSON.stringify({ username: finalUsername, password: passwordToSend, role, sede_id: sedeId || null, email: emailToSend }) });
      if (role === 'cetcom') {
        setMsg(`CETCOM creado — email: ${emailToSend} contraseña: ${passwordToSend}`);
      } else {
        setMsg('Administrador creado');
      }
      setUsername(''); setPassword(''); setRole('cetcom'); setSedeId('');
      loadAdmins();
    } catch (err) {
      setMsg('Error creando admin: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
        <h2 className="text-xl font-bold">Administradores / CETCOM</h2>
        <p className="text-sm text-gray-600">Crear cuentas CETCOM y otros administradores</p>
      </div>

      {msg && <div className="p-3 bg-blue-50 rounded">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Crear Administrador</h3>
          <form onSubmit={createAdmin} className="space-y-2">
            <input placeholder="Usuario (username)" value={username} onChange={e=>setUsername(e.target.value)} className="w-full p-2 border rounded" />
            <input placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full p-2 border rounded" />
            <select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-2 border rounded">
              <option value="cetcom">CETCOM</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <select value={sedeId} onChange={e=>setSedeId(e.target.value)} className="w-full p-2 border rounded">
              <option value="">Asignar a sede (opcional)</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre} {s.ciudad ? `(${s.ciudad})` : ''}</option>)}
            </select>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-institutional-gold-gradient text-white rounded">Crear</button>
              <button type="button" onClick={() => { setUsername(''); setPassword(''); setRole('cetcom'); setSedeId(''); }} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            </div>
          </form>
        </div>

        <div className="bg-white p-4 rounded-xl shadow overflow-auto max-h-96">
          <h3 className="font-semibold mb-2">Admins existentes</h3>
          {admins.length === 0 ? <p className="text-sm text-gray-500">No hay administradores</p> : (
            <div className="space-y-2">
              {admins.map(a => (
                <div key={a.id} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.username}</div>
                    <div className="text-xs text-gray-500">{a.role} {a.sede_id ? `(sede ${a.sede_id})` : ''}</div>
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
