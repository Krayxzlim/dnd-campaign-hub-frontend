# D&D Campaign Hub — Frontend

Single-page application for managing Dungeons & Dragons 5e campaigns.
Built with React 18 and Vite. Consumes the backend REST API.

---

## Technologies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2 | UI library with hooks and functional components |
| react-dom | ^18.2 | DOM rendering |
| vite | ^5.0 | Development server and production bundler |
| @vitejs/plugin-react | ^4.2 | JSX support and Fast Refresh in Vite |

No external routing library is used. Navigation between pages is handled with plain React state (`useState`), keeping the app a dependency-free SPA on the client side.

---

## Folder structure

```
frontend/
├── index.html                     Entry point HTML (injected by Vite)
├── vite.config.js                 Vite configuration (port 5173)
├── package.json
└── src/
    ├── main.jsx                   Mounts <App /> in the DOM
    ├── App.jsx                    Main router, navbar, and layout
    ├── App.css                    Global styles (dark gold D&D theme)
    │
    ├── context/
    │   └── AuthContext.jsx        Global state: user, login, logout
    │
    ├── services/
    │   └── api.js                 All fetch calls to the API
    │
    ├── pages/
    │   ├── LoginPage.jsx          Login and registration tabs
    │   ├── DashboardPage.jsx      Grid of the user's campaigns
    │   ├── CampaignPage.jsx       Campaign detail with three tabs
    │   └── UsersPage.jsx          User management (DM only)
    │
    └── components/
        ├── MissionsTab.jsx        Mission CRUD and player assignment
        ├── EncountersTab.jsx      Encounter builder and combat tracker
        ├── PlayersTab.jsx         Campaign player list
        ├── MonsterSearch.jsx      Monster catalog search with filters
        └── MonsterDetailModal.jsx Full monster stat block
```

---

## Installation and setup

### Requirements

- Node.js 18 or higher
- npm 8 or higher
- Backend running at `http://localhost:3001`

### Steps

```bash
# 1. Move into the folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Expected output:

```
  VITE v5.x  ready in xxx ms

  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in the browser.

### Production build (optional)

```bash
npm run build
# Generates the dist/ folder with the compiled assets
```

---

## Components and pages

### AuthContext.jsx

Global context that provides the authenticated user's state to the entire app.

- Persists the JWT in `localStorage` under the key `dnd_token`.
- On startup, attempts to restore the session by calling `GET /api/auth/me`.
- Exposes `user`, `loading`, `login(email, password)`, `register(...)`, and `logout()`.

---

### api.js — Service layer

Centralizes all HTTP calls to the backend. Each function:

1. Reads the token from `localStorage`.
2. Adds the `Authorization: Bearer <token>` header.
3. Performs the `fetch` call and throws an `Error` if the response is not ok.

```js
// Example usage from any component:
const campaigns = await api.getCampaigns();
await api.createMission({ campaignId, title, reward, difficulty });
```

Available functions:

| Group | Functions |
|-------|-----------|
| Auth | `login`, `register`, `me` |
| Campaigns | `getCampaigns`, `getCampaign`, `createCampaign`, `updateCampaign`, `deleteCampaign`, `addPlayer`, `removePlayer` |
| Missions | `getMissions`, `createMission`, `updateMission`, `deleteMission`, `assignMission`, `completeMission` |
| Encounters | `getEncounters`, `getEncounter`, `createEncounter`, `startEncounter`, `applyDamage`, `nextRound`, `endEncounter`, `deleteEncounter` |
| Monsters | `getMonsters`, `searchMonsters`, `getMonsterDetail`, `createMonster`, `deleteMonster` |
| Users | `getUsers`, `getPlayers`, `deleteUser` |

---

### App.jsx — Router and layout

Handles navigation with a `navigate(page, extraData)` function passed as a prop. The available pages are `dashboard`, `campaign`, and `users`.

The navbar is shown only when a user is authenticated. It includes:

- User name and avatar.
- Role badge (DM in purple, Player in gold).
- Logout button, which calls `logout()` from the context.
- Link to Users, visible only for the `dm` role.

---

### LoginPage.jsx

Two modes in tabs: Sign in and Register.

- The registration form adds username and role fields.
- Quick-access "DM Demo" and "Player Demo" buttons for demonstration purposes.
- Displays errors returned by the API (invalid credentials, email already registered, and so on).
- Animated background with floating D&D-themed icons.

---

### DashboardPage.jsx

Main view after login. Shows all of the user's campaigns as cards.

- DM: sees their own campaigns, can create and delete them.
- Player: sees only the campaigns they belong to.

Each card shows name, description, icon, status, player count, and mission count.

The creation modal lets the DM choose a name, description, and icon (emoji).

---

### CampaignPage.jsx

Detail view for a specific campaign, with three tabs:

| Tab | Component | Description |
|-----|-----------|--------------|
| Missions | MissionsTab | Mission list and management |
| Encounters | EncountersTab | Combat builder and live tracker |
| Players | PlayersTab | Campaign members |

---

### MissionsTab.jsx

- Lists all missions in the campaign with status and difficulty badges.
- DM: can create missions, assign them to players, mark them completed, and delete them.
- Player: sees only available missions or missions assigned to them.
- The creation form includes title, description, reward, and difficulty.
- Assignment uses a `<select>` listing the campaign's players.

Status colors: Available (blue), In progress (gold), Completed (green).

Difficulty colors: Easy (green), Medium (gold), Hard (red), Deadly (purple).

---

### EncountersTab.jsx

The most complex component in the app. It has two modes:

Builder mode (before combat):

- Form to create an encounter with a name and description.
- Monster search with a configurable quantity per monster.
- "Start Combat" button, which calls `POST /encounters/:id/start`.

Combat tracker mode (during combat):

- The API automatically rolls initiative (d20) for each monster instance.
- Displays the ordered initiative list with position, initiative roll, name, and AC.
- An HP bar that changes from green to gold to red based on remaining percentage.
- A numeric input to apply damage plus an "Apply" button (DM only).
- A "Down" label once HP reaches zero.
- "Next Round" and "End Combat" controls.

---

### PlayersTab.jsx

- Lists the campaign's current players with avatar, name, and email.
- DM: can remove existing players and add new ones from a list of registered players not yet in the campaign.

---

### UsersPage.jsx

Accessible only to the `dm` role. Shows all system users split into Dungeon Masters and Players. The DM can delete any user except themselves (enforced by the backend).

---

## Design and styling

The design follows a dark-fantasy theme:

| Element | Value |
|---------|-------|
| Background | `#0D0D14` |
| Sections | `#16161F` |
| Gold accent | `#C9A84C` |
| Light gold | `#E8C97A` |
| Primary text | `#E8E0D0` |
| Secondary text | `#8A8070` |
| Font | system-ui, with a serif face for headings |

No CSS framework is used. All styling lives in `App.css` using native CSS custom properties.

---

## Frontend security notes

- The JWT is stored in `localStorage` and removed on logout.
- If the token is expired or invalid, `AuthContext` detects this on startup and clears the state.
- DM-only routes (the Users navbar link, create/edit/delete actions) are not rendered when `user.role !== 'dm'`.
- This is a client-side convenience only. Authorization is always enforced by the backend as well.

---

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Dungeon Master | `dm@dndcompanion.com` | `dm123456` |
| Player | `player@dndcompanion.com` | `player123` |

---

## Static demo

`demo.html` is a self-contained, static walkthrough of the interface intended for GitHub Pages. It does not call the backend API; it is a set of illustrative mockups of the main screens plus a short explanation of how the two repositories work together. See the comment block at the top of that file for details.
