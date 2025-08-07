# Sistema de Gerenciamento JukeBOX

## Overview

This is a full-stack web application for business management built with React, Express, and PostgreSQL. The system provides administrative functionality for managing products, clients, and employees with a modern, responsive interface. The application follows a monorepo structure with shared schema definitions and type-safe API interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility and consistency
- **Styling**: TailwindCSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Data Validation**: Zod schemas for runtime type validation and API contract enforcement
- **Development**: Hot module replacement via Vite integration for seamless development experience

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database queries
- **Schema**: Centralized schema definitions in `shared/schema.ts` with automatic TypeScript type generation
- **Tables**: Users, products, clients, employees, and sales with proper foreign key relationships
- **Migrations**: Drizzle Kit for database schema migrations and version control

### Authentication & Security
- **Authentication**: Simple username/password authentication with session storage
- **Session Management**: Browser localStorage for client-side session persistence
- **API Security**: Request validation using Zod schemas for all API endpoints

### Development Experience
- **Monorepo Structure**: Shared types and schemas between frontend and backend
- **Path Aliases**: TypeScript path mapping for clean imports (@/, @shared/, @assets/)
- **Hot Reload**: Vite development server with automatic refresh and error overlay
- **Type Safety**: End-to-end TypeScript coverage from database to UI components

### Data Management Strategy
- **Storage Layer**: Abstracted storage interface supporting both in-memory (development) and PostgreSQL (production)
- **Caching**: TanStack Query provides intelligent caching and background updates
- **CRUD Operations**: Full create, read, update, delete functionality for all entities
- **Data Validation**: Consistent validation using shared Zod schemas across client and server

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting for production deployment
- **Connection**: Environment-based DATABASE_URL configuration for flexible deployment

### UI Framework
- **Radix UI**: Comprehensive primitive components for building accessible interfaces
- **Lucide React**: Modern icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework for rapid styling

### Development Tools
- **Vite**: Fast build tool and development server with React plugin
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Third-party Services
- **Font Awesome**: Icon library for legacy compatibility (referenced in HTML templates)
- **Google Fonts**: Inter font family for modern typography
- **Replit Integration**: Development environment integration with cartographer and error overlay plugins