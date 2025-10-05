# Jamfusion Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free): https://vercel.com
- Render account (free): https://render.com
- Your API keys:
  - ElevenLabs API key
  - Google Gemini API key

## Backend Deployment (Render)

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Go to Render Dashboard**
   - Visit https://render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository: `hackharvard2025`
   - Render will auto-detect `backend/render.yaml`

3. **Add Environment Variables**
   - In the Render dashboard, add these secret env vars:
     - `ELEVENLABS_API_KEY`: Your ElevenLabs API key
     - `GOOGLE_API_KEY`: Your Google Gemini API key

4. **Deploy**
   - Click "Apply" or "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Copy your backend URL (e.g., `https://jamfusion-backend.onrender.com`)

### Option 2: Manual Setup

1. Go to Render → New Web Service
2. Connect GitHub repo
3. Configure:
   - **Name**: jamfusion-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (same as above)
5. Click "Create Web Service"

## Frontend Deployment (Vercel)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Root Directory**: Leave as default (auto-detects Next.js)
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

3. **Add Environment Variable**
   - Click "Environment Variables"
   - Add:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: Your Render backend URL (e.g., `https://jamfusion-backend.onrender.com`)
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your frontend is live! (e.g., `https://jamfusion.vercel.app`)

## Post-Deployment

### Testing
1. Visit your Vercel frontend URL
2. Try creating nodes via voice or drag-and-drop
3. Generate music
4. Check that all features work

### Common Issues

**Backend timeout error:**
- Render free tier spins down after 15 min of inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are instant

**CORS errors:**
- Already fixed! Backend allows all origins

**API not found:**
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Verify the URL doesn't have a trailing slash

### Updating Your Deployment

**Backend:**
- Push to GitHub → Render auto-deploys

**Frontend:**
- Push to GitHub → Vercel auto-deploys

## Environment Variables Summary

### Backend (Render)
```
ELEVENLABS_API_KEY=your_elevenlabs_key_here
GOOGLE_API_KEY=your_google_key_here
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Costs
- **Render**: Free tier (750 hrs/month)
- **Vercel**: Free tier (unlimited hobby projects)
- **Total**: $0/month for hackathon demo!

## Need Help?
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- Check backend logs in Render dashboard
- Check frontend logs in Vercel dashboard
