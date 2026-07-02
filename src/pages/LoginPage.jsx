import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'player' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password, form.role);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-particles">
          {['✦','⚔️','🐉','🗡️','🧙','🛡️','✦','🏰'].map((s,i) => (
            <span key={i} className="particle" style={{
              left: `${10 + i*12}%`,
              animationDelay: `${i*0.7}s`,
              animationDuration: `${3+i*0.5}s`
            }}>{s}</span>
          ))}
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">⚔️</div>
          <h1 className="login-title">D&D Campaign Hub</h1>
          <p className="login-subtitle">TU CAMPAÑA, SIEMPRE ORGANIZADA</p>
          <div className="login-divider" />
        </div>

        <div className="login-tabs">
          <button className={`tab-btn ${mode==='login'?'active':''}`} onClick={() => setMode('login')}>
            Ingresar
          </button>
          <button className={`tab-btn ${mode==='register'?'active':''}`} onClick={() => setMode('register')}>
            Registrarse
          </button>
        </div>

        <form onSubmit={submit} className="login-form">
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">✦ NOMBRE DE AVENTURERO</label>
                <input
                  className="form-input" name="username" placeholder="Tu nombre en la campaña"
                  value={form.username} onChange={handle} required
                />
              </div>
              <div className="form-group">
                <label className="form-label">✦ ROL</label>
                <select className="form-input" name="role" value={form.role} onChange={handle}>
                  <option value="player">⚔️ Jugador</option>
                  <option value="dm">🧙 Dungeon Master</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">✦ CORREO ELECTRÓNICO</label>
            <input
              className="form-input" name="email" type="email"
              placeholder="aventurero@example.com"
              value={form.email} onChange={handle} required
            />
          </div>

          <div className="form-group">
            <label className="form-label">✦ CONTRASEÑA</label>
            <input
              className="form-input" name="password" type="password"
              placeholder="••••••••"
              value={form.password} onChange={handle} required
            />
          </div>

          {error && <div className="form-error">⚠️ {error}</div>}

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? '⚔️ INGRESAR AL REINO' : '✦ CREAR CUENTA'}
          </button>
        </form>

        <div className="login-demo">
          <p>Cuentas de demostración:</p>
          <button className="demo-btn" onClick={() => setForm(p => ({...p, email:'dm@dndcompanion.com', password:'dm123456'}))}>
            🧙 DM Demo
          </button>
          <button className="demo-btn" onClick={() => setForm(p => ({...p, email:'player@dndcompanion.com', password:'player123'}))}>
            ⚔️ Player Demo
          </button>
        </div>
      </div>
    </div>
  );
}
