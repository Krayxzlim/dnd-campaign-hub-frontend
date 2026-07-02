import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import MonsterSearch from "./MonsterSearch";
import MonsterDetailModal from "./MonsterDetailModal";

export default function EncountersTab({ campaignId }) {
  const { user } = useAuth();
  const [encounters, setEncounters] = useState([]);
  const [active, setActive] = useState(null); // seguimiento
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", monsters: [] });
  const [dmgInputs, setDmgInputs] = useState({});
  const [error, setError] = useState("");
  const [inspectSlug, setInspectSlug] = useState(null);

  useEffect(() => {
    load();
  }, [campaignId]);

  const load = async () => {
    setLoading(true);
    try {
      const e = await api.getEncounters(campaignId);
      setEncounters(e);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadActive = async (id) => {
    try {
      setActive(await api.getEncounter(id));
    } catch (err) {
      setError(err.message);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        campaignId,
        monsters: form.monsters.map((fm) => {
          const count = fm.count || 1;
          return {
            slug: fm.slug || fm.monsterId,
            nombre: fm.name,
            cantidad: count,
            hp_max: fm.hp,
            hp_actual: Array.from({ length: count }, () => fm.hp),
            ca: fm.ac,
            cr: fm.cr,
            xp_unidad: fm.xp,
          };
        }),
      };
      await api.createEncounter(payload);
      setShowCreate(false);
      setForm({ name: "", description: "", monsters: [] });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Llamado desde MonsterSearch cuando el usuario elige un resultado.
  const addMonsterToForm = (mon) => {
    setForm((prev) => ({
      ...prev,
      monsters: [
        ...prev.monsters,
        {
          monsterId: mon.id,
          slug: mon.slug || mon.id,
          name: mon.name,
          count: 1,
          hp: mon.hp,
          ac: mon.ac,
          cr: mon.cr,
          xp: mon.xp,
          attack: mon.attack,
          damage: mon.damage,
        },
      ],
    }));
  };

  const updateFormMonster = (index, field, value) => {
    setForm((prev) => {
      const monsters = [...prev.monsters];
      monsters[index] = { ...monsters[index], [field]: value };
      return { ...prev, monsters };
    });
  };

  const startCombat = async (id) => {
    try {
      const enc = await api.startEncounter(id);
      setActive(enc);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const applyDmg = async (monsterId, instanceIndex) => {
    const key = `${monsterId}-${instanceIndex}`;
    const dmg = parseInt(dmgInputs[key] || 0);
    if (!dmg) return;

    try {
      const newInitiativeOrder = active.initiativeOrder.map((entry) => {
        if (
          entry.monsterId === monsterId &&
          entry.instanceIndex === instanceIndex
        ) {
          return { ...entry, hp: Math.max(0, entry.hp - dmg) };
        }
        return entry;
      });

      const newMonsters = active.monsters.map((m) => {
        if (m.slug !== monsterId) return m;
        const newHpActual = [...m.hp_actual];
        newHpActual[instanceIndex] = Math.max(
          0,
          newHpActual[instanceIndex] - dmg,
        );
        return { ...m, hp_actual: newHpActual };
      });

      const enc = await api.applyDamage(active.id, {
        monsters: newMonsters,
        initiativeOrder: newInitiativeOrder,
      });
      setActive(enc);
      setDmgInputs((p) => ({ ...p, [key]: "" }));
    } catch (err) {
      setError(err.message);
    }
  };

  const nextRound = async () => {
    try {
      setActive(await api.nextRound(active.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const endCombat = async () => {
    if (!confirm("¿Terminar el encuentro?")) return;
    try {
      await api.endEncounter(active.id);
      setActive(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteEncounter = async (id, e) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar este encuentro?")) return;
    try {
      await api.deleteEncounter(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const hpPercent = (cur, max) => Math.max(0, Math.round((cur / max) * 100));
  const hpColor = (pct) =>
    pct > 60 ? "#6DBF6D" : pct > 30 ? "#C9A84C" : "#E57373";

  if (loading)
    return <div className="loading-text">Cargando encuentros...</div>;

  return (
    <div>
      {error && <div className="alert-error">{error}</div>}

      {/* Modal de ficha de monstruo: solo el DM puede inspeccionar */}
      {user.role === "dm" && inspectSlug && (
        <MonsterDetailModal
          slug={inspectSlug}
          onClose={() => setInspectSlug(null)}
        />
      )}

      {/* seguimiento de compbates activos */}
      {active && (
        <div className="combat-tracker">
          <div className="tracker-header">
            <div>
              <h2 className="tracker-title">⚔️ {active.name}</h2>
              <span className="tracker-round">Ronda {active.round}</span>
            </div>
            {user.role === "dm" && (
              <div className="tracker-controls">
                <button className="btn-secondary" onClick={nextRound}>
                  Siguiente Ronda →
                </button>
                <button className="btn-danger" onClick={endCombat}>
                  Terminar Combate
                </button>
                <button className="btn-sm" onClick={() => setActive(null)}>
                  ✕ Cerrar
                </button>
              </div>
            )}
          </div>

          <h3 className="tracker-sub">📋 Orden de Iniciativa</h3>
          <div className="initiative-list">
            {active.initiativeOrder.map((entry, i) => {
              const pct = hpPercent(entry.hp, entry.maxHp);
              const key = `${entry.monsterId}-${entry.instanceIndex}`;
              return (
                <div
                  key={i}
                  className={`initiative-row ${entry.hp <= 0 ? "dead" : ""}`}
                >
                  <span className="init-pos">#{i + 1}</span>
                  <span className="init-initiative">🎲 {entry.initiative}</span>
                  {user.role === "dm" ? (
                    <button
                      type="button"
                      className="init-name init-name-link"
                      onClick={() => setInspectSlug(entry.monsterId)}
                      title="Ver ficha del monstruo"
                    >
                      {entry.name}
                    </button>
                  ) : (
                    <span className="init-name">{entry.name}</span>
                  )}
                  <span className="init-ac">🛡 {entry.ac}</span>
                  <div className="init-hp-bar-wrap">
                    <div className="init-hp-bar">
                      <div
                        className="init-hp-fill"
                        style={{ width: `${pct}%`, background: hpColor(pct) }}
                      />
                    </div>
                    <span className="init-hp-text">
                      {entry.hp}/{entry.maxHp} PG
                    </span>
                  </div>
                  {user.role === "dm" && entry.hp > 0 && (
                    <div className="dmg-input-group">
                      <input
                        type="number"
                        min="0"
                        className="dmg-input"
                        placeholder="Daño"
                        value={dmgInputs[key] || ""}
                        onChange={(e) =>
                          setDmgInputs((p) => ({ ...p, [key]: e.target.value }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          applyDmg(entry.monsterId, entry.instanceIndex)
                        }
                      />
                      <button
                        className="btn-danger-sm"
                        onClick={() =>
                          applyDmg(entry.monsterId, entry.instanceIndex)
                        }
                      >
                        💀 Aplicar
                      </button>
                    </div>
                  )}
                  {entry.hp <= 0 && (
                    <span className="dead-label">💀 Caído</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">⚔️ Encuentros de Combate</h2>
        {user.role === "dm" && !showCreate && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            ＋ Nuevo Encuentro
          </button>
        )}
      </div>

      {/* form de encuentros */}
      {showCreate && user.role === "dm" && (
        <div className="encounter-builder">
          <div className="builder-header">
            <h3>⚔️ Constructor de Encuentro</h3>
            <button
              className="modal-close"
              onClick={() => setShowCreate(false)}
            >
              ✕
            </button>
          </div>
          <form onSubmit={create}>
            <div className="builder-row">
              <div className="form-group">
                <label className="form-label">NOMBRE DEL ENCUENTRO</label>
                <input
                  className="form-input"
                  placeholder="Emboscada en el Bosque..."
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">DESCRIPCIÓN</label>
                <input
                  className="form-input"
                  placeholder="Los jugadores son emboscados..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">AGREGAR MONSTRUO</label>
              <MonsterSearch onSelect={addMonsterToForm} />
            </div>

            {form.monsters.length > 0 && (
              <div className="monster-list-form">
                <h4 className="form-label">MONSTRUOS EN EL ENCUENTRO</h4>
                {form.monsters.map((fm, i) => (
                  <div key={i} className="monster-form-row">
                    <button
                      type="button"
                      className="monster-form-name monster-form-name-link"
                      onClick={() => setInspectSlug(fm.slug || fm.monsterId)}
                      title="Ver ficha del monstruo"
                    >
                      {fm.name}
                    </button>
                    <label className="form-label-sm">Cantidad:</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="form-input form-input-num"
                      value={fm.count}
                      onChange={(e) =>
                        updateFormMonster(i, "count", parseInt(e.target.value))
                      }
                    />
                    <button
                      type="button"
                      className="btn-danger-sm"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          monsters: p.monsters.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={form.monsters.length === 0}
              >
                ⚔️ Crear Encuentro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* lista de encuentros */}
      {encounters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚔️</div>
          <p>No hay encuentros creados.</p>
        </div>
      ) : (
        <div className="encounters-list">
          {encounters.map((enc) => (
            <div key={enc.id} className={`encounter-card status-${enc.status}`}>
              <div className="encounter-header">
                <div>
                  <h3 className="encounter-name">{enc.name}</h3>
                  <p className="encounter-desc">{enc.description}</p>
                </div>
                <div className="encounter-status-badge">
                  {enc.status === "pending" && (
                    <span className="badge badge-blue">⏳ Pendiente</span>
                  )}
                  {enc.status === "active" && (
                    <span className="badge badge-gold">⚔️ En Combate</span>
                  )}
                  {enc.status === "completed" && (
                    <span className="badge badge-green">✓ Completado</span>
                  )}
                </div>
              </div>

              <div className="monster-summary">
                {enc.monsters.map((m, i) =>
                  user.role === "dm" ? (
                    <button
                      type="button"
                      key={i}
                      className="monster-chip monster-chip-link"
                      onClick={() => setInspectSlug(m.slug)}
                      title="Ver ficha del monstruo"
                    >
                      {m.cantidad > 1 ? `${m.cantidad}× ` : ""}
                      {m.nombre}
                    </button>
                  ) : (
                    <span key={i} className="monster-chip">
                      {m.cantidad > 1 ? `${m.cantidad}× ` : ""}
                      {m.nombre}
                    </span>
                  ),
                )}
              </div>

              <div className="encounter-actions">
                {enc.status === "active" && (
                  <button
                    className="btn-primary"
                    onClick={() => loadActive(enc.id)}
                  >
                    ⚔️ Ver Combate
                  </button>
                )}
                {enc.status === "pending" && user.role === "dm" && (
                  <button
                    className="btn-primary"
                    onClick={() => startCombat(enc.id)}
                  >
                    🎲 Iniciar Combate
                  </button>
                )}
                {user.role === "dm" && (
                  <button
                    className="btn-danger-sm"
                    onClick={(e) => deleteEncounter(enc.id, e)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
