# ⚔️ D&D Campaign Hub — Frontend

Single Page Application para gestión de campañas de D&D 5e.  
Construida con React 18 + Vite. Consume la API REST del backend.

---

## 🛠️ Tecnologías

| Paquete | Versión | Para qué sirve |
|---------|---------|----------------|
| **react** | ^18.2 | Librería de UI con hooks y componentes funcionales |
| **react-dom** | ^18.2 | Renderizado en el DOM |
| **vite** | ^5.0 | Dev server ultrarrápido y bundler de producción |
| **@vitejs/plugin-react** | ^4.2 | Soporte JSX y Fast Refresh en Vite |

> No se usan librerías de routing externas. La navegación entre páginas se maneja con estado de React puro (`useState`), cumpliendo el requisito de SPA sin dependencias de backend.

---

## 📁 Estructura de carpetas

```
frontend/
├── index.html                     ← Entry point HTML (Vite lo inyecta)
├── vite.config.js                 ← Configuración de Vite (puerto 5173)
├── package.json
└── src/
    ├── main.jsx                   ← Monta <App /> en el DOM
    ├── App.jsx                    ← Router principal + Navbar + layout
    ├── App.css                    ← Estilos globales (tema oscuro dorado D&D)
    │
    ├── context/
    │   └── AuthContext.jsx        ← Estado global: usuario, login, logout
    │
    ├── services/
    │   └── api.js                 ← Todas las llamadas fetch a la API
    │
    ├── pages/
    │   ├── LoginPage.jsx          ← Login + registro con tabs
    │   ├── DashboardPage.jsx      ← Grilla de campañas del usuario
    │   ├── CampaignPage.jsx       ← Detalle de campaña con 3 tabs
    │   └── UsersPage.jsx          ← Gestión de usuarios (solo DM)
    │
    └── components/
        ├── MissionsTab.jsx        ← CRUD de misiones + asignación a jugadores
        ├── EncountersTab.jsx      ← Constructor de encuentros + combat tracker
        └── PlayersTab.jsx         ← Jugadores de la campaña
```

---

## 🚀 Instalación y arranque

### Requisitos previos
- Node.js >= 18
- npm >= 8
- El backend corriendo en `http://localhost:3001`

### Pasos

```bash
# 1. Entrar a la carpeta
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo
npm run dev
```

