<img width="227" height="46" alt="Screenshot 2026-06-27 235810" src="https://github.com/user-attachments/assets/cd383096-d71e-49dd-83c0-05837b009292" />

> *Generate complete marketing campaigns in seconds — blogs, social posts, newsletters, SEO metadata, and graphics, all from a single product description.*
<img width="1906" height="983" alt="Screenshot 2026-06-27 233312" src="https://github.com/user-attachments/assets/b1a4893c-d1f1-4bc6-ae10-17e85461364a" />

---

## Project Link:
[NovaContent AI](https://content-ai-forge--carolinespoorth.replit.app/)

---

## Overview
NovaContent AI is a full-stack AI-powered content marketing platform. Describe your product once — NovaContent generates a complete, platform-ready campaign: long-form blog articles, Instagram captions, tweet threads, LinkedIn posts, Facebook copy, email newsletters, SEO metadata, and marketing image prompts. All content is generated locally via Ollama (Gemma model) with no external AI API keys required. A rich mock-content fallback keeps the app fully functional when Ollama is not running.

<img width="1918" height="1021" alt="Screenshot 2026-06-27 232045" src="https://github.com/user-attachments/assets/0085e247-66b9-4ce1-8e20-5870b1bffcf5" />

<img width="1918" height="1032" alt="Screenshot 2026-06-27 232218" src="https://github.com/user-attachments/assets/26783169-5899-4afb-b950-7092d68c1292" />

---

## Features

<img width="861" height="572" alt="Screenshot 2026-06-27 235540" src="https://github.com/user-attachments/assets/20d86d2c-52f2-4275-87b3-4cc73160f37c" />

<img width="1896" height="1026" alt="Screenshot 2026-06-27 233140" src="https://github.com/user-attachments/assets/ac041256-8012-432c-b7e8-a499d2534367" />

<img width="1918" height="1046" alt="Screenshot 2026-06-27 233226" src="https://github.com/user-attachments/assets/6cbdd13f-f896-437c-a6a3-7615269ec486" />

<img width="1893" height="1023" alt="Screenshot 2026-06-27 233340" src="https://github.com/user-attachments/assets/df4355e9-9007-4224-8080-fe2f929f117a" />

---

## Tech Stack
```
Frontend — artifacts/novacontent
Layer	Choice
Framework	React 19 + Vite
Styling	Tailwind CSS 4 (dark mode, custom violet/cyan palette)
Routing	Wouter
Data Fetching	TanStack Query v5 (Orval-generated hooks)
Animations	Framer Motion
Charts	Recharts
Icons	Lucide React
Backend — artifacts/api-server
Layer	Choice
Runtime	Node.js 24
Framework	Express 5
Database	PostgreSQL + Drizzle ORM
Validation	Zod v4 + drizzle-zod
Auth	JWT (jsonwebtoken) + bcryptjs
Logging	Pino
Build	esbuild (CJS bundle)
Shared Libraries
Package	Purpose
lib/db	Drizzle schema + client (single source of truth)
lib/api-spec	OpenAPI 3.1 contract
lib/api-zod	Generated Zod schemas (from OpenAPI)
lib/api-client-react	Generated TanStack Query hooks (from OpenAPI via Orval)
```
---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / User                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                ┌───────────▼───────────┐
                │   Reverse Proxy (:80)  │
                │  path-based routing   │
                └──────┬────────┬───────┘
                       │/       │/api
          ┌────────────▼──┐  ┌──▼────────────────┐
          │  React + Vite  │  │   Express 5 API    │
          │  (novacontent) │  │   (api-server)     │
          └───────────────┘  └──────┬─────────────┘
                                    │
                        ┌───────────▼───────────┐
                        │     PostgreSQL DB      │
                        │  (Drizzle ORM)         │
                        └───────────────────────┘
                                    │
                        ┌───────────▼───────────┐
                        │   Ollama (localhost)   │
                        │   Model: gemma         │
                        └───────────────────────┘
```
> *Contract-first API design: The OpenAPI spec (lib/api-spec) is the single source of truth. Running pnpm --filter @workspace/api-spec run codegen regenerates all Zod schemas and React Query hooks — keeping the frontend and backend in sync automatically.*

--- 

## Database Schema
```
users
  id · email · hashedPassword · createdAt
campaigns
  id · userId · name · productName · description
  category · audience · goal · tone · keywords
  cta · platforms · status (pending | generating | completed)
  createdAt · updatedAt
generated_content
  id · campaignId · contentType · content · metadata
generated_images
  id · campaignId · imageUrl · prompt · imageType
tasks  (generation progress tracking)
  id · campaignId · taskId · status · progress
  currentStep · completedSteps · error
```
## API Reference
```
Auth
Method	Path	Description
POST	/api/auth/register	Create account
POST	/api/auth/login	Obtain JWT token
GET	/api/auth/me	Current user info
Campaigns
Method	Path	Description
GET	/api/campaigns	List user's campaigns
POST	/api/campaigns	Create campaign record
GET	/api/campaigns/:id	Get campaign + all content
PUT	/api/campaigns/:id	Update campaign
DELETE	/api/campaigns/:id	Delete campaign
POST	/api/campaigns/:id/duplicate	Clone a campaign
Generation
Method	Path	Description
POST	/api/generate/campaign	Start async AI generation, returns taskId
GET	/api/generate/status/:taskId	Poll generation progress (0–100%)
POST	/api/generate/regenerate	Regenerate a single content piece
Analytics & Export
Method	Path	Description
GET	/api/analytics/summary	Dashboard stats
GET	/api/export/:campaignId/txt	Download campaign as .txt
Getting Started
Prerequisites
Node.js 24+ and pnpm 10+
PostgreSQL database (connection string in DATABASE_URL)
```
## Ollama (optional, for live AI generation) — install guide
### 1. Install dependencies
pnpm install

### 2. Set environment variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/novacontent
SESSION_SECRET=your-strong-secret-here
```
### 3. Push the database schema
```
pnpm --filter @workspace/db run push
```
### 4. (Optional) Start Ollama with Gemma
```
ollama pull gemma
ollama run gemma
```
> *Without Ollama, the app generates realistic mock content automatically.*

### 5. Start the dev servers
## API server (port 8080, served at /api)
```
pnpm --filter @workspace/api-server run dev
```
## Frontend (served at /)
```
pnpm --filter @workspace/novacontent run dev
```
## Development
Regenerate API client after spec changes
```
pnpm --filter @workspace/api-spec run codegen
```
## Type-check the entire workspace
```
pnpm run typecheck
```
## Rebuild shared libraries
```
pnpm run typecheck:libs
```
## Push DB schema changes (dev only)
```
pnpm --filter @workspace/db run push
```
---

## Project Structure
```
.
├── artifacts/
│   ├── api-server/          # Express 5 backend
│   │   └── src/
│   │       ├── routes/      # auth · campaigns · generate · analytics · export
│   │       └── lib/         # ollama.ts · auth.ts · db.ts
│   ├── novacontent/         # React + Vite frontend
│   │   └── src/
│   │       ├── pages/       # Landing · Dashboard · Generate · History · Campaign · Settings
│   │       └── components/  # AppLayout · shared UI
│   └── mockup-sandbox/      # Isolated component preview server
├── lib/
│   ├── db/                  # Drizzle schema + migrations
│   ├── api-spec/            # OpenAPI 3.1 spec + Orval config
│   ├── api-zod/             # Generated Zod schemas
│   └── api-client-react/    # Generated TanStack Query hooks
├── scripts/                 # Shared utility scripts
├── pnpm-workspace.yaml      # Workspace + catalog pins
└── tsconfig.base.json       # Shared strict TS config
```
---

## AI Generation Pipeline
 - When a user submits a campaign form, the server:

Creates a campaign record and a task record (status: pending)
Returns the taskId immediately — the frontend begins polling /api/generate/status/:taskId
A background async process works through 9 content steps sequentially:
Blog Article → Instagram Caption → Tweet Thread → LinkedIn Post → Facebook Post → Email Newsletter → SEO Metadata → Marketing Copy → Image Prompts
Each completed step saves a generated_content row and updates task progress (0–100%)
On completion, the campaign status flips to completed
If Ollama is unreachable, step 3 uses template-based mock content that mirrors real marketing copy structure.

---

## Security
Passwords hashed with bcryptjs (10 salt rounds)
All /api routes (except /auth/register and /auth/login) require a valid JWT Bearer token
SESSION_SECRET is read from environment — never hardcoded
pnpm workspace enforces a 24-hour minimum package release age to guard against supply-chain attacks
esbuild pinned via workspace override to patch GHSA-g7r4-m6w7-qqqr

## License
MIT
