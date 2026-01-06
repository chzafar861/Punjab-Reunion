# Heritage Roots Tracing App (47DaPunjab)

## Overview

A heritage tracing web application designed to help families reconnect with their roots in Punjab/Pakistan. The platform serves as a digital archive for individuals and families who migrated during the 1947 partition, offering profile directories, heritage tours, and inquiry systems. The design follows a warm, nostalgic aesthetic inspired by Ancestry.com's genealogy patterns and museum archive presentations.

## User Preferences

Preferred communication style: Simple, everyday language.
Deployment target: Vercel with Supabase database

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
- **Authentication**: Supabase Auth (@supabase/supabase-js)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Structure**: RESTful endpoints defined in shared/routes.ts with Zod schemas
- **Authentication**: Supabase JWT verification middleware
- **Build Tool**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: Supabase PostgreSQL (or any PostgreSQL via DATABASE_URL)
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: shared/schema.ts (profiles, inquiries, tour_inquiries, profile_comments tables)
- **Migrations**: Managed via drizzle-kit push command

### Authentication Flow
- Frontend uses @supabase/supabase-js for signup/login/logout
- Backend validates Supabase JWT tokens via middleware
- Protected routes require Authorization header with Bearer token
- User ID from Supabase is used for profile/comment ownership

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod insert schemas
- `routes.ts`: API contract definitions with paths, methods, and response schemas

### Key Design Decisions

**Monorepo Structure**: Client and server code coexist with shared types/schemas, reducing duplication and ensuring type safety across the stack.

**API Contract Pattern**: Routes are defined declaratively in shared/routes.ts with Zod schemas, enabling type-safe API calls from the frontend and automatic validation on the backend.

**Supabase Integration**: Uses Supabase for authentication (email/password with email verification) and database hosting. All secrets stored in environment variables.

**Heritage-Focused Theming**: Custom CSS variables in index.css define a warm, saffron/cream color palette. Design guidelines specify typography scales and component patterns for a nostalgic museum-archive aesthetic.

## Environment Variables

### Required for Supabase
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public anon key for client-side
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side
- `VITE_SUPABASE_URL`: Same as SUPABASE_URL (for frontend)
- `VITE_SUPABASE_ANON_KEY`: Same as SUPABASE_ANON_KEY (for frontend)
- `DATABASE_URL`: PostgreSQL connection string (Supabase or other)

### Optional
- `RESEND_API_KEY`: For sending verification emails via Resend
- `SESSION_SECRET`: For legacy session handling

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel project settings
3. Build command: `npm run build`
4. Output directory: `dist/public`
5. Deploy!

### Configuration Files
- `vercel.json`: Vercel deployment configuration
- `.env.example`: Template for required environment variables

## External Dependencies

### Database
- Supabase PostgreSQL (or any PostgreSQL)
- Drizzle ORM for database operations

### Key NPM Packages
- @supabase/supabase-js: Supabase client for authentication
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
