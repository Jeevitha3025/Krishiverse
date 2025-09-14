# KrishiGrow - Gamified Sustainable Farming Platform

## Overview

KrishiGrow is a gamified digital platform designed to educate and motivate farmers to adopt sustainable agricultural practices. The application combines modern web technologies with agricultural education through personalized quests, virtual farm management, and community engagement features. Built as a full-stack web application, it targets farmers in rural India with multilingual support and mobile-first design principles.

The platform transforms traditional farming education into an engaging experience by creating virtual farm environments that mirror real-world conditions, offering region-specific sustainable farming quests, and providing community-based leaderboards for motivation and social recognition.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, emphasizing a mobile-first approach suitable for rural smartphone users. The architecture leverages Vite for development and build tooling, providing fast hot-reload capabilities and optimized production builds.

The UI framework is based on shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface elements. Tailwind CSS handles styling with a custom color palette reflecting agricultural themes (greens, earth tones). The design system supports multiple languages (English, Hindi, Telugu, Tamil) with text-to-speech capabilities for users with limited literacy.

Component architecture follows a modular pattern with reusable UI components, page-level components for different application sections, and custom hooks for shared logic. The navigation system adapts between mobile bottom navigation and desktop sidebar layouts.

### Backend Architecture
The server architecture uses Express.js with TypeScript for the REST API, providing endpoints for user management, farm data, quests, progress tracking, and community features. The API design follows RESTful conventions with proper error handling and request validation.

The server implements a storage abstraction layer that defines interfaces for all data operations, making the system database-agnostic and testable. Route handlers use Zod schemas for request validation, ensuring type safety throughout the application.

### State Management
Client-side state management combines React Context for global user state (authentication, language preferences) with TanStack Query for server state management, caching, and data synchronization. This approach provides optimal performance for data-heavy agricultural applications while maintaining offline capabilities.

### Data Architecture
The database schema uses Drizzle ORM with PostgreSQL, designed to handle complex agricultural data relationships. Key entities include Users, Farms (with detailed location and crop information), Quests (sustainable farming tasks), UserQuests (progress tracking), and various supporting tables for progress, schemes, and market data.

The schema supports hierarchical location data (State → District → Taluk → Gram Panchayat → Village) for precise regional targeting of content and community features. JSON fields store complex data like crop arrays and quest progress steps.

### Internationalization and Accessibility
The platform implements comprehensive i18n support with translation functions and text-to-speech capabilities. Language switching affects both UI text and speech synthesis, making the platform accessible to users with varying literacy levels.

### Development and Build System
The development environment uses Vite with specialized Replit plugins for cartographer integration and development banners. The build process creates both client-side static assets and server-side bundles optimized for production deployment.

TypeScript configuration ensures type safety across the full stack with shared types between client and server, reducing integration errors and improving developer experience.

## External Dependencies

### Database and Storage
- **Neon Database**: Serverless PostgreSQL database service providing scalable data storage
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library with agricultural and general-purpose icons
- **shadcn/ui**: Pre-built component library based on Radix primitives

### Data Management and API
- **TanStack Query**: Powerful data synchronization library for server state
- **React Hook Form**: Forms library with validation support
- **Zod**: Runtime type validation for API requests and responses

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking across the full stack
- **ESBuild**: Fast JavaScript bundler for production builds

### Replit Integration
- **@replit/vite-plugin-cartographer**: Development environment integration
- **@replit/vite-plugin-dev-banner**: Development mode indicators
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting

### Routing and Navigation
- **Wouter**: Lightweight routing library optimized for single-page applications

### Form Handling and Validation
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries
- **drizzle-zod**: Automatic Zod schema generation from Drizzle schemas

The platform's external dependencies are carefully chosen to support offline-first functionality, mobile performance, and the specific needs of agricultural education in resource-constrained environments.