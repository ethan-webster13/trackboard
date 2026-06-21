# 📋 TrackBoard — Job Application Tracker with Live Listings

A full-stack job application tracker built with **React + Firebase**, featuring a
live job board powered by a public REST API, real-time data sync, and a
Kanban-style pipeline for managing applications.

> This README is also a **learning log**. As an entry-level developer, you can
> read it top-to-bottom to understand *what* the app does, *how* it's organized,
> and *why* each decision was made. It grows as we build each phase.

---

## 🚀 Quick start

```bash
# install dependencies (only needed once)
npm install

# start the dev server with hot reload → http://localhost:5173
npm run dev

# create an optimized production build (output goes to /dist)
npm run build

# preview that production build locally
npm run preview
```

> **Hot reload:** while `npm run dev` is running, saving any file instantly
> updates the browser. You normally never need to restart it.

---

## 🧰 Tech stack & why we chose each piece

| Tool | Role | Why |
|------|------|-----|
| **React** | UI library | Component-based; the industry standard for front-end jobs |
| **Vite** | Build tool / dev server | Fast, modern replacement for the now-deprecated Create React App |
| **React Router** | Page navigation | Lets a single-page app have multiple "pages" / URLs |
| **Plain CSS + design tokens** | Styling | Building our own components shows more skill than a UI library |
| **Firebase Auth** *(Phase 4)* | Login / signup | Real authentication without writing a backend |
| **Firestore** *(Phase 5)* | Database | Cloud database with real-time sync |
| **Remotive API** *(Phase 3)* | Live job data | Free public REST API of remote jobs |
| **Vercel** *(Phase 7)* | Hosting | One-click deploy → live demo link for your resume |

---

## 📁 Project structure

```
trackboard/
├── index.html              ← the single HTML page the app mounts into
├── package.json            ← dependencies + npm scripts
├── vite.config.js          ← Vite configuration
└── src/
    ├── main.jsx            ← entry point; wraps the app in <BrowserRouter>
    ├── App.jsx             ← top-level layout + the route table (URL → page)
    ├── App.css             ← app-shell layout (sticky footer)
    ├── index.css           ← global reset + DESIGN TOKENS (colors, spacing…)
    │
    ├── components/         ← reusable UI pieces shared across pages
    │   ├── Navbar.jsx / .css
    │   ├── Footer.jsx / .css
    │   └── PageHeader.jsx / .css
    │
    ├── pages/              ← one component per route/screen
    │   ├── JobBoard.jsx / .css    ← live listings  (built in Phase 3)
    │   ├── Pipeline.jsx / .css    ← Kanban board   (built in Phases 5–6)
    │   └── Login.jsx / .css       ← auth screen    (built in Phase 4)
    │
    ├── api/                ← code that talks to external services
    │   └── remotive.js     ← Remotive jobs API client
    │
    └── utils/              ← small reusable helper functions
        └── format.js       ← date / label formatting
```

**Mental model:**
- `components/` = small, reusable building blocks (a navbar, a button, a card).
- `pages/` = full screens, assembled *from* components, each tied to a URL.
- A **design token** is a CSS variable like `--color-primary` defined once in
  `index.css`. Every component references `var(--color-primary)` instead of
  hard-coding a color, so the whole app stays consistent and is easy to re-theme.

---

## 🗺️ Build roadmap

| Phase | What we build | Status |
|-------|---------------|--------|
| **1. Scaffold** | Vite + React, folder structure, React Router, CSS reset & tokens | ✅ Done |
| **2. Layout polish** | Navbar, footer, page shells, hero, responsive design | ✅ Done |
| **3. Live Job Board** | Fetch + display Remotive jobs, search/filter, loading & error states | ✅ Done |
| **4. Firebase Auth** | Sign up / log in / log out, protected routes | 🔜 Next |
| **5. Firestore data** | Save a job to your pipeline, real-time sync | ⬜ |
| **6. Kanban pipeline** | Drag jobs across columns (Wishlist → Offer) | ⬜ |
| **7. Polish & deploy** | Responsive cleanup, empty states, deploy to Vercel | ⬜ |

---

## 📚 What each phase taught (learning log)

