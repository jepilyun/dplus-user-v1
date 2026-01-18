# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.1 application using TypeScript and React 19, serving as a user-facing web platform. The project is built with App Router, includes internationalization support (primarily Korean), and integrates with Supabase for backend services.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code with Prettier
npm run prettier
```

## Architecture & Structure

### Core Directories

- `src/app/` - Next.js App Router pages and layouts
  - `(home)/` - Home page route group
  - `(main)/` - Main application route group  
  - `api/` - API route handlers
  - `layout.tsx` - Root layout with font loading, GTM, and analytics

- `src/components/` - Organized by functionality with `comp-` prefix
  - Component directories follow pattern: `comp-{feature-name}/`
  - Examples: `comp-button/`, `comp-event/`, `comp-folder/`, `comp-image/`

- `src/utils/` - Utility functions for dates, colors, image processing, social sharing
- `src/lib/` - External service integrations (Supabase client)
- `src/contexts/` - React context providers (scroll restoration)
- `src/consts/` - Application constants and configurations
- `src/i18n-data/` - Internationalization data files
- `src/types/` - TypeScript type definitions
- `src/icons/` - Custom icon components

### Key Technologies

- **Frontend**: Next.js 16 with React 19, TypeScript
- **Styling**: Tailwind CSS 4.1.11, Material-UI 7.3.6, Radix UI components
- **Backend**: Supabase (database, storage, auth)
- **Fonts**: Google Fonts (Noto Sans, Noto Sans KR, Monoton, Poppins, Rubik, Gamja Flower)
- **Analytics**: Vercel Analytics, Google Tag Manager
- **Image Optimization**: Next.js Image with remote patterns for Supabase, YouTube, Concrete Playground

### Configuration Files

- `tsconfig.json` - TypeScript configuration with `@/*` path mapping to `src/*`
- `next.config.js` - Image remote patterns, scroll restoration disabled
- `eslint.config.mjs` - ESLint with Next.js rules
- `.prettierrc.json` - Prettier with import sorting and specific import order

### Import Organization

Prettier is configured to sort imports in this order:
1. React imports
2. Next.js imports  
3. Third-party modules
4. Utils (`@/utils/...`)
5. Relative imports (`./` or `../`)

### Supabase Integration

- Client configuration in `src/lib/supabase-client.ts`
- Environment variables required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Image storage patterns configured for Supabase CDN

### Scroll Restoration

Custom scroll restoration system implemented:
- Next.js automatic scroll restoration disabled
- Manual scroll restoration via `ScrollRestorationProvider`
- Browser scroll restoration set to manual mode

### Internationalization

- Primary language: Korean (`lang="ko"`)
- Metadata constants in `src/consts/const-metadata.ts`
- i18n utility functions in `src/utils/get-dplus-i18n.ts`

## Development Notes

- Component organization follows domain-driven design with `comp-` prefixes
- Utility functions are extensively organized by feature (dates, colors, images, etc.)
- All images should use Next.js Image component with appropriate remote patterns
- Environment variables should be properly configured for Supabase integration
- GTM tracking is implemented for analytics