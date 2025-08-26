# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Principles
- Don't create new files where an existing one will do the job. If you're creating a new file it means you haven't read the scope of the task in a larger context
- Always ask questions about the implementation. Sometimes even I don't know what I want. Flesh out the idea with codebase examples and proof
- Never assume, imply, implicitly read, or over-engineer a task I did not explicitly ask for. If you have additional ideas, present them with facts and proof and recommendations
- Don't be too pessimistic or too optimistic. We want factual codebase analysis only

## Essential Commands

### Frontend Development
```bash
# Start development server (port 3000, HMR enabled)
npm start

# Production build
npm run build

# Run tests
npm test

# Serve production build locally
npx serve -s build -p 3000
```

### Backend Development (MongoDB API)
```bash
# Navigate to backend
cd hhdonations/server

# Start server (ALWAYS on port 5000)
# If port 5000 is in use, kill the process and restart
npm run dev  # or npm start (both use node, no auto-restart)

# MongoDB connection
# Default: mongodb://localhost:27017/hhdonations
# Or set MONGODB_URI in .env
```

### TypeScript Configuration Issues
- Target: ES5 with downlevelIteration needed for Map/Set iterations
- Path alias: `@/*` maps to `./src/*`
- Fix networkHandler.ts warning: Add `"downlevelIteration": true` to tsconfig.json

## Architecture Overview

### Dual Storage Strategy
1. **Primary**: Browser localStorage via `SafeStorage` utility
   - Automatic conflict resolution with timestamps
   - Persists across sessions
   - Handles concurrent writes safely

2. **Secondary**: MongoDB backend (optional)
   - Express API on port 5000 (ALWAYS use this port)
   - RESTful endpoints for all entities
   - Bulk sync endpoint `/api/sync`
   - No authentication/authorization (development mode)

### State Management Pattern
- **React Context API** for global state (no Redux/MobX)
- Five main contexts wrap the app:
  - DriversContext
  - ContainersContext  
  - BinsContext
  - BalesContext
  - PickupRequestsContext
- Each context syncs with localStorage on mount and changes
- Optional API sync through `dataSync.ts` service

### Frontend Structure
```
src/
├── contexts/       # State management with localStorage persistence
├── pages/
│   ├── admin/     # Dashboard pages (bins, drivers, routes, etc.)
│   └── public/    # Find bin, request pickup, contact
├── services/
│   ├── api.ts     # Backend API client (fetch wrapper)
│   └── dataSync.ts # Sync orchestration
├── utils/
│   ├── safeStorage.ts    # localStorage with conflict resolution
│   ├── storageManager.ts # Data persistence layer
│   └── networkHandler.ts # Network resilience (retry queue)
└── components/ui/  # Radix UI / shadcn components
```

### Critical Files
- `config-overrides.js` - Webpack configuration (HMR settings, path aliases)
- `src/App.tsx` - Context providers and routing setup
- `src/utils/safeStorage.ts` - Core storage abstraction
- `hhdonations/server/server.js` - Express backend with Mongoose

### API Endpoints
All endpoints follow RESTful pattern at `http://localhost:5000/api`:
- `GET/POST/PUT/DELETE` for `/drivers`, `/containers`, `/bins`, `/bales`, `/pickup-requests`
- `POST /sync` - Bulk data replacement
- `GET /health` - Server status check

### Network Resilience
The app handles network failures gracefully:
- Retry queue for failed operations
- Automatic reconnection attempts
- Falls back to localStorage when API unavailable
- Network status monitoring component

### Google Maps Integration
- API key required: `REACT_APP_GOOGLE_MAPS_API_KEY`
- Used in FindBin and RequestPickup pages
- Route optimization in PickupRouteGenerator

### Sensoneo API Integration
- Demo API key available: `0c5d7f2757f740489dca16d6c5745a11` (provided by Sensoneo team)
- Set in `.env` as `REACT_APP_SENSONEO_API_KEY`
- Test page at `/admin/sensor-test`
- Provides real-time sensor data for container fill levels
- API endpoints:
  - `/data/measurements` - Get sensor measurements
  - `/data/collections` - Get collection events

## Common Issues and Solutions

### Port Conflicts
- Port 5000: Backend server MUST run on this port
- If port 5000 is in use, kill the process and restart
- Frontend uses port 3000 (standard CRA)

### Build Warnings
- TypeScript iteration warnings: Add `"downlevelIteration": true` to tsconfig
- Deprecation warnings in dev server: Expected with current webpack-dev-server version

### Data Persistence
- Data stored per browser/domain
- Clearing browser data removes all stored information
- Use MongoDB backend for cross-browser persistence

## Testing Approach
- Jest with React Testing Library
- Run individual test: `npm test -- --testNamePattern="test name"`
- Test files alongside components (`.test.tsx`)
- backend node.js server is always run on 5000. if you see something running kill it and restart on this same port
- When adding new functionality or features, be sure to make considerations for our supabase database, we dont have to hard code any database items anymore. We should properly be storying everything in supabase.