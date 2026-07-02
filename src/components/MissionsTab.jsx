import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const DIFFICULTY = {
  easy: { label: "Fácil", color: "#6DBF6D" },
  medium: { label: "Moderado", color: "#C9A84C" },
  hard: { label: "Difícil", color: "#E57373" },
  deadly: { label: "Mortal", color: "#AB47BC" },
};

const STATUS = {
  available: { label: "Disponible", color: "#6DA8BF" },
  active: { label: "En Curso", color: "#C9A84C" },
  completed: { label: "Completada", color: "#6DBF6D" },
};

export default function MissionsTab({ campaignId, campaign }) {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    reward: "",
    difficulty: "medium",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [campaignId]);

  const load = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        api.getMissions(campaignId),
        user.role === "dm" ? api.getPlayers() : Promise.resolve([]),
      ]);
      setMissions(m);
      setPlayers(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.createMission({ ...form, campaignId });
      setShowCreate(false);
      setForm({ title: "", description: "", reward: "", difficulty: "medium" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const assign = async (missionId, playerId) => {
    try {
      await api.assignMission(missionId, playerId);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const complete = async (id) => {
    try {
      await api.completeMission(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar esta misión?")) return;
    try {
      await api.deleteMission(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const getPlayerName = (id) => {
    const p = campaign.players?.find((p) => p.id === id);
    return p ? `${p.avatar} ${p.username}` : id;
  };

  if (loading) return <div className="loading-text">Cargando misiones...</div>;

  return (
    <div>
      {error && <div className="alert-error">{error}</div>}

      <div className="section-header">
        <h2 className="section-title">📜 Misiones</h2>
        {user.role === "dm" && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            ＋ Nueva Misión
          </button>
        )}
      </div>

      {/* Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✦ Nueva Misión</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreate(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={create} className="modal-form">
              <div className="form-group">
                <label className="form-label">TÍTULO</label>
                <input
                  className="form-input"
                  placeholder="Rescatar al posadero..."
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">DESCRIPCIÓN</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Detalles de la misión..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">RECOMPENSA</label>
                <input
                  className="form-input"
                  placeholder="200 XP + 50 PO"
                  value={form.reward}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reward: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">DIFICULTAD</label>
                <select
                  className="form-input"
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, difficulty: e.target.value }))
                  }
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Moderado</option>
                  <option value="hard">Difícil</option>
                  <option value="deadly">Mortal</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreate(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  ✦ Crear Misión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {missions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <p>No hay misiones todavía.</p>
        </div>
      ) : (
        <div className="missions-list">
          {missions.map((m) => (
            <div key={m.id} className="mission-card">
              <div className="mission-card-header">
                <div className="mission-badges">
                  <span
                    className="badge"
                    style={{
                      background: STATUS[m.status]?.color + "22",
                      color: STATUS[m.status]?.color,
                    }}
                  >
                    ● {STATUS[m.status]?.label || m.status}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: DIFFICULTY[m.difficulty]?.color + "22",
                      color: DIFFICULTY[m.difficulty]?.color,
                    }}
                  >
                    {DIFFICULTY[m.difficulty]?.label || m.difficulty}
                  </span>
                </div>
                {user.role === "dm" && (
                  <div className="mission-dm-actions">
                    {m.status !== "completed" && (
                      <button
                        className="btn-sm btn-success"
                        onClick={() => complete(m.id)}
                      >
                        ✓ Completar
                      </button>
                    )}
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => remove(m.id)}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <h3 className="mission-title">{m.title}</h3>
              <p className="mission-desc">{m.description}</p>

              {m.reward && (
                <div className="mission-reward">
                  <span className="reward-icon">💰</span>
                  <span>{m.reward}</span>
                </div>
              )}

              {m.assignedTo?.length > 0 && (
                <div className="mission-assigned">
                  <span className="assigned-label">Asignada a:</span>
                  {m.assignedTo.map((pid) => (
                    <span key={pid} className="assigned-player">
                      {getPlayerName(pid)}
                    </span>
                  ))}
                </div>
              )}

              {user.role === "dm" &&
                m.status === "available" &&
                players.length > 0 && (
                  <div className="assign-section">
                    <select
                      className="form-input form-input-sm"
                      onChange={(e) =>
                        e.target.value && assign(m.id, e.target.value)
                      }
                      defaultValue=""
                    >
                      <option value="">Asignar a jugador...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.avatar} {p.username}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
