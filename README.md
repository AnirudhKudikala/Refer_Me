# Refer Me

A full-stack referral platform connecting job seekers with employees who can refer them to their companies.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS v4, Framer Motion, TanStack Query, Zustand
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Realtime:** Socket.io
- **Auth:** JWT (access + refresh cookie), Email/Password

## Features

- **Two user roles:** Seekers (need referral) and Referrers (can refer)
- **Seeker profile:** Skills, roles, bio, resume upload, profile completion tracking
- **Referrer browse:** Filter candidates by tech stack, role, experience, location
- **Express interest:** Referrers send requests; seekers accept/decline
- **Real-time chat:** Messaging after mutual match via Socket.io
- **Email notifications:** Seekers notified when a referrer expresses interest
- **Light & dark themes:** Toggle in navbar

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL — either via **Docker** or a **local install** (e.g. Homebrew on macOS)

### Setup

```bash
# Clone and install
cd refer_me
npm install

# Configure environment
cp .env.example server/.env
# Edit server/.env with your values (Google OAuth optional)
```

**Option A — Docker (recommended if Docker Desktop is running)**

```bash
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

**Option B — Local PostgreSQL (Homebrew, no Docker)**

If port 5432 is already used by a local Postgres instance, skip Docker and run:

```bash
npm run db:setup   # creates referme user/db, migrates, and seeds
npm run dev
```

### Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `P1010: User was denied access` | Postgres is running but the `referme` user/database doesn't exist | Run `npm run db:setup` (local Postgres) or `docker compose up -d` then `npm run db:migrate` |
| `docker.sock: connect: no such file` | Docker Desktop is not running | Use **Option B** above, or start Docker Desktop and retry |

### Demo Accounts

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Seeker | seeker1@example.com | password123 |
| Referrer | referrer1@example.com | password123 |

## Project Structure

```
refer_me/
├── client/          # React frontend
├── server/          # Express API
├── docker-compose.yml
└── package.json     # Monorepo workspaces
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register with email/password |
| POST | /auth/login | Login |
| GET | /auth/google | Google OAuth |
| GET | /me | Current user profile |
| PATCH | /me/seeker-profile | Update seeker profile |
| PATCH | /me/referrer-profile | Update referrer profile |
| POST | /me/resume | Upload resume |
| GET | /seekers | Browse seekers (referrer only) |
| POST | /interests | Express interest |
| PATCH | /interests/:id | Accept/decline interest |
| GET | /conversations | List conversations |
| POST | /conversations/:id/messages | Send message |

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## License

MIT