### ✅ Phase 1 — Scaffold
- **Vite** project setup and the `dev` / `build` / `preview` scripts.
- **React Router basics:** `<BrowserRouter>` wraps the app; `<Routes>` + `<Route>`
  map a URL to a component; `<Navigate>` redirects.
- **Design tokens:** CSS custom properties in `:root` for a consistent theme.
- **git** initialized so every phase is a clean, revertible checkpoint.

### ✅ Phase 2 — Layout polish
- **Reusable components with props** — `PageHeader` takes `title` / `subtitle` /
  `actions` and is used on every page (write once, reuse everywhere).
- **`useState`** — the Login page tracks "login vs signup" mode and re-renders
  the UI when it changes. This is the core idea of React: *state drives the UI.*
- **Rendering lists with `.map()`** — the Pipeline columns come from a single
  `STAGES` array instead of being copy-pasted (the **DRY** principle).
- **Sticky-footer layout** with flexbox, **CSS keyframe animations** (the
  skeleton shimmer), and a **responsive grid** (`auto-fill` + `minmax`).
- **`<NavLink>`** auto-highlights the active page.

### ✅ Phase 3 — Live Job Board
- **Fetching data with `fetch` + `async/await`** — `src/api/remotive.js` isolates
  all API code so components never touch URLs. The rest of the app just calls
  `fetchJobs()`.
- **`useEffect`** — runs side effects (like a network request) after render. An
  **empty dependency array `[]`** means "run once when the component mounts".
- **A loading state machine** — one `status` value cycles through
  `'loading' → 'success' | 'error'`, and the UI renders skeletons, the grid, or
  an error message accordingly. This is how real apps handle async UI.
- **`AbortController`** — cancels an in-flight request if the component unmounts,
  avoiding "set state on an unmounted component" bugs.
- **`useMemo`** — caches derived values (the category list and the filtered job
  list) so they're only recomputed when their inputs change, not on every render.
- **Deriving UI from data** — the category dropdown is built from the jobs we
  actually received (`[...new Set(jobs.map(j => j.category))]`), not a hard-coded
  list, so it always matches reality.
- **Client-side filtering** — search and category both filter the loaded array
  in the browser for instant results.
- **Graceful image fallback** — `JobCard` swaps a broken company logo for a
  letter avatar using the `<img onError>` event.

> 🧩 **Real-world gotcha we hit:** the free Remotive API *ignores* its documented
> `category` and `limit` params and always returns one fixed batch of ~29 jobs.
> We discovered this by testing the API directly, then adapted the design to
> fetch once and filter on the client. **Lesson: verify how an API actually
> behaves — don't trust the docs blindly.**

> *(This section gets a new entry after each phase.)*

---

## 🧠 Glossary for newcomers

- **Component** — a reusable, self-contained piece of UI written as a function
  that returns JSX. `<Navbar />` is a component.
- **JSX** — the HTML-like syntax inside React components. It compiles to JS.
- **Props** — inputs passed into a component, like function arguments:
  `<PageHeader title="My Pipeline" />`.
- **State** — data a component "remembers" between renders, created with
  `useState`. Changing state re-renders the component.
- **Hook** — a special function starting with `use` (e.g. `useState`,
  `useEffect`) that lets components tap into React features.
- **Route** — a mapping from a URL path (`/jobs`) to the component shown there.
- **Hot Module Replacement (HMR)** — Vite swapping changed code into the running
  page without a full reload.
- **`useEffect`** — a hook for running side effects (data fetching, timers,
  subscriptions) after a component renders.
- **Side effect** — anything a component does beyond returning JSX: calling an
  API, reading `localStorage`, setting a timer, etc.
- **`async/await`** — syntax for working with Promises (asynchronous code like
  network requests) as if it were sequential.
- **REST API** — a web service you talk to over HTTP URLs that returns data,
  usually as JSON. Remotive is one.
- **State machine** — modeling UI as a small set of named states (here:
  `loading` / `success` / `error`) instead of juggling many boolean flags.

---

## 🔧 Conventions used in this project

- One component per file; the file name matches the component name.
- Each component keeps its styles in a sibling `.css` file (e.g.
  `Navbar.jsx` + `Navbar.css`).
- CSS class names follow a loose **BEM** style: `block__element--modifier`
  (e.g. `navbar__link--cta`).
- Always style with `var(--token)` values, never hard-coded colors.
- Commit once per phase with a clear message.
