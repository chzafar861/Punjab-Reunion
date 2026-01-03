# Heritage Roots Tracing App (47DaPunjab)

## Overview

A heritage tracing web application designed to help families reconnect with their roots in Punjab/Pakistan. The platform serves as a digital archive for individuals and families who migrated during the 1947 partition, offering profile directories, heritage tours, and inquiry systems. The design follows a warm, nostalgic aesthetic inspired by Ancestry.com's genealogy patterns and museum archive presentations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom heritage-themed design tokens
- **UI Components**: shadcn/ui (Radix primitives with New York style)
- **Animations**: Framer Motion for page transitions and scroll reveals
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Typography**: Playfair Display (serif headings) + Lato (sans body text)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Structure**: RESTful endpoints defined in shared/routes.ts with Zod schemas
- **Build Tool**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: shared/schema.ts (profiles, inquiries, tour_inquiries tables)
- **Migrations**: Managed via drizzle-kit push command

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod insert schemas
- `routes.ts`: API contract definitions with paths, methods, and response schemas

### Key Design Decisions

**Monorepo Structure**: Client and server code coexist with shared types/schemas, reducing duplication and ensuring type safety across the stack.

**API Contract Pattern**: Routes are defined declaratively in shared/routes.ts with Zod schemas, enabling type-safe API calls from the frontend and automatic validation on the backend.

**Heritage-Focused Theming**: Custom CSS variables in index.css define a warm, saffron/cream color palette. Design guidelines specify typography scales and component patterns for a nostalgic museum-archive aesthetic.

## External Dependencies

### Database
- PostgreSQL (required, connection via DATABASE_URL environment variable)
- connect-pg-simple for session storage

### Key NPM Packages
- drizzle-orm + drizzle-kit: Database ORM and migrations
- @tanstack/react-query: Server state management
- framer-motion: Animations
- react-hook-form + zod: Form handling and validation
- Radix UI primitives: Accessible component foundations
- embla-carousel-react: Carousel functionality

### Fonts (External)
- Google Fonts: Playfair Display, Lato, DM Sans, Fira Code, Geist Mono

### Development Tools
- Vite with React plugin
- @replit/vite-plugin-runtime-error-modal for error handling
- tsx for TypeScript execution