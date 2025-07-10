# 🚀 GitHub-Based AWS Deployment Guide

## Why GitHub Deployment is Better

- ✅ **No manual uploads** - Push code, auto-deploy
- ✅ **Professional workflow** - Industry standard
- ✅ **Easy for judges** - They can see your code AND live app
- ✅ **Continuous deployment** - Changes deploy automatically
- ✅ **Version control** - Track all changes

## 📋 Prerequisites

1. Push your code to GitHub (public repo for judges)
2. AWS account with basic permissions
3. 15 minutes setup time

---

## 🌐 STEP 1: Frontend Deployment (AWS Amplify + GitHub)

### 1.1 Push to GitHub First

```bash
# Add and commit all changes
git add .
git commit -m "Prepare for AWS deployment"
git push origin main
```

### 1.2 Deploy via AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. **Connect to GitHub:**

   - Select **GitHub**
   - Authorize AWS Amplify to access your repos
   - Choose your `ai-influencer` repository
   - Branch: `main`

4. **Configure Build Settings:**

   - App name: `clonefluencer`
   - Build settings will auto-detect `amplify.yml` ✅
   - Click **"Next"**

5. **Add Environment Variables:**

   ```
   NEXT_PUBLIC_API_URL=[will-set-after-backend]
   NEXT_PUBLIC_AWS_USER_POOL_ID=your-cognito-pool-id
   NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your-cognito-client-id
   ```

6. **Deploy!** (Takes 5-10 minutes)
   - Amplify will build and deploy automatically
   - You'll get a live URL like: `https://main.xyz123.amplifyapp.com`

---

## 🔧 STEP 2: Backend Deployment (Multiple Options)

### Option A: AWS App Runner (Recommended - GitHub Integration)

1. **Create Dockerfile in backend folder:**

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "application:application"]
```

2. **Deploy via App Runner:**
   - Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner/)
   - Click **"Create service"**
   - **Source:** GitHub
   - Connect your repository
   - **Source directory:** `/backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn --bind 0.0.0.0:8000 application:application`

### Option B: Railway (Fastest Setup)

1. Go to [Railway.app](https://railway.app)
2. **"Deploy from GitHub repo"**
3. Select your repository
4. **Root directory:** `/backend`
5. Add environment variables
6. Deploy! (2 minutes)

### Option C: Render (Free Option)

1. Go to [Render.com](https://render.com)
2. **"New Web Service"**
3. Connect GitHub repo
4. **Root directory:** `/backend`
5. **Build command:** `pip install -r requirements.txt`
6. **Start command:** `gunicorn application:application`

---

## ⚙️ STEP 3: Configuration

### 3.1 Update Frontend with Backend URL

Once backend is deployed, update Amplify environment variables:

1. Go to Amplify Console → Your app → Environment variables
2. Update `NEXT_PUBLIC_API_URL` with your backend URL
3. Redeploy (automatic)

### 3.2 Configure CORS in Backend

Your backend should allow the Amplify domain in CORS settings.

---

## 🎯 STEP 4: Final Setup for Judges

### 4.1 Update README with Live URLs

```markdown
## 🚀 Live Demo

**Frontend:** https://main.xyz123.amplifyapp.com
**Backend API:** https://your-backend-url.com
**GitHub Repository:** https://github.com/yourusername/ai-influencer

### For Judges - Quick Access:

- **Live Application:** [Click here](https://main.xyz123.amplifyapp.com)
- **Source Code:** [GitHub Repository](https://github.com/yourusername/ai-influencer)
- **API Documentation:** [Backend URL]/health
```

### 4.2 Make Repository Public

```bash
# On GitHub.com:
# Go to Settings → Change repository visibility → Make public
```

---

## 🔄 Continuous Deployment Setup

**Frontend (Amplify):**

- ✅ Auto-deploys on every `git push` to main
- ✅ Build logs available in Amplify console
- ✅ Custom domains supported

**Backend (App Runner/Railway/Render):**

- ✅ Auto-deploys on every `git push`
- ✅ Zero-downtime deployments
- ✅ Automatic scaling

---

## 🆘 Quick Deploy Commands

### For immediate deployment:

```bash
# 1. Commit and push changes
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Both frontend and backend deploy automatically!
# 3. Check deployment status in respective consoles
```

---

## 📊 Benefits for Hackathon Judges

1. **Live Demo:** Working application they can test immediately
2. **Source Code:** Full codebase visible on GitHub
3. **Professional Setup:** Industry-standard deployment workflow
4. **Easy Updates:** You can fix issues and redeploy instantly
5. **Scalable Architecture:** Production-ready AWS infrastructure

---

## 🎯 Estimated Timeline

| Step          | Time        | What Happens                   |
| ------------- | ----------- | ------------------------------ |
| GitHub Push   | 2 min       | Code uploaded                  |
| Amplify Setup | 10 min      | Frontend deployed              |
| Backend Setup | 10 min      | API deployed                   |
| Configuration | 5 min       | Connect frontend to backend    |
| **Total**     | **~30 min** | **Full production deployment** |

**Result:** Professional deployment that impresses judges! 🏆
