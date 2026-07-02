# D&D Campaign Hub — Frontend

Aplicación web para gestionar campañas de Dungeons & Dragons 5e.
Hecha con React 18 y Vite. Consume la API REST del backend.

**[→ Ver Informe Interactivo](https://rawcdn.githack.com/Krayxzlim/dnd-campaign-hub-frontend/2f3e7056692093427c49943306c722ba3e401276/demo.html)**

---

## Tecnologías

| Paquete | Versión | Para qué se usa |
|---------|---------|-------------|
| react | ^18.2 | Librería de UI con hooks y componentes funcionales |
| react-dom | ^18.2 | Renderizado del DOM |
| vite | ^5.0 | Servidor de desarrollo y bundler de producción |
| @vitejs/plugin-react | ^4.2 | Soporte de JSX y Fast Refresh en Vite |

No se usa ninguna librería de ruteo. La navegación entre páginas se maneja con estado de React (`useState`), así la app queda como una SPA sin dependencias extra del lado del cliente.

---

## Estructura de carpetas

```
frontend/
├── index.html                     HTML de entrada (lo inyecta Vite)
├── vite.config.js                 Configuración de Vite (puerto 5173)
├── package.json
└── src/
    ├── main.jsx                   Monta <App /> en el DOM
    ├── App.jsx                    Router principal, navbar y layout
    ├── App.css                    Estilos globales (tema oscuro y dorado)
    │
    ├── context/
    │   └── AuthContext.jsx        Estado global: usuario, login, logout
    │
    ├── services/
    │   └── api.js                 Todos los fetch a la API
    │
    ├── pages/
    │   ├── LoginPage.jsx          Login y registro en tabs
    │   ├── DashboardPage.jsx      Grilla de campañas del usuario
    │   ├── CampaignPage.jsx       Detalle de campaña con tres tabs
    │   └── UsersPage.jsx          Gestión de usuarios (solo DM)
    │
    └── components/
        ├── MissionsTab.jsx        CRUD de misiones y asignación de jugadores
        ├── EncountersTab.jsx      Constructor de encuentros y tracker de combate
        ├── PlayersTab.jsx         Lista de jugadores de la campaña
        ├── MonsterSearch.jsx      Búsqueda de monstruos con filtros
        └── MonsterDetailModal.jsx Ficha completa del monstruo
```

---

## Instalación

### Requisitos

- Node.js 18 o superior
- npm 8 o superior
- Backend corriendo en `http://localhost:3001`

### Pasos

```bash
# 1. Entrar a la carpeta
cd frontend

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
```

Salida esperada:

```
  VITE v5.x  ready in xxx ms

  Local:   http://localhost:5173/
```

Abrir `http://localhost:5173` en el navegador.

### Build de producción (opcional)

```bash
npm run build
# Genera la carpeta dist/ con los archivos compilados
```

---

## Componentes y páginas

### AuthContext.jsx

Contexto global que expone el estado del usuario autenticado a toda la app.

- Guarda el JWT en `localStorage` bajo la clave `dnd_token`.
- Al arrancar, intenta restaurar la sesión llamando a `GET /api/auth/me`.
- Expone `user`, `loading`, `login(email, password)`, `register(...)` y `logout()`.

---

### api.js — Capa de servicio

Centraliza todos los llamados HTTP al backend. Cada función:

1. Lee el token de `localStorage`.
2. Agrega el header `Authorization: Bearer <token>`.
3. Hace el `fetch` y tira un `Error` si la respuesta no es ok.

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
| Monstruos | `getMonsters`, `searchMonsters`, `getMonsterDetail`, `createMonster`, `deleteMonster` |
| Usuarios | `getUsers`, `getPlayers`, `deleteUser` |

---

### App.jsx — Router y layout

Maneja la navegación con una función `navigate(page, extraData)` que se pasa como prop. Las páginas disponibles son `dashboard`, `campaign` y `users`.

La navbar solo se muestra si hay un usuario autenticado. Incluye:

- Nombre y avatar del usuario.
- Badge de rol (DM en violeta, Jugador en dorado).
- Botón de logout, que llama a `logout()` del contexto.
- Link a Usuarios, visible solo para el rol `dm`.

---

### LoginPage.jsx

Dos modos en tabs: Ingresar y Registrarse.

- El formulario de registro suma los campos de usuario y rol.
- Botones de acceso rápido "DM Demo" y "Player Demo" para probar la app sin cargar datos a mano.
- Muestra los errores que devuelve la API (credenciales inválidas, email ya registrado, etc).
- Fondo animado con íconos flotantes de temática D&D.

---

### DashboardPage.jsx

Vista principal después de loguearse. Muestra todas las campañas del usuario en tarjetas.

- DM: ve sus propias campañas, puede crearlas y borrarlas.
- Jugador: ve solo las campañas a las que pertenece.

Cada tarjeta muestra nombre, descripción, ícono, estado, cantidad de jugadores y cantidad de misiones.

El modal de creación deja al DM elegir nombre, descripción e ícono (emoji).

---

### CampaignPage.jsx

Vista de detalle de una campaña puntual, con tres tabs:

| Tab | Componente | Descripción |
|-----|-----------|--------------|
| Misiones | MissionsTab | Lista y gestión de misiones |
| Encuentros | EncountersTab | Constructor de combate y tracker en vivo |
| Jugadores | PlayersTab | Miembros de la campaña |

---

### MissionsTab.jsx

- Lista todas las misiones de la campaña con badges de estado y dificultad.
- DM: puede crear misiones, asignarlas a jugadores, marcarlas como completadas y borrarlas.
- Jugador: solo ve las misiones disponibles o las que tiene asignadas.
- El formulario de creación incluye título, descripción, recompensa y dificultad.
- La asignación usa un `<select>` con los jugadores de la campaña.

Colores de estado: Disponible (azul), En curso (dorado), Completada (verde).

Colores de dificultad: Fácil (verde), Media (dorado), Difícil (rojo), Mortal (violeta).

---

### EncountersTab.jsx

El componente más complejo de la app. Tiene dos modos:

Modo constructor (antes del combate):

- Formulario para crear un encuentro con nombre y descripción.
- Búsqueda de monstruos con cantidad configurable para cada uno.
- Botón "Iniciar Combate", que llama a `POST /encounters/:id/start`.

Modo tracker de combate (durante el combate):

- La API tira la iniciativa (d20) automáticamente para cada instancia de monstruo.
- Muestra la lista ordenada de iniciativa con posición, tirada, nombre y CA.
- Una barra de vida que pasa de verde a dorado a rojo según el porcentaje restante.
- Un input numérico para aplicar daño más un botón "Aplicar" (solo DM).
- Una etiqueta "Caído" cuando la vida llega a cero.
- Controles de "Siguiente Ronda" y "Terminar Combate".

---

### PlayersTab.jsx

- Lista a los jugadores actuales de la campaña con avatar, nombre y email.
- DM: puede sacar jugadores existentes y agregar nuevos de la lista de usuarios registrados que todavía no están en la campaña.

---

### UsersPage.jsx

Accesible solo para el rol `dm`. Muestra todos los usuarios del sistema divididos en Dungeon Masters y Jugadores. El DM puede borrar cualquier usuario menos a sí mismo (esto se valida en el backend).

---

## Diseño y estilos

El diseño sigue una estética dark fantasy:

| Elemento | Valor |
|---------|-------|
| Fondo | `#0D0D14` |
| Secciones | `#16161F` |
| Dorado | `#C9A84C` |
| Dorado claro | `#E8C97A` |
| Texto principal | `#E8E0D0` |
| Texto secundario | `#8A8070` |
| Fuente | system-ui, con una tipografía serif para los títulos |

No se usa ningún framework de CSS. Todos los estilos viven en `App.css` con variables nativas de CSS.

---

## Notas de seguridad del frontend

- El JWT se guarda en `localStorage` y se borra al hacer logout.
- Si el token expiró o es inválido, `AuthContext` lo detecta al arrancar y limpia el estado.
- Las rutas exclusivas del DM (el link a Usuarios, las acciones de crear/editar/borrar) no se renderizan si `user.role !== 'dm'`.
- Esto es solo una comodidad del lado del cliente. La autorización real siempre la valida también el backend.

---

## Cuentas de demostración

| Rol | Email | Contraseña |
|------|-------|----------|
| Dungeon Master | `dm@dndcompanion.com` | `dm123456` |
| Jugador | `player@dndcompanion.com` | `player123` |

---

## Demo estática

`demo.html` es un recorrido estático y autocontenido de la interfaz, pensado para GitHub Pages. No llama a la API real: es un conjunto de pantallas ilustrativas de las vistas principales, con un poco de interacción para poder probar el flujo de login, tabs y combate, más una explicación breve de cómo se conectan los dos repositorios. Ver el bloque de comentarios al principio de ese archivo para más detalle. El link de arriba ("Ver Informe Interactivo") apunta a esta misma demo publicada.
