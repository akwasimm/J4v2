# JobFor - Project Analysis Report

## Executive Summary

**JobFor** is a modern, AI-driven job search and career development platform built with React and Vite. The application features a dual-mode architecture supporting both mock data (for development) and real API integration (for production), with comprehensive user profiles, job discovery, resume analysis, and career coaching features.

---

## Project Overview

| Attribute | Details |
|-----------|---------|
| **Project Name** | JobFor (v2) |
| **Type** | Job Search & Career Development Platform |
| **Frontend Framework** | React 19.2.4 |
| **Build Tool** | Vite 8.0.4 |
| **Styling** | Tailwind CSS 3.4.19 |
| **Routing** | React Router DOM 7.14.0 |
| **Drag & Drop** | @hello-pangea/dnd 18.0.1 |
| **Mock API** | Express + Multer |

---

## Architecture

### Frontend Structure
```
frontend/
├── src/
│   ├── App.jsx              # Main router configuration
│   ├── main.jsx             # Application entry point
│   ├── index.css            # Global styles (Tailwind)
│   ├── api/
│   │   └── client.js        # API client with 30+ endpoints
│   ├── components/          # Reusable UI components
│   ├── services/            # Service layer (auth, jobs, profile, settings)
│   ├── mocks/               # Mock data & handlers for development
│   │   ├── handlers/        # Mock API handlers (auth, jobs, profile, etc.)
│   │   └── data/            # Mock data files
│   └── hooks/               # Custom React hooks
├── mock-api.js              # Express server for file uploads
├── vite.config.js           # Vite configuration with proxy
└── tailwind.config.js       # Tailwind CSS configuration
```

### Application Layouts
1. **PublicLayout** - For landing pages, marketing content
2. **AppLayout** - For authenticated application pages (with sidebar + header)
3. **Standalone Pages** - Auth pages (login, reset password, preferences, upload)

---

## Pages & Routes

### Public Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | JobForLanding | Main landing page |
| `/v2-landing` | V2Landing | Alternative landing page |
| `/opportunities` | BigOpportunities | Job opportunities listing |
| `/insights` | MarketInsights | Market analysis & salary data |
| `/skill-gap` | SkillGapAnalysis | Skill gap identification |
| `/coach` | CareerCoach | AI career coaching |
| `/job` | JobDetail | Individual job details |
| `/join` | JoinCommunity | Community signup |

### Authentication Pages (Standalone)
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | User authentication |
| `/reset` | ResetPassword | Password recovery |
| `/preferences` | PreferencesPage | User preferences setup |
| `/upload` | UploadResumePage | Resume upload |

### Application Pages (Authenticated)
| Route | Component | Description |
|-------|-----------|-------------|
| `/user` | AIRecommendations | Main dashboard (AI job recommendations) |
| `/user-archived` | UserDashboard | Legacy dashboard |
| `/applied` | JobForDashboard | Applied jobs tracking |
| `/saved` | SavedJobs | Bookmarked jobs |
| `/ai` | AIRecommendations | AI recommendations page |
| `/merged` | MergedDashboard | Combined dashboard view |
| `/discover` | JobDiscovery | Job search & discovery |
| `/profile` | EditProfile | User profile management |
| `/skillgap` | SkillGapAnalysis | Skill gap analysis |
| `/settings` | SettingsPage | Account settings |
| `/analyzer` | ResumeAnalyzer | Resume parsing & analysis |

### Development
| Route | Component | Description |
|-------|-----------|-------------|
| `/dev` | DevIndex | Page index for development |
| `*` | NotFound | 404 error page |

---

## API Architecture

### Dual-Mode System
The application supports two modes via environment variables:

