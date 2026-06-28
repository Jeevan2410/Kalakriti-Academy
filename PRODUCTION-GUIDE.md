# ══════════════════════════════════════════════════════════════
# 🎓 KALAKRITI ACADEMY — COMPLETE PRODUCTION SETUP GUIDE
# ══════════════════════════════════════════════════════════════
# Read each section carefully. Follow the steps in order.
# ══════════════════════════════════════════════════════════════


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1️⃣  DATABASE (Supabase — Free, Hosted PostgreSQL)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# WHAT: A database is where ALL your data lives — courses, users,
#       orders, payments, reviews, everything.
#
# RIGHT NOW: SQLite (a local file db/custom.db) — works for dev only
# FOR PRODUCTION: You need a real hosted database
#
# BEST CHOICE: Supabase (FREE — 500MB, 50K rows)
#
# ── SETUP STEPS ────────────────────────────────────────────
# 1. Go to https://supabase.com → Sign up (Google/GitHub)
# 2. Click "New Project"
# 3. Fill: Name=kalakriti, Password=(strong), Region=Mumbai
# 4. Wait 2 min → Project is ready
# 5. Go to Settings → Database → Copy "Connection string (URI)"
#    It looks like:
#    postgresql://postgres.abc:[PASSWORD]@aws-0-mumbai.pooler.supabase.com:6543/postgres
# 6. Paste it in .env.production as DATABASE_URL=
# 7. In terminal run: npx prisma db push
# 8. Start app: bun run dev → Courses auto-seed on first visit
#
# MANAGE DATA: Supabase Dashboard → "Table Editor" tab
#   → See all tables: User, Product, Order, Enrollment, etc.
#   → Click any row to edit
#   → "SQL Editor" tab for custom queries
#
# ────────────────────────────────────────────────────────────


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2️⃣  VIDEO UPLOADS (Cloudinary — Free 25GB)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# WHAT: Videos are too big for databases. They need cloud storage.
#       Cloudinary stores videos, compresses them, and gives you URLs.
#       Your database only stores the URL (link), not the video itself.
#
# BEST CHOICE: Cloudinary (FREE — 25GB storage, 25GB bandwidth/month)
#
# ── SETUP STEPS ────────────────────────────────────────────
# 1. Go to https://cloudinary.com → Sign up (free)
# 2. Dashboard shows: Cloud Name, API Key, API Secret
# 3. Copy all 3 → Paste in .env.production
#
# CREATE UPLOAD PRESET (required for uploads to work):
# 1. Cloudinary → Settings (gear) → Upload tab
# 2. "Upload Presets" → "Add Upload Preset"
# 3. Name: kalakriti-uploads
# 4. Signing Mode: UNSIGNED ← important!
# 5. Save
#
# ── HOW TO UPLOAD VIDEOS ──────────────────────────────────
#
# Option A: Via Cloudinary Dashboard (easiest)
#   1. Cloudinary → "Media Library" → "Upload"
#   2. Select your video file
#   3. After upload → Click video → Copy URL
#   4. Paste URL in your course data (Supabase → Product → previewVideo)
#
# Option B: Via your app's API (programmatic)
#   Your app has: POST /api/upload
#   Example:
#     const formData = new FormData()
#     formData.append('file', videoFile)
#     formData.append('folder', 'courses/stock-market')
#     const res = await fetch('/api/upload', { method: 'POST', body: formData })
#     const { url } = await res.json()  // This is the video URL
#
# Option C: Via command line (curl)
#   curl -X POST https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload \
#     -F file=@my-video.mp4 \
#     -F upload_preset=kalakriti-uploads \
#     -F folder=courses/stock-market
#
# SUPPORTED FORMATS: MP4, WebM, MOV
# MAX SIZE: 500MB per video
# ────────────────────────────────────────────────────────────


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3️⃣  HOSTING — Put Your Site on the Internet
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# ── OPTION A: VERCEL (Free, 5 minutes, easiest) ────────────
#
# 1. Push code to GitHub:
#    git init
#    git add .
#    git commit -m "v1"
#    git remote add origin https://github.com/YOUR_USERNAME/kalakriti-academy.git
#    git push -u origin main
#
# 2. Go to https://vercel.com → Sign up with GitHub
# 3. "New Project" → Import "kalakriti-academy"
# 4. "Environment Variables" → Add all from .env.production
# 5. Click "Deploy" → Wait 2 min → Live!
#    URL: https://kalakriti-academy.vercel.app
#
# NOTE: Vercel needs PostgreSQL (Supabase), not SQLite
#
# ────────────────────────────────────────────────────────────
#
# ── OPTION B: VPS + CUSTOM DOMAIN (Professional, ~₹500/mo) ─
#
# BUY VPS:
#   Hostinger VPS: https://www.hostinger.in/vps-hosting
#   Plan: KVM 1 (1 vCPU, 4GB RAM, 50GB SSD) = ₹149/month
#   Location: Mumbai
#
# BUY DOMAIN:
#   GoDaddy/Namecheap: kalakritiacademy.com = ~₹700/year
#
# SETUP SERVER (copy-paste each line via SSH):
#   ssh root@YOUR_SERVER_IP
#   apt update && apt upgrade -y
#   curl -fsSL https://bun.sh/install | bash
#   source ~/.bashrc
#   npm install -g pm2
#   apt install nginx certbot python3-certbot-nginx -y
#
# UPLOAD PROJECT:
#   git clone https://github.com/YOUR_USERNAME/kalakriti-academy.git
#   cd kalakriti-academy
#   cp .env.production .env
#   nano .env   # Fill in Supabase/Cloudinary/Razorpay keys
#
# START APP:
#   bun install
#   npx prisma db push
#   bun run build
#   pm2 start bun --name kalakriti -- start
#   pm2 save && pm2 startup
#
# CONFIGURE NGINX:
#   nano /etc/nginx/sites-available/kalakriti
#   Paste:
#     server {
#         listen 80;
#         server_name kalakritiacademy.com www.kalakritiacademy.com;
#         location / {
#             proxy_pass http://localhost:3000;
#             proxy_http_version 1.1;
#             proxy_set_header Upgrade $http_upgrade;
#             proxy_set_header Connection 'upgrade';
#             proxy_set_header Host $host;
#             proxy_set_header X-Real-IP $remote_addr;
#         }
#     }
#   Then:
#   ln -s /etc/nginx/sites-available/kalakriti /etc/nginx/sites-enabled/
#   nginx -t && systemctl restart nginx
#
# CONNECT DOMAIN:
#   GoDaddy DNS → Add A Record: @ → YOUR_SERVER_IP
#   Add CNAME: www → @
#   Wait 10-30 min
#
# ADD HTTPS (free):
#   certbot --nginx -d kalakritiacademy.com -d www.kalakritiacademy.com
#
# ✅ Live at https://kalakritiacademy.com!
# ────────────────────────────────────────────────────────────


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4️⃣  PAYMENTS (Razorpay — Best for India)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# WHAT: Accept UPI, Cards, NetBanking from students
# COST: 2% per transaction (no monthly fee)
# SETTLEMENT: Money in your bank in 3 days
#
# ── SETUP STEPS ────────────────────────────────────────────
# 1. Go to https://dashboard.razorpay.com → Sign up
# 2. Complete KYC (Aadhaar, PAN, Bank Account) — takes 1-2 days
# 3. Settings → API Keys → Copy Key ID + Key Secret
# 4. Add to .env.production
#
# ── TEST FIRST (no real money) ────────────────────────────
# 1. Toggle "Test Mode" ON in Razorpay Dashboard
# 2. Get TEST keys (start with rzp_test_)
# 3. Test cards:
#    Success: 4111 1111 1111 1111
#    Failure: 4000 0000 0000 0002
#    UPI Test: success@razorpay
#
# ── GO LIVE ───────────────────────────────────────────────
# 1. Complete KYC verification
# 2. Toggle "Test Mode" OFF
# 3. Your live keys (rzp_live_) are used automatically
# 4. Real payments start working!
#
# Your app already has:
#   POST /api/payment  → Creates Razorpay order
#   PUT /api/payment   → Verifies payment signature
#
# MONEY FLOW:
#   Student pays ₹2,999 → Razorpay takes ₹60 (2%) → ₹2,939 in your bank in 3 days
# ────────────────────────────────────────────────────────────


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5️⃣  DASHBOARD — How to Manage Everything
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# STUDENT DASHBOARD (already built in your app):
#   → Click "Sign In" → "Dashboard"
#   → Shows: Enrolled courses, progress bars, stats
#
# ADMIN DATA ACCESS:
#
#   Option A: Supabase Table Editor (easiest)
#   → supabase.com → Your Project → Table Editor
#   → See all tables: User, Product, Order, Enrollment, Review, Coupon
#   → Click to add/edit/delete any row
#   → "SQL Editor" for custom queries like:
#     SELECT SUM(totalAmount) as revenue FROM "Order" WHERE paymentStatus='completed';
#
#   Option B: Admin Stats API
#   → Visit: /api/admin/stats
#   → Shows: total users, orders, revenue, top courses, recent orders
#
#   Option C: Prisma Studio (local only)
#   → Run: npx prisma studio
#   → Opens: http://localhost:5555
#   → Visual database browser
#
# HOW TO ADD A NEW COURSE:
#   1. Supabase → Table Editor → Product → "Insert row"
#   2. Fill: title, slug, description, price, originalPrice,
#      thumbnail (Cloudinary URL), level, duration, lessons,
#      instructor, featured, bestSeller, status="published", categoryId
#   3. Go to Chapter table → Add chapters for this product
#   4. Go to Lesson table → Add lessons for each chapter
#   5. Upload video to Cloudinary → Get URL → Store in lesson
#
# ────────────────────────────────────────────────────────────


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6️⃣  COST BREAKDOWN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# FREE TIER (start with this):
#   Supabase Database:    ₹0/month  (free)
#   Cloudinary Storage:   ₹0/month  (25GB free)
#   Vercel Hosting:       ₹0/month  (free)
#   Razorpay:             ₹0/month  (2% per transaction only)
#   Domain:               ₹0  (use .vercel.app subdomain)
#   ─────────────────────────────────
#   TOTAL:                ₹0/month ✅
#
# PROFESSIONAL:
#   VPS (Hostinger):      ₹149/month
#   Domain (.com):        ~₹58/month  (₹700/year)
#   Razorpay:             2% per transaction
#   Everything else:      Free (until you scale)
#   ─────────────────────────────────
#   TOTAL:                ~₹200-250/month
#
# ────────────────────────────────────────────────────────────


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📋 QUICK START CHECKLIST
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# □ 1. Sign up Supabase  → Create project → Get DATABASE_URL
# □ 2. Sign up Cloudinary → Get Cloud Name + API keys
# □ 3. Sign up Razorpay  → Complete KYC → Get API keys
# □ 4. Fill .env.production with all 3 credentials
# □ 5. Push code to GitHub
# □ 6. Deploy to Vercel (free) or VPS (₹149/mo)
# □ 7. Test: Browse → Cart → Pay → Dashboard
# □ 8. Upload course videos to Cloudinary
# □ 9. Toggle Razorpay to Live mode
# □ 10. Share URL with students! 🚀
#
# ══════════════════════════════════════════════════════════════