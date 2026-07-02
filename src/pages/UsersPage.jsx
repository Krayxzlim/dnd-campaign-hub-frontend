import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setUsers(await api.getUsers()); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try { await api.deleteUser(id); load(); }
    catch(e) { setError(e.message); }
  };

  if (loading) return <div className="loading-text">Cargando usuarios...</div>;

  const dms = users.filter(u => u.role === 'dm');
  const players = users.filter(u => u.role === 'player');

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👥 Gestión de Usuarios</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="users-section">
        <h2 className="section-title">🧙 Dungeon Masters ({dms.length})</h2>
        <div className="users-table">
          <div className="users-table-header">
            <span>Avatar</span><span>Usuario</span><span>Email</span><span>Rol</span><span>Acciones</span>
          </div>
          {dms.map(u => (
            <div key={u.id} className="users-table-row">
              <span className="user-table-avatar">{u.avatar}</span>
              <span>{u.username}</span>
              <span className="user-email-cell">{u.email}</span>
              <span><span className="badge badge-purple">DM</span></span>
              <span>
                <button className="btn-danger-sm" onClick={() => remove(u.id)}>Eliminar</button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="users-section">
        <h2 className="section-title">⚔️ Jugadores ({players.length})</h2>
        <div className="users-table">
          <div className="users-table-header">
            <span>Avatar</span><span>Usuario</span><span>Email</span><span>Rol</span><span>Acciones</span>
          </div>
          {players.map(u => (
            <div key={u.id} className="users-table-row">
              <span className="user-table-avatar">{u.avatar}</span>
              <span>{u.username}</span>
              <span className="user-email-cell">{u.email}</span>
              <span><span className="badge badge-gold">Player</span></span>
              <span>
                <button className="btn-danger-sm" onClick={() => remove(u.id)}>Eliminar</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
