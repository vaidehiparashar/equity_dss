# AdminPanel – Full Stack Dashboard

A React + CodeIgniter 4 admin dashboard with JWT-style token auth, user/teacher management, and a clean SaaS UI.

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Axios, React Router v6, Lucide React

**Backend:** CodeIgniter 4 (PHP 8.1+), MySQL 8.0

**Auth:** Bearer token (custom `auth_tokens` table, 24hr expiry)

---

## Requirements

- Node.js 18+
- PHP 8.1+ with `mysqli` and `intl` extensions
- MySQL 8.0 **or** Docker + Docker Compose

---

## Running with Docker (recommended)

```bash
# 1. Start MySQL + CI4 backend
docker-compose up -d

# 2. Install frontend deps and start dev server
cd admin-dashboard
npm install
npm run dev
```

Open http://localhost:5173

---

## Running Manually

**Backend:**
```bash
cd ci4-backend
composer install
cp .env.example .env          # set DB credentials
# Import database/migration.sql into MySQL
php -S localhost:8001 -t public
```

**Frontend:**
```bash
cd admin-dashboard
npm install
npm run dev
```

---

## Default API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/register` | Public |
| POST | `/api/login` | Public |
| POST | `/api/logout` | Required |
| GET | `/api/users` | Public |
| DELETE | `/api/users/:id` | Required |
| GET | `/api/teachers` | Required |
| DELETE | `/api/teachers/:id` | Required |

---

## Workflow

1. Register as a teacher (creates both `auth_user` + `teachers` records)
2. Login → receive Bearer token (stored in `localStorage`)
3. Dashboard auto-loads users/teachers; falls back to mock data if backend is offline
4. All protected API calls attach `Authorization: Bearer <token>` automatically
