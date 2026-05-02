# JobFor Deployment Guide

Deploy JobFor to **Vercel** (Frontend) and **Render** (Backend + Database).

---

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub/GitLab repository
- [ ] Environment variables ready (see below)
- [ ] Backend tested locally with `docker-compose up`
- [ ] Frontend builds successfully with `npm run build`

---

## 🚀 Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Blueprint"**

### Step 2: Connect Repository
1. Connect your GitHub/GitLab account
2. Select your `JobFor` repository
3. Render will detect `backend/render.yaml` automatically

### Step 3: Configure Environment Variables

Update the `render.yaml` file or set these in Render dashboard:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Auto (from Render PostgreSQL) | Render auto-injects this |
| `SECRET_KEY` | Auto-generated | Or set your own (32+ chars) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token expiry |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token expiry |
| `GROQ_API_KEY` | `gsk_...` | Optional (for AI features) |
| `NVIDIA_NIM_API_KEY` | `nvapi-...` | Optional (for AI features) |
| `UPLOAD_DIR` | `uploads` | File upload directory |
| `MAX_FILE_SIZE_MB` | `10` | Max upload size |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Your Vercel URL |
| `APP_NAME` | `JobFor API` | App name |
| `APP_VERSION` | `1.0.0` | Version |
| `DEBUG` | `false` | Production mode |

### Step 4: Add PostgreSQL Database

The `render.yaml` includes a free PostgreSQL instance. If deploying manually:
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `jobfor-db`
3. Plan: Free
4. Copy the **Internal Database URL** to `DATABASE_URL`

### Step 5: Deploy

1. Click **"Create Blueprint"**
2. Wait for build (~3-5 minutes)
3. Note your backend URL: `https://jobfor-backend.onrender.com`

### Step 6: Run Database Migrations

After first deploy, run Alembic migrations:

```bash
# Using Render Shell
render shell

# Inside shell:
cd /opt/render/project/src
alembic upgrade head
```

Or set `startCommand` to run migrations on startup:
```yaml
startCommand: |
  alembic upgrade head
  uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 🌐 Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"New Project"**

### Step 2: Import Repository
1. Connect GitHub/GitLab
2. Select `JobFor` repository
3. Configure project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Configure Environment Variables

Add these in Vercel settings:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_MODE` | `real` | Switch from mock to real API |
| `VITE_API_BASE_URL` | `https://jobfor-backend.onrender.com/api/v1` | Your Render backend URL |

### Step 4: Update `vercel.json`

Edit `frontend/vercel.json` and replace:
- `your-backend.onrender.com` → Your actual Render backend URL
- `your-frontend.vercel.app` → Your actual Vercel URL (after first deploy)

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Note your frontend URL: `https://jobfor.vercel.app`

---

## 🔗 Connect Frontend ↔ Backend

### Update CORS in Backend

After both deployments, update `render.yaml`:
```yaml
- key: ALLOWED_ORIGINS
  value: https://jobfor.vercel.app,https://your-custom-domain.com
```

Or in Render dashboard → Environment → Update `ALLOWED_ORIGINS`

### Update API Proxy in Frontend

Update `frontend/vercel.json`:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://jobfor-backend.onrender.com/api/$1"
    }
  ]
}
```

---

## 🧪 Test Deployment

### Backend Health Check
```bash
curl https://jobfor-backend.onrender.com/health
# Expected: {"status":"ok","version":"1.0.0",...}
```

### Frontend
1. Visit `https://jobfor.vercel.app`
2. Click **"Login"** or **"Join"**
3. Test registration flow
4. Check dashboard loads

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                      │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                              │
        ▼                              ▼
┌──────────────────┐         ┌──────────────────────┐
│  Vercel         │         │  Render               │
│  (Frontend)     │◄────────┤  (Backend API)      │
│  React + Vite   │  API    │  FastAPI + Python    │
│  Static Files   │  Calls  │  Port: $PORT         │
└──────────────────┘         └──────────┬───────────┘
                                       │
                                       ▼
                              ┌──────────────────────┐
                              │  Render PostgreSQL   │
                              │  (Database)         │
                              │  Port: 5432         │
                              └──────────────────────┘
```

---

## 🔧 Troubleshooting

### Backend Issues

**Build Fails:**
```bash
# Check Render build logs
# Common issue: missing dependencies
# Fix: Add to requirements.txt
```

**Database Connection Error:**
```bash
# Check DATABASE_URL is set correctly
# Verify PostgreSQL service is running
```

**CORS Errors:**
```bash
# Update ALLOWED_ORIGINS in Render dashboard
# Include both Vercel URL and custom domain
```

### Frontend Issues

**Build Fails:**
```bash
# Check Vercel build logs
# Verify VITE_API_BASE_URL is set
```

**API Calls Fail:**
```bash
# Check browser console for CORS errors
# Verify backend URL in vercel.json is correct
```

---

## 🎯 Quick Deploy Commands

### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd JobFor/frontend
vercel --prod
```

### Option 2: Using Render CLI
```bash
# Install Render CLI
# Download from: https://render.com/docs/cli

# Login
render login

# Deploy
cd JobFor/backend
render blueprint create
```

---

## 📝 Post-Deployment

### Set Up Custom Domain (Optional)

**Vercel:**
1. Go to project settings → Domains
2. Add your domain
3. Update DNS records

**Render:**
1. Go to service settings → Custom Domains
2. Add your domain
3. Update `ALLOWED_ORIGINS`

### Enable HTTPS
- Vercel: Automatic (Let's Encrypt)
- Render: Automatic (Let's Encrypt)

### Monitor Logs

**Vercel:**
```bash
vercel logs
```

**Render:**
```bash
render logs
```

---

## ✅ Deployment Complete!

Your JobFor app is now live:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **API Docs**: `https://your-backend.onrender.com/docs`

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:
- Push to `main` → Auto-deploy to production
- Create PR → Preview deployment on Vercel

---

## 💰 Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | **Free** |
| Render (Backend) | Starter | **$7/month** |
| Render (PostgreSQL) | Free | **Free** (expires after 90 days) |
| **Total** | | **~$7/month** |

**Free Tier Alternative:**
- Use **Render Free** for backend (spins down after 15 min inactivity)
- Use **Supabase** (free PostgreSQL) instead of Render PostgreSQL