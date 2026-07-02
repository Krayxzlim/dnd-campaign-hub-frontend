import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage({ navigate }) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: "🗺️" });
  const [error, setError] = useState("");

  const IMAGES = ["🗺️", "🏰", "🐉", "⚔️", "🧙", "🌑", "🏔️", "🌊", "🔥", "☠️"];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      setCampaigns(await api.getCampaigns());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.createCampaign(form);
      setShowCreate(false);
      setForm({ name: "", description: "", image: "🗺️" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteCampaign = async (id, e) => {
    e.stopPropagation();
    if (
      !confirm(
        "¿Eliminar esta campaña? Se borrarán todas sus misiones y encuentros.",
      )
    )
      return;
    try {
      await api.deleteCampaign(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const statusColor = (s) =>
    ({ active: "#6DBF6D", completed: "#8A8070", paused: "#C9A84C" })[s] ||
    "#8A8070";
  const statusLabel = (s) =>
    ({ active: "Activa", completed: "Completada", paused: "En Pausa" })[s] || s;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🗺️ Mis Campañas</h1>
          <p className="page-sub">
            Bienvenido/a,{" "}
            <strong>
              {user.avatar} {user.username}
            </strong>
          </p>
        </div>
        {user.role === "dm" && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            ＋ Nueva Campaña
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Modal campaña */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✦ Nueva Campaña</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreate(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={create} className="modal-form">
              <div className="form-group">
                <label className="form-label">NOMBRE</label>
                <input
                  className="form-input"
                  placeholder="La Maldición de Strahd..."
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">DESCRIPCIÓN</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Una campaña épica..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">ÍCONO</label>
                <div className="icon-picker">
                  {IMAGES.map((ico) => (
                    <button
                      type="button"
                      key={ico}
                      className={`icon-opt ${form.image === ico ? "selected" : ""}`}
                      onClick={() => setForm((p) => ({ ...p, image: ico }))}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
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
                  ✦ Crear Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-text">Cargando campañas...</div>
      ) : campaigns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <p>
            {user.role === "dm"
              ? "Aún no creaste ninguna campaña."
              : "No pertenecés a ninguna campaña todavía."}
          </p>
          {user.role === "dm" && (
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              Crear mi primera campaña
            </button>
          )}
        </div>
      ) : (
        <div className="campaigns-grid">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="campaign-card"
              onClick={() => navigate("campaign", c.id)}
            >
              <div className="campaign-card-header">
                <span className="campaign-icon">{c.image}</span>
                <span
                  className="campaign-status"
                  style={{ color: statusColor(c.status) }}
                >
                  ● {statusLabel(c.status)}
                </span>
              </div>
              <h3 className="campaign-name">{c.name}</h3>
              <p className="campaign-desc">
                {c.description || "Sin descripción."}
              </p>
              <div className="campaign-meta">
                <span>👥 {c.playerCount} jugadores</span>
                <span>📜 {c.missionCount} misiones</span>
              </div>
              {user.role === "dm" && (
                <div className="campaign-actions">
                  <button
                    className="btn-danger-sm"
                    onClick={(e) => deleteCampaign(c.id, e)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