```javascript
// .env
VITE_API_MODE=mock        // 'mock' or 'real'
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### API Client Features
- **Base URL**: Configurable via environment
- **Authentication**: Bearer token from localStorage
- **Error Handling**: FastAPI-style error parsing
- **File Uploads**: Separate handlers for multipart/form-data

### API Endpoints (30+ endpoints)

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Current user profile

#### Profile Management
- `GET /profile/me` - Fetch profile
- `PUT /profile/me` - Update profile
- `PUT /profile/complete` - Complete profile setup
- `POST /profile/avatar` - Upload profile image
- `POST /profile/resume` - Upload resume

#### Skills
- `GET /profile/skills` - Get skills
- `POST /profile/skills` - Add skill
- `PUT /profile/skills/:id` - Update skill
- `DELETE /profile/skills/:id` - Delete skill
- `PUT /profile/skills/bulk` - Bulk update

#### Experience
- `GET /profile/experience` - Get work history
- `POST /profile/experience` - Add experience
- `PUT /profile/experience/:id` - Update experience
- `DELETE /profile/experience/:id` - Delete experience
- `PUT /profile/experience/bulk` - Bulk update

#### Education
- `GET /profile/education` - Get education
- `POST /profile/education` - Add education
- `PUT /profile/education/:id` - Update education
- `DELETE /profile/education/:id` - Delete education
- `PUT /profile/education/bulk` - Bulk update

#### Jobs
- `GET /jobs/search` - Search jobs with filters

#### Insights
- `GET /insights/salary` - Salary data
- `GET /insights/skills/demand` - Skill demand trends
- `GET /insights/companies` - Company insights

#### Skill Gap
- `GET /skill-gap/roles` - Role templates
- `GET /skill-gap/roles/:name` - Specific role
- `GET /skill-gap/learning-paths` - Learning resources

#### Settings
- `GET /settings` - Get settings
- `PUT /settings` - Update settings
- `PUT /settings/password` - Change password
- `GET /settings/connected-accounts` - Social connections
- `DELETE /settings/connected-accounts/:platform` - Disconnect
- `POST /settings/export-data` - Data export
- `DELETE /settings/account` - Delete account

---

## Mock System

### Mock Handlers
Located in `src/mocks/handlers/`:
- `auth.js` - Authentication mocks
- `profile.js` - Profile data mocks
- `jobs.js` - Job listings mocks
- `insights.js` - Market insights mocks
- `skillGap.js` - Skill gap analysis mocks
- `settings.js` - Settings mocks

### File Upload Mock Server
- **Port**: 3001
- **Endpoints**:
  - `POST /api/user/profile-image` - Image upload
  - `POST /api/user/resume` - Resume upload
  - `DELETE /api/user/profile-image` - Delete image
  - `DELETE /api/user/resume` - Delete resume
  - `GET /api/user/data` - Get file URLs
  - `GET /api/health` - Health check

---

## Key Features

### 1. User Profile Management
- Multi-step profile completion
- Avatar upload with preview
- Resume upload (PDF, DOCX)
- Skills management with drag-and-drop
- Work experience tracking
- Education history
- Social profile links

### 2. Job Discovery
- AI-powered job recommendations
- Advanced search with filters (location, work model, experience)
- Saved jobs collection
- Applied jobs tracking
- Job detail view with skill matching

### 3. Resume Analysis
- AI-powered resume parsing
- Skill extraction
- Gap analysis against job requirements
- Improvement suggestions

### 4. Career Coaching
- AI chat interface
- Career path suggestions
- Skill development recommendations
- Market insights integration

### 5. Market Insights
- Salary benchmarking by role/location
- Skill demand trends
- Company analytics
- Industry reports

### 6. Skill Gap Analysis
- Role template comparison
- Missing skills identification
- Learning path recommendations
- Progress tracking

---

## Component Library

### Layout Components
- `AppLayout` - Main application shell (sidebar + header)
- `PublicLayout` - Marketing page wrapper
- `AppHeader` - Application header with search & notifications
- `AppSidebar` - Navigation sidebar
- `PublicNavbar` - Landing page navigation
- `Footer` / `PublicFooter` - Page footers

### UI Components
- `NeoButton` - Custom styled button
- `SectionTitle` - Consistent section headings
- `MessageBubble` - Chat message component

---

## Styling

### Tailwind Configuration
- **Content paths**: `index.html`, `src/**/*.{js,ts,jsx,tsx}`
- **Custom scrollbars**: Thin, styled scrollbar for premium feel
- **Google Fonts**: Space Grotesk, Syne
- **Material Icons**: Google Material Icons Outlined

### Design System
- Primary color: `#1A4D2E` (green)
- Accent: `#D8B4FE` (purple)
- Background: `#F9FAFB`
- Typography: Syne for headings, Space Grotesk for body

---

## Development Setup

### Scripts
```bash
npm run dev          # Start frontend only
npm run dev:frontend # Start frontend only
npm run dev:mock     # Start frontend + mock API
npm run mock-api     # Start mock API server only
npm run build        # Production build
npm run lint         # ESLint check
npm run preview      # Preview production build
```

### Environment Variables
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_API_MODE=mock  # or 'real'
```

---

## Project Statistics

| Metric | Count |
|--------|-------|
| **Total Pages** | 25+ |
| **Components** | 14 |
| **Services** | 7 |
| **Mock Handlers** | 6 |
| **API Endpoints** | 30+ |
| **Dependencies** | 7 production, 12 dev |

---

## Technical Highlights

1. **Modern React**: Uses React 19 with StrictMode
2. **Vite Powered**: Fast development with HMR
3. **Tailwind CSS**: Utility-first styling
4. **Mock/Real Toggle**: Seamless development/production switching
5. **Comprehensive Forms**: Multi-step profile with validation
6. **File Uploads**: Dedicated mock server for uploads
7. **Drag & Drop**: Skill reordering with @hello-pangea/dnd
8. **ESLint Configured**: Modern flat config
9. **Proxy Setup**: Vite proxy for API during development

---

## Potential Improvements

1. **TypeScript Migration** - Add type safety
2. **Testing** - Unit and integration tests
3. **PWA Support** - Service worker, offline capabilities
4. **Real-time Updates** - WebSocket for notifications
5. **State Management** - Consider Zustand or Redux for complex state
6. **Error Boundaries** - React error boundary components
7. **Loading States** - Skeleton screens throughout
8. **Animations** - Framer Motion for page transitions

---

## Conclusion

JobFor is a well-structured, feature-rich job platform with modern architecture. The dual-mode API system enables rapid development while maintaining production readiness. The component structure is organized, and the routing is comprehensive. With 25+ pages covering the full job search lifecycle, it's a complete solution for job seekers.

**Status**: Active development, feature-complete for MVP
**Recommendation**: Ready for backend integration and deployment testing
