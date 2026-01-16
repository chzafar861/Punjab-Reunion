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
- **Database**: Supabase PostgreSQL via REST API (supabase-js client)
- **Storage Layer**: `server/storage.supabase.ts` implements IStorage interface using Supabase REST API
- **File Storage**: Replit Object Storage for profile photo uploads (`server/replit_integrations/object_storage/`)
- **Schema Location**: shared/schema.ts (profiles, inquiries, tour_inquiries, profile_comments tables)
- **Note**: Direct PostgreSQL connections are NOT used - all database operations go through Supabase REST API for reliability

### Photo URL Handling
Profile photos support multiple URL formats:
- **Supabase Storage**: Primary storage via `profile-photos` bucket in Supabase Storage
- **External URLs**: Direct URLs to external images (e.g., Unsplash)
- **Replit Object Storage**: Legacy URLs containing `/objects/` path

**Profile Photo Management (MyProfiles Edit Form)**:
- Uses session token system (`editSessionTokenRef`) to prevent race conditions
- Token captured in closure before upload, compared after upload completes
- Stale uploads (from cancelled/saved sessions) are automatically deleted
- `uploadedPhotos[]` array tracks all uploads during edit session for orphan cleanup
- All photo controls disabled during save to prevent concurrent modifications
- On save failure: form state reverts to original photo, all uploads cleaned up

**Photo Upload Flow**:
1. `handleFileChange` captures session token before starting upload
2. After upload: compares captured token vs current token
3. If mismatch: upload is stale → delete from storage and exit
4. If match: update form state and add to uploadedPhotos array
5. On save: delete old photo (if changed) and orphaned uploads (not the saved one)

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

### Multi-Language Support
The application supports 4 languages with comprehensive translations:
- **English** (en) - Default language
- **Punjabi/Gurmukhi** (pa) - ਪੰਜਾਬੀ
- **Urdu** (ur) - اردو (RTL support)
- **Hindi** (hi) - हिन्दी

**Translation System Architecture**:
- `client/src/lib/translations.ts`: Central translation dictionary with 400+ keys per language
- `client/src/contexts/LanguageContext.tsx`: React Context for language state management
- `client/src/components/LanguageSelector.tsx`: Globe icon dropdown for language switching
- Language preference persisted in localStorage
- RTL (right-to-left) support automatically enabled for Urdu

**Fully Translated Pages** (all 4 languages):
- Home, Directory, Login, Signup, SubmitProfile, Contact, MyProfiles, VerifyEmail, NotFound
- ModernCities (30+ keys: cities, articles, travel tips)
- LahoreHistory (33 keys: landmarks, historical articles, Mughal heritage)
- PunjabVillages (37 keys: villages, pre-partition life, ancestral homes)

**Remaining Pages**: HeritageTours (main landing), About, ProfileDetail (content-heavy pages)

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
- Supabase PostgreSQL via REST API
- `@supabase/supabase-js` for all database operations (no direct PostgreSQL connection)

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
