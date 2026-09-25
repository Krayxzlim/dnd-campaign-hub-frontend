import { useState, useEffect } from "react";
import { api } from "../services/api";
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="page">
      <h1 className="page-title">Compañeros de campaña</h1>
      <p>Los participantes se administran desde cada campaña.</p>
      {error && <div className="alert-error">{error}</div>}
      <div className="players-grid">
        {users.map((u) => (
          <div className="player-card" key={u.id}>
            {u.avatar} {u.username}
          </div>
        ))}
      </div>
    </div>
  );
}
