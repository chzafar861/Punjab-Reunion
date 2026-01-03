# 47DaPunjab

## Overview

47DaPunjab is a heritage archive web application designed to help families separated during the 1947 partition of Punjab reconnect with their roots. The platform allows users to browse, search, and submit profiles of individuals and families who migrated, creating a digital bridge across borders and generations.

The application features a profile directory with search and filtering capabilities, profile submission forms, inquiry systems for connecting with profile guardians, and a contact system for general questions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom heritage-themed color palette (saffron/orange primary, earthy browns)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and scroll reveals
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Fonts**: Playfair Display (serif for headings) and Lato (sans-serif for body)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful JSON API with typed contracts
- **Build Tool**: Vite for frontend, esbuild for server bundling

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Migrations**: Drizzle Kit (`db:push` command)

### API Contract Pattern
The project uses a shared API contract pattern in `shared/routes.ts`:
- All API endpoints, methods, paths, and Zod schemas are defined in one place
- Both frontend hooks and backend routes reference this contract
- Provides type safety across the full stack

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components (shadcn + custom)
│   │   ├── hooks/        # React Query hooks for API calls
│   │   ├── pages/        # Route components
│   │   └── lib/          # Utilities (queryClient, cn helper)
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Drizzle database connection
├── shared/           # Shared between frontend/backend
│   ├── schema.ts     # Drizzle table definitions
│   └── routes.ts     # API contract definitions
└── migrations/       # Database migrations
```

### Key Design Decisions

1. **Shared Schema Approach**: Database schema and API contracts live in `shared/` directory, ensuring type consistency between frontend and backend.

2. **Storage Abstraction**: `server/storage.ts` implements an `IStorage` interface, making it easy to swap database implementations.

3. **Path Aliases**: TypeScript path aliases (`@/` for client, `@shared/` for shared) simplify imports.

4. **Development/Production Split**: Vite dev server with HMR in development, static file serving in production.

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **pg**: Node.js PostgreSQL client
- **connect-pg-simple**: Session storage (available but may not be in active use)

### Key NPM Packages
- **drizzle-orm** / **drizzle-kit**: Database ORM and migration tooling
- **zod**: Runtime schema validation
- **@tanstack/react-query**: Async state management
- **framer-motion**: Animation library
- **react-hook-form**: Form state management
- **Radix UI**: Accessible component primitives (via shadcn/ui)

### External Services
- **Google Fonts**: Playfair Display and Lato fonts loaded via CDN
- **Unsplash**: Placeholder images for profiles and hero sections (direct image URLs)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: development or production