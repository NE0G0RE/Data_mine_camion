# Truck Management Dashboard

## Overview

This is a full-stack web application for managing truck installations and configurations. The system tracks various aspects of truck equipment including state validation, Truck4U system installations, tablet configurations, and material inventory. Built with React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React 18 with TypeScript, built using Vite as the build tool and development server.

**UI Framework**: Uses shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling. The design system follows a neutral color scheme with CSS variables for theming support.

**State Management**: 
- TanStack Query (React Query) for server state management and API caching
- React Hook Form with Zod validation for form handling
- Local state management using React hooks

**Routing**: Uses Wouter for lightweight client-side routing.

**Component Structure**: 
- Modular component architecture with reusable UI components
- Custom hooks for mobile detection and toast notifications
- Form components with comprehensive validation

### Backend Architecture

**Technology Stack**: Node.js with Express.js framework, written in TypeScript.

**API Design**: RESTful API structure with routes for CRUD operations on truck data:
- GET /api/trucks - List all trucks
- GET /api/trucks/:id - Get single truck
- POST /api/trucks - Create new truck
- PATCH /api/trucks/:id - Update truck
- DELETE /api/trucks/:id - Delete truck

**Data Layer**: Storage abstraction pattern with interface-based design allowing for multiple storage implementations (currently includes in-memory storage for development).

**Error Handling**: Centralized error handling middleware with proper HTTP status codes and JSON error responses.

**Development Features**: Hot module replacement with Vite integration, request logging middleware, and development-specific tooling.

### Database Schema

**Primary Entity**: Trucks table with comprehensive tracking fields organized into logical sections:

- **Basic Info**: ID (UUID), numero (unique identifier), modele
- **State Section**: DA numbers, dates, validation statuses
- **Truck4U Section**: Installation details, configuration status, functional state
- **Tablet Section**: Tablet presence, type, IMEI, compatibility, app installations
- **Material Section**: Camera equipment, PDA numbers, test completion status
- **Action Fields**: General action items and observations

**Data Validation**: Uses Drizzle-Zod integration for runtime validation and type safety between database schema and application logic.

### Build and Deployment

**Development**: Uses tsx for TypeScript execution, Vite for frontend development with HMR
**Production Build**: 
- Frontend: Vite build with static asset optimization
- Backend: esbuild for Node.js bundle creation with ESM format
**Database Management**: Drizzle Kit for schema migrations and database operations

### External Dependencies

**Database**: PostgreSQL with Neon serverless database connection
**ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
**UI Components**: 
- Radix UI primitives for accessible component foundations
- Embla Carousel for carousel functionality
- Lucide React for consistent iconography
**Form Handling**: React Hook Form with Hookform Resolvers for Zod integration
**Styling**: Tailwind CSS with PostCSS for utility-first styling
**Development Tools**: 
- Replit-specific plugins for development environment integration
- TypeScript for type safety across the full stack
**Utilities**: 
- date-fns for date manipulation
- clsx and class-variance-authority for conditional styling
- nanoid for ID generation