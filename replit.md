# Heritage Roots Tracing App (47DaPunjab)

## Overview

A heritage tracing web application designed to help families reconnect with their roots in Punjab/Pakistan. The platform serves as a digital archive for individuals and families who migrated during the 1947 partition, offering profile directories, heritage tours, and inquiry systems. The design follows a warm, nostalgic aesthetic inspired by Ancestry.com's genealogy patterns and museum archive presentations.

## User Preferences

Preferred communication style: Simple, everyday language.
Deployment target: Replit (self-contained with built-in PostgreSQL and Replit Auth)

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
- **Authentication**: Replit Auth (OIDC-based)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Structure**: RESTful endpoints defined in shared/routes.ts with Zod schemas
- **Authentication**: Replit Auth with session-based authentication (express-session)
- **Build Tool**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: Replit's built-in PostgreSQL via Drizzle ORM
- **Storage Layer**: `server/storage.database.ts` implements IStorage interface using Drizzle ORM
- **File Storage**: Replit Object Storage for profile photo and product image uploads (`server/replit_integrations/object_storage/`)
- **Schema Location**: shared/schema.ts (profiles, inquiries, tour_inquiries, profile_comments tables)

### Photo URL Handling
Profile photos support multiple URL formats:
- **Replit Object Storage**: Primary storage via `/objects/` path
- **External URLs**: Direct URLs to external images (e.g., Unsplash)

**Profile Photo Management (MyProfiles Edit Form)**:
- Uses session token system (`editSessionTokenRef`) to prevent race conditions
- Token captured in closure before upload, compared after upload completes
- Stale uploads (from cancelled/saved sessions) are automatically deleted
- `uploadedPhotos[]` array tracks all uploads during edit session for orphan cleanup
- All photo controls disabled during save to prevent concurrent modifications
- On save failure: form state reverts to original photo, all uploads cleaned up

**Photo Upload Flow**:
1. `handleFileChange` captures session token before starting upload
2. Request presigned URL from `/api/uploads/request-url`
3. Upload file to presigned URL
4. Receive objectPath (e.g., `/objects/uploads/uuid`)
5. Use objectPath as the image URL (served by `/objects/*` route)

### Authentication Flow
- Frontend redirects to `/api/login` for login (Replit Auth OIDC flow)
- Backend validates session via express-session middleware
- Protected routes check `req.isAuthenticated()` or `req.user`
- User ID from Replit Auth is used for profile/comment ownership

### Role-Based Access Control (RBAC)
The application implements a role-based permission system:

**Database Table**: `user_roles`
- `user_id`: References Replit Auth user ID
- `role`: "admin" | "contributor" | "member"
- `can_submit_profiles`: Boolean for profile submission permission
- `can_manage_products`: Boolean for product management permission

**Permission Logic**:
- Admin role has full access to all features
- `canSubmitProfiles`: Required to submit new profiles (admin or explicit permission)
- `canManageProducts`: Required to manage shop products (admin or explicit permission)

**Protected Features**:
- Profile Submission: Requires admin role OR canSubmitProfiles permission
- Admin Dashboard: Requires admin role (Products, Orders, Users management)

**API Endpoints**:
- `GET /api/auth/user`: Returns current user from session
- `GET /api/auth/me`: Returns user info with role and permissions
- `GET /api/login`: Redirects to Replit Auth login
- `GET /api/logout`: Logs out and redirects to home
- Admin routes use `requireAdmin` middleware for server-side enforcement

### E-Commerce Shop Feature
**Database Tables**:
- `products`: Shop items (title, description, price, images, category, status)
- `orders`: Customer orders with status tracking
- `order_items`: Individual items within orders

**Pages**:
- `/shop`: Public product browsing page
- `/shop/:id`: Product detail page with order button
- `/admin/products`: Admin product management (add/edit/delete)
- `/admin/orders`: Admin order management (view/update status)
- `/admin/users`: Admin user role management (grant/revoke permissions)

**Order Flow**:
1. User browses products on Shop page
2. User clicks "Order Now" on product detail
3. OrderDialog collects shipping details
4. Order saved to database with "pending" status
5. Admin manages orders from Admin Orders page

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod insert schemas
- `routes.ts`: API contract definitions with paths, methods, and response schemas

### Key Design Decisions

**Monorepo Structure**: Client and server code coexist with shared types/schemas, reducing duplication and ensuring type safety across the stack.

**API Contract Pattern**: Routes are defined declaratively in shared/routes.ts with Zod schemas, enabling type-safe API calls from the frontend and automatic validation on the backend.

**Replit Integration**: Uses Replit Auth for authentication and Replit's built-in PostgreSQL for data storage. All secrets stored in environment variables.

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

### Required
- `DATABASE_URL`: PostgreSQL connection string (provided by Replit)
- `SESSION_SECRET`: Secret for session encryption

### Optional
- `RESEND_API_KEY`: For sending emails via Resend

### Legacy (no longer required)
- Supabase variables are no longer needed - the app now uses Replit's built-in PostgreSQL and Replit Auth

## Deployment

The application is designed to run on Replit with built-in hosting. All infrastructure (database, auth, file storage) is provided by Replit.

To deploy:
1. Ensure all environment variables are set
2. Use Replit's built-in deployment feature

## External Dependencies

### Database
- Replit's built-in PostgreSQL
- Drizzle ORM for database operations

### Key NPM Packages
- drizzle-orm + drizzle-kit: Database ORM and migrations
- @tanstack/react-query: Server state management
- framer-motion: Animations
- react-hook-form + zod: Form handling and validation
- Radix UI primitives: Accessible component foundations
- embla-carousel-react: Carousel functionality
- express-session: Session management for auth

### Fonts (External)
- Google Fonts: Playfair Display, Lato, DM Sans, Fira Code, Geist Mono

### Development Tools
- Vite with React plugin
- @replit/vite-plugin-runtime-error-modal for error handling
- tsx for TypeScript execution

## Recent Changes

### January 2026 - Migration from Supabase to Replit Infrastructure
- Replaced Supabase Auth with Replit Auth (OIDC-based)
- Replaced Supabase PostgreSQL REST API with direct PostgreSQL via Drizzle ORM
- Replaced Supabase Storage with Replit Object Storage
- Simplified authentication flow using express-session
- All client hooks now use REST API endpoints instead of direct Supabase calls
- Admin user ID: `f2074a29-d162-4b8c-89e8-1ebb6974addd`
