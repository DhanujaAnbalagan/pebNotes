# Peblo AI Notes Workspace

An AI-powered full-stack productivity platform built for the Peblo Full Stack Developer Internship Challenge.

Peblo AI Notes Workspace combines modern note-taking workflows with AI-generated insights, autosave architecture, public sharing, analytics dashboards, and a polished SaaS-style user experience.

---

## Live Demo

### Deployed Application

Add your deployed Vercel link here:

```txt
https://peb-notes-c2s1.vercel.app
```

### Demo Video

Add your demo video link here:

```txt
https://your-demo-video-link
```

---

## Project Overview

Peblo AI Notes Workspace is a modern AI-enhanced productivity application designed to help users:

- Create and manage notes efficiently
- Organize notes with categories and tags
- Automatically save content in real time
- Generate AI-powered summaries and action items
- Analyze productivity trends
- Share notes publicly through secure links

The application was built with a strong focus on:

- Production-style architecture
- Full-stack engineering practices
- Scalable database design
- Modern SaaS UX patterns
- Clean state management
- AI integration reliability
- Mobile responsiveness

---

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui + Base UI
- Zustand
- Lucide Icons
- Recharts

### Backend

- Next.js Route Handlers
- Prisma ORM
- PostgreSQL
- Neon Database

### AI Integration

- Google Gemini 2.5 Flash
- Structured JSON AI responses

### Deployment

- Vercel
- Neon PostgreSQL

---

## Core Features

### Authentication System

- Secure user signup/login
- JWT-based authentication
- Protected dashboard routes
- Session persistence
- Secure backend validation

---

### AI-Powered Notes

Generate intelligent insights directly from notes using Gemini AI.

#### AI Features

- AI-generated summaries
- Action item extraction
- Suggested note titles
- AI insights history
- Retry-safe generation flow
- Structured JSON parsing
- Graceful AI error handling

#### AI Workflow

1. User writes a note
2. User clicks "Generate AI Insights"
3. Gemini processes the note content
4. AI-generated insights are displayed
5. Insights persist inside PostgreSQL

---

### Notes Management

#### CRUD Functionality

- Create notes
- Edit notes
- Delete notes
- Archive notes
- Restore archived notes

#### Note Organization

- Categories
- Tags
- Search
- Sorting
- Filtering

---

### Autosave System

Implemented a production-style autosave architecture.

#### Features

- Debounced autosave
- Optimistic UI updates
- Save state indicators
- Smooth typing experience
- Race-condition prevention
- Reliable persistence

---

### Search & Filtering

Users can efficiently organize and discover notes.

#### Search Features

- Real-time keyword search
- Search by title
- Search by note content
- Debounced querying

#### Filtering & Sorting

- Filter by categories
- Filter by tags
- Filter archived notes
- Sort newest/oldest
- Alphabetical sorting

---

### Public Sharing System

Users can securely share notes publicly.

#### Sharing Features

- Generate public links
- Copy share links
- Disable sharing
- Public read-only pages
- AI insights visible publicly
- Secure share ID handling

---

### Analytics Dashboard

The platform includes a productivity analytics dashboard powered by real database data.

#### Dashboard Metrics

- Total notes
- Archived notes
- AI generations
- Weekly activity
- Notes by category
- Most used tags

#### Visualizations

- Activity charts
- Productivity trends
- Category distribution
- AI usage tracking

---

### UI/UX Features

#### Premium SaaS Design

- Modern dark mode interface
- Responsive layouts
- Smooth transitions
- Hover animations
- Loading skeletons
- Empty states
- Mobile responsiveness

#### Responsive Design

Optimized for:

- Desktop
- Tablet
- Mobile devices

---

## Project Architecture

### Frontend Architecture

```
app/
components/
store/
hooks/
lib/
services/
```

### Backend Architecture

```
app/api/
services/
lib/
prisma/
```

### State Management

Zustand is used for:

- Notes state
- Autosave state
- AI generation state
- Dashboard state
- Loading/error handling

---

## Database Design

### Models

#### User

- Authentication
- User ownership

#### Note