Salida esperada:
```
  VITE v5.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Abrir **http://localhost:5173** en el navegador.

### Build de producción (opcional)

```bash
npm run build
# Genera la carpeta dist/ con los archivos compilados
```

---

## 🧩 Componentes y páginas

### `AuthContext.jsx`
Contexto global que provee a toda la app el estado del usuario autenticado.

- Persiste el JWT en `localStorage` bajo la clave `dnd_token`.
- Al iniciar la app, intenta recuperar la sesión llamando a `GET /api/auth/me`.
- Expone: `user`, `loading`, `login(email, pass)`, `register(...)`, `logout()`.

---

### `api.js` — Capa de servicio

Centraliza **todas** las llamadas HTTP al backend. Cada función:
1. Lee el token de `localStorage`.
2. Agrega el header `Authorization: Bearer <token>`.
3. Hace el `fetch` y lanza un `Error` si la respuesta no es ok.

```js
// Ejemplo de uso desde cualquier componente:
const campaigns = await api.getCampaigns();
await api.createMission({ campaignId, title, reward, difficulty });
```

Funciones disponibles:

| Grupo | Funciones |
|-------|-----------|
| Auth | `login`, `register`, `me` |
| Campañas | `getCampaigns`, `getCampaign`, `createCampaign`, `updateCampaign`, `deleteCampaign`, `addPlayer`, `removePlayer` |
| Misiones | `getMissions`, `createMission`, `updateMission`, `deleteMission`, `assignMission`, `completeMission` |
| Encuentros | `getEncounters`, `getEncounter`, `createEncounter`, `startEncounter`, `applyDamage`, `nextRound`, `endEncounter`, `deleteEncounter` |
| Monstruos | `getMonsters`, `createMonster`, `deleteMonster` |
| Usuarios | `getUsers`, `getPlayers`, `deleteUser` |

---

### `App.jsx` — Router y layout

Maneja la navegación con una función `navigate(page, extraData)` pasada como prop. Las páginas posibles son `'dashboard'`, `'campaign'` y `'users'`.

La **Navbar** se muestra solo cuando hay usuario autenticado. Incluye:
- Nombre y avatar del usuario.
- Badge de rol (DM en violeta, Player en dorado).
- Botón "Salir" que llama a `logout()` del contexto.
- Enlace a Usuarios visible solo para el rol `dm`.

---

### `LoginPage.jsx`

Dos modos en tabs: **Ingresar** y **Registrarse**.

- El formulario de registro agrega campos de nombre de usuario y selector de rol.
- Botones de acceso rápido "DM Demo" y "Player Demo" para demostración.
- Muestra errores recibidos de la API (credenciales incorrectas, email ya registrado, etc.).
- Fondo animado con partículas flotantes (íconos de D&D).

---

### `DashboardPage.jsx`

Vista principal después del login. Muestra todas las campañas del usuario como tarjetas.

- **DM:** ve sus propias campañas, puede crear nuevas y eliminarlas.
- **Player:** ve solo las campañas a las que pertenece.

Cada tarjeta muestra: nombre, descripción, ícono, estado, cantidad de jugadores y misiones.

El modal de creación permite elegir nombre, descripción e ícono (emoji).

---

### `CampaignPage.jsx`

Detalle de una campaña específica. Contiene tres tabs:

| Tab | Componente | Descripción |
|-----|-----------|-------------|
| 📜 Misiones | `MissionsTab` | Listado y gestión de misiones |
| ⚔️ Encuentros | `EncountersTab` | Constructor de combate y tracker en vivo |
| 👥 Jugadores | `PlayersTab` | Miembros de la campaña |

---

### `MissionsTab.jsx`

- Lista todas las misiones de la campaña con badge de estado y dificultad.
- **DM:** puede crear, asignar a jugadores, marcar como completadas y eliminar.
- **Player:** solo ve las misiones disponibles o las que le fueron asignadas.
- El formulario de creación incluye título, descripción, recompensa y dificultad.
- La asignación se hace con un `<select>` que lista los jugadores de la campaña.

**Colores de estado:**
- Disponible → azul
- En Curso → dorado
- Completada → verde

**Colores de dificultad:**
- Fácil → verde / Moderado → dorado / Difícil → rojo / Mortal → violeta

---

### `EncountersTab.jsx`

El componente más complejo de la app. Tiene dos modos:

**Modo constructor (antes del combate):**
- Formulario para crear un encuentro con nombre y descripción.
- Selector de monstruos del catálogo con cantidad configurable.
- Botón "Iniciar Combate" que llama a `POST /encounters/:id/start`.

**Modo combat tracker (durante el combate):**
- La API tira automáticamente iniciativa (d20) para cada instancia de monstruo.
- Se muestra la lista ordenada por iniciativa con:
  - Posición, resultado de iniciativa, nombre, CA.
  - Barra de HP que cambia de verde → dorado → rojo según el porcentaje.
  - Input numérico para aplicar daño + botón "💀 Aplicar" (DM únicamente).
  - Label "💀 Caído" cuando el HP llega a 0.
- Botones de "Siguiente Ronda" y "Terminar Combate".

---

### `PlayersTab.jsx`

- Lista los jugadores actuales de la campaña con avatar, nombre y email.
- **DM:** puede remover jugadores existentes y agregar nuevos desde una lista de jugadores registrados que aún no están en la campaña.

---

### `UsersPage.jsx`

Solo accesible para el rol `dm`. Muestra todos los usuarios del sistema separados en dos secciones: Dungeon Masters y Jugadores. El DM puede eliminar cualquier usuario (excepto a sí mismo, validación en el backend).

---

## 🎨 Diseño y estilos

El diseño replica la estética de la app Android D&D Companion:

| Elemento | Valor |
|----------|-------|
| Fondo | `#0D0D14` (negro azulado) |
| Secciones | `#16161F` |
| Acento dorado | `#C9A84C` |
| Dorado claro | `#E8C97A` |
| Texto principal | `#E8E0D0` |
| Texto secundario | `#8A8070` |
| Fuente | system-ui / serif para títulos |

No se usa ningún framework de CSS. Todo está en `App.css` con variables CSS nativas.

---

## 🔒 Seguridad en el frontend

- El token JWT se guarda en `localStorage` y se elimina al hacer logout.
- Si el token expiró o es inválido, `AuthContext` lo detecta al iniciar y limpia el estado.
- Las rutas de DM (botón "Usuarios" en la navbar, acciones de crear/editar/eliminar) no se renderizan si `user.role !== 'dm'`.
- La segunda línea de defensa siempre está en el backend (el frontend nunca es suficiente).

---

## 💡 Cuentas de demo

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Dungeon Master | `dm@dndcompanion.com` | `dm123456` |
| Jugador | `player@dndcompanion.com` | `player123` |

---

<p align="center"><sub>✦ D&D Campaign Hub · Frontend · ACN4AP ✦</sub></p>
