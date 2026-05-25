# EliteHosting v14.0 — Ultra Advanced Cloud Deployment Platform

EliteHosting is a premium, high-performance cloud deployment platform inspired by Vercel, Railway, and Render, specifically optimized for Indian developers.

## 🚀 Key Features

- **Multi-Method Deployment**: Import from GitHub, upload ZIP files, paste raw source code, or use `elitehosting.json`.
- **Intelligent Engine**: Auto-detects frameworks (Next.js, Python, Node, Static) and generates optimized Dockerfiles.
- **Mumbai Edge Datacenter**: Ultra-low latency (<30ms) for users in India.
- **Premium Dashboard**: Glassmorphic UI with real-time deployment logs, resource monitoring (CPU/RAM/Bandwidth), and a built-in Cloud Editor.
- **Credit-Based Economy**: Transparent pricing starting at ₹99, with 2 free credits for every new user.
- **Advanced Admin Panel**: System-wide monitoring and granular user/project management.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion.
- **Backend**: Supabase (Database, Auth, Realtime), BullMQ + Redis (Queues), Node.js workers.
- **Infrastructure**: Docker-based build system, Monaco Editor, xterm.js logs.
- **Security**: Rate limiting (Upstash), RLS policies, input sanitization.

## 🏁 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- Redis (for queues and rate limiting)
- Supabase Project

### Environment Setup

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis (Queues)
REDIS_URL=redis://localhost:6379

# Upstash (Security/Rate Limiting)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

## 🏗️ Architecture

- `/src/app`: Routes and page components.
- `/src/components`: Reusable UI components (landing, dashboard, admin).
- `/src/lib`: Core utilities, clients, and Zod schemas.
- `/src/services`: Deployment engine, Docker templates, and BullMQ workers.
- `/supabase/migrations`: PostgreSQL schema and RLS policies.
- `/legacy`: Original static site files for reference.

## 🛡️ Security

The platform implements sliding-window rate limiting on all API routes, strict Content Security Policy (CSP), and Row Level Security (RLS) on all database tables to ensure user data isolation.

---
Made with ❤️ by EliteHosting India.