- Content storage
- Categories
- Archive support
- Public sharing

#### Tag

- Many-to-many note organization

#### AIInsight

- Summary persistence
- Action item history
- Suggested titles

---

## Security Features

- Secure JWT authentication
- Protected API routes
- User ownership validation
- Secure public sharing
- Environment variable protection
- Backend validation

---

## AI Reliability Improvements

Special focus was placed on stabilizing AI integration.

### Improvements

- Structured JSON parsing
- Markdown cleanup before parsing
- Retry-safe behavior
- Suspended API key handling
- Graceful fallback states
- User-friendly AI errors

---

## Performance Optimizations

### Optimizations Implemented

- Debounced autosave
- Optimistic UI updates
- Efficient Prisma queries
- Reduced unnecessary rerenders
- Lightweight AI workflows
- Search debouncing
- Responsive dashboard rendering

---

## Folder Structure

```
app/
 ├── (auth)/
 ├── (dashboard)/
 ├── api/
 └── share/

components/
 ├── notes/
 ├── dashboard/
 ├── layout/
 └── ui/

services/
 ├── note.service.ts
 ├── ai.service.ts
 └── user.service.ts

store/
 ├── use-note-store.ts
 ├── use-auth-store.ts
 └── use-notification-store.ts

prisma/
 └── schema.prisma
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your_neon_database_url"

JWT_SECRET="your_jwt_secret"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

GEMINI_API_KEY="your_gemini_api_key"
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/DhanujaAnbalagan/pebNotes.git
cd pebNotes
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file and add the required variables shown above.

### 4. Prisma Setup

```bash
npx prisma generate
```

### 5. Run Migrations

```bash
npx prisma migrate dev
```

### 6. Start Development Server

```bash
npm run dev
```

---

## Production Build

```bash
npm run build
```

The application passes:

- TypeScript checks
- Prisma validation
- Production build verification

---

## Deployment

### Frontend Hosting

- Vercel

### Database

- Neon PostgreSQL

### Deployment Notes

Ensure all environment variables are configured in Vercel.

Recommended build command:

```bash
npx prisma generate && next build
```

---

## Challenges Faced

### 1. Prisma + Neon Stabilization

**Challenges:**

- Database connection handling
- Prisma migration setup
- Environment variable management

**Solution:**

- Simplified Prisma configuration
- Stable Neon PostgreSQL setup
- Production-safe Prisma client architecture

---

### 2. Autosave Reliability

**Challenges:**

- Preventing request storms
- Avoiding race conditions
- Maintaining smooth typing UX

**Solution:**

- Debounced autosave
- Optimistic updates
- Controlled API synchronization

---

### 3. Gemini JSON Reliability

**Challenges:**

- Inconsistent AI output formatting
- JSON parsing failures
- API error handling

**Solution:**

- Structured prompts
- Markdown cleanup
- Graceful fallback handling

---

## What Makes This Project Stand Out

### Full Production Workflow

This is not just a CRUD app.

The platform includes:

- Full authentication
- AI integration
- Real-time autosave
- Public sharing
- Analytics
- Responsive dashboards
- Production-style architecture

### Focus On Stability

Significant effort was placed on:

- Reliability
- Clean architecture
- Polished UX
- Real-world SaaS patterns

rather than unnecessary complexity.

---

## Future Improvements

Potential future enhancements:

- Team collaboration
- Real-time syncing
- Rich text editing
- AI chat assistant
- Workspace support
- Notification system
- Advanced analytics

---

## Author

### Dhanuja A

Computer Science Engineering Student

Interested in:

- Full Stack Development
- Artificial Intelligence
- Cloud Computing
- Scalable SaaS Systems

---

## Final Notes

Peblo AI Notes Workspace was designed as a modern AI-enhanced productivity platform with a strong emphasis on:

- Clean architecture
- Production-readiness
- Reliable AI integration
- Scalable backend systems
- Polished user experience

The project demonstrates end-to-end full-stack engineering skills across frontend development, backend architecture, database design, AI integration, state management, deployment readiness, and SaaS product thinking.
