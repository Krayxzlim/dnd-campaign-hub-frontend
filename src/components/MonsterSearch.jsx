import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";

const TYPES = [
  "Aberration",
  "Beast",
  "Celestial",
  "Construct",
  "Dragon",
  "Elemental",
  "Fey",
  "Fiend",
  "Giant",
  "Humanoid",
  "Monstrosity",
  "Ooze",
  "Plant",
  "Undead",
];

const CRS = [
  "0",
  "1/8",
  "1/4",
  "1/2",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
];

// Buscador de monstruos con filtros por nombre, tipo y CR.
// Pega directo contra el backend (que a su vez filtra en Open5e),
// así la búsqueda cubre toda la base de monstruos y no solo una página.
export default function MonsterSearch({ onSelect }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [cr, setCr] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);
  const boxRef = useRef(null);

  // Dispara la búsqueda con debounce cada vez que cambia algún filtro
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // No buscamos hasta que haya al menos un filtro activo, para no
    // traer de entrada cientos de resultados sin sentido.
    if (!search && !type && !cr) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.searchMonsters({ search, type, cr });
        setResults(data.results || []);
        setOpen(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [search, type, cr]);

  // Cierra el dropdown de resultados al clickear afuera
  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pick = (mon) => {
    onSelect(mon);
    setSearch("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="monster-search" ref={boxRef}>
      <div className="monster-search-filters">
        <input
          className="form-input"
          placeholder="Buscar monstruo por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        <select
          className="form-input monster-search-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Tipo: cualquiera</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="form-input monster-search-select"
          value={cr}
          onChange={(e) => setCr(e.target.value)}
        >
          <option value="">CR: cualquiera</option>
          {CRS.map((c) => (
            <option key={c} value={c}>
              CR {c}
            </option>
          ))}
        </select>
        {(search || type || cr) && (
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => {
              setSearch("");
              setType("");
              setCr("");
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {open && (
        <div className="monster-search-results">
          {loading && <div className="monster-search-status">Buscando...</div>}
          {!loading && results.length === 0 && (
            <div className="monster-search-status">Sin resultados.</div>
          )}
          {!loading &&
            results.map((m) => (
              <button
                type="button"
                key={m.id}
                className="monster-search-item"
                onClick={() => pick(m)}
              >
                <span className="monster-search-item-name">{m.name}</span>
                <span className="monster-search-item-meta">
                  {m.type} · CR {m.cr} · {m.hp} PG · CA {m.ac}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
