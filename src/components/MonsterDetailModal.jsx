import { useState, useEffect } from "react";
import { api } from "../services/api";

// Muestra el detalle completo de un monstruo (atributos, habilidades,
// acciones, acciones legendarias) tal como viene normalizado desde
// el backend (que a su vez lo trae de Open5e). Se abre con el slug
// del monstruo y hace su propio fetch para que funcione
// en las tarjetas y en el tracker de iniciativa

export default function MonsterDetailModal({ slug, onClose }) {
  const [monster, setMonster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    api
      .getMonsterDetail(slug)
      .then(setMonster)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!slug) return null;

  const mod = (score) => (score == null ? null : Math.floor((score - 10) / 2));
  const fmtMod = (score) => {
    const m = mod(score);
    if (m == null) return "—";
    return m >= 0 ? `+${m}` : `${m}`;
  };

  // Open5e devuelve speed como objeto, p.ej. { walk: 30, fly: 60 },
  // nunca como string -- hay que formatearlo a mano antes de renderizar.
  const LABELS_VELOCIDAD = {
    walk: "caminando",
    fly: "volando",
    swim: "nadando",
    climb: "trepando",
    burrow: "excavando",
  };
  const fmtSpeed = (speed) => {
    if (!speed) return "—";
    if (typeof speed === "string") return speed;
    return (
      Object.entries(speed)
        .filter(([, v]) => v)
        .map(([k, v]) => `${v} ft. ${LABELS_VELOCIDAD[k] || k}`)
        .join(", ") || "—"
    );
  };

  const stats = [
    { label: "FUE", value: monster?.str },
    { label: "DES", value: monster?.dex },
    { label: "CON", value: monster?.con },
    { label: "INT", value: monster?.int },
    { label: "SAB", value: monster?.wis },
    { label: "CAR", value: monster?.cha },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal monster-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{loading ? "Cargando..." : monster?.name || "Monstruo"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-form monster-detail-body">
          {loading && <div className="loading-text">Cargando monstruo...</div>}
          {error && <div className="alert-error">{error}</div>}

          {!loading && !error && monster && (
            <>
              <p className="monster-detail-subtitle">
                {monster.size} {monster.type}
                {monster.alignment ? `, ${monster.alignment}` : ""}
              </p>

              <div className="monster-detail-core">
                <div className="monster-detail-core-item">
                  <span className="form-label-sm">CA</span>
                  <span>🛡 {monster.ac}</span>
                </div>
                <div className="monster-detail-core-item">
                  <span className="form-label-sm">PG</span>
                  <span>♥ {monster.hp}</span>
                </div>
                <div className="monster-detail-core-item">
                  <span className="form-label-sm">Velocidad</span>
                  <span>{fmtSpeed(monster.speed)}</span>
                </div>
                <div className="monster-detail-core-item">
                  <span className="form-label-sm">CR</span>
                  <span>{monster.cr}</span>
                </div>
                <div className="monster-detail-core-item">
                  <span className="form-label-sm">XP</span>
                  <span>{monster.xp}</span>
                </div>
              </div>

              <div className="monster-detail-attrs">
                {stats.map((s) => (
                  <div key={s.label} className="monster-detail-attr">
                    <span className="monster-detail-attr-label">{s.label}</span>
                    <span className="monster-detail-attr-score">
                      {s.value ?? "—"}
                    </span>
                    <span className="monster-detail-attr-mod">
                      {fmtMod(s.value)}
                    </span>
                  </div>
                ))}
              </div>

              {monster.special_abilities?.length > 0 && (
                <div className="monster-detail-section">
                  <h4 className="form-label">HABILIDADES ESPECIALES</h4>
                  <ul className="monster-detail-list">
                    {monster.special_abilities.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {monster.actions?.length > 0 && (
                <div className="monster-detail-section">
                  <h4 className="form-label">ACCIONES</h4>
                  {monster.actions.map((a, i) => (
                    <div key={i} className="monster-detail-action">
                      <strong>{a.name}.</strong> {a.desc}
                    </div>
                  ))}
                </div>
              )}

              {monster.legendary_actions?.length > 0 && (
                <div className="monster-detail-section">
                  <h4 className="form-label">ACCIONES LEGENDARIAS</h4>
                  <ul className="monster-detail-list">
                    {monster.legendary_actions.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="monster-detail-footer">
                <span>Ataque: {monster.attack}</span>
                <span>Daño: {monster.damage}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
