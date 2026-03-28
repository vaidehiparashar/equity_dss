# AdminPanel – Modern React Dashboard

A production-grade **React + Vite + Tailwind CSS** admin dashboard with full authentication UI, protected routes, and a clean SaaS-style design.

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd admin-dashboard
npm install

# 2. Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── api/
│   │   ├── axiosClient.js    ← Axios instance (auto-auth headers, 401 redirect)
│   │   └── services.js       ← API endpoint functions
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Input.jsx     ← Reusable input with icon, error, show-password
│   │   │   ├── Button.jsx    ← Variant/size/loading button
│   │   │   ├── Table.jsx     ← Data table with skeleton loader
│   │   │   └── Badge.jsx     ← Colored status pill
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   └── Topbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx   ← Token + user stored in localStorage
│   ├── layouts/
│   │   └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── UsersPage.jsx
│   │   └── TeachersPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js            ← Proxies /api → http://localhost:8000
├── tailwind.config.js
└── package.json
```

## 🔌 Backend API

The app expects your backend at `http://localhost:8000`. The Vite dev server proxies all `/api/*` requests automatically.

| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| POST   | /api/auth/login   | Login (returns `{ token, user }`) |
| POST   | /api/auth/register| Register           |
| GET    | /api/users        | List all users     |
| DELETE | /api/users/:id    | Delete a user      |
| GET    | /api/teachers     | List all teachers  |
| DELETE | /api/teachers/:id | Delete a teacher   |

> **Note:** When the backend is not available, the app falls back to built-in demo mock data automatically.

## 🔐 Authentication

- Token stored in `localStorage` under key `token`
- All API requests automatically include `Authorization: Bearer <token>`
- On 401 response, user is redirected to `/login`
- `ProtectedRoute` guards all `/dashboard/*` routes

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#2563eb` (blue-600) |
| Sidebar bg | `#0f172a` (slate-900) |
| Card bg | `#ffffff` with soft shadow |
| Font | Inter (Google Fonts) |

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react-router-dom` | Routing |
| `axios` | HTTP client |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon library |
| `tailwindcss` | Styling |
