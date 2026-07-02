import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PlayersTab({ campaign, onUpdate }) {
  const { user } = useAuth();
  const [allPlayers, setAllPlayers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user.role === 'dm') {
      api.getPlayers().then(setAllPlayers).catch(e => setError(e.message));
    }
  }, []);

  const addPlayer = async (playerId) => {
    try { await api.addPlayer(campaign.id, playerId); onUpdate(); }
    catch(e) { setError(e.message); }
  };

  const removePlayer = async (playerId) => {
    if (!confirm('¿Remover al jugador de la campaña?')) return;
    try { await api.removePlayer(campaign.id, playerId); onUpdate(); }
    catch(e) { setError(e.message); }
  };

  const campaignPlayerIds = (campaign.players || []).map(p => p.id);
  const availablePlayers = allPlayers.filter(p => !campaignPlayerIds.includes(p.id));

  return (
    <div>
      {error && <div className="alert-error">{error}</div>}

      <div className="section-header">
        <h2 className="section-title">👥 Jugadores en la Campaña</h2>
      </div>

      <div className="players-grid">
        {(campaign.players || []).map(p => (
          <div key={p.id} className="player-card">
            <div className="player-avatar">{p.avatar}</div>
            <div className="player-info">
              <div className="player-name">{p.username}</div>
              <div className="player-email">{p.email}</div>
            </div>
            {user.role === 'dm' && (
              <button className="btn-danger-sm" onClick={() => removePlayer(p.id)}>
                Remover
              </button>
            )}
          </div>
        ))}
        {(campaign.players || []).length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No hay jugadores en esta campaña.</p>
          </div>
        )}
      </div>

      {user.role === 'dm' && availablePlayers.length > 0 && (
        <div className="add-player-section">
          <h3 className="section-title">＋ Agregar Jugadores</h3>
          <div className="players-grid">
            {availablePlayers.map(p => (
              <div key={p.id} className="player-card player-card-add">
                <div className="player-avatar">{p.avatar}</div>
                <div className="player-info">
                  <div className="player-name">{p.username}</div>
                  <div className="player-email">{p.email}</div>
                </div>
                <button className="btn-primary btn-sm" onClick={() => addPlayer(p.id)}>
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
