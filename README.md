# TimeCheck – GPS + Face ID Attendance

Production-ready fullstack attendance app built with Next.js 14, Prisma, and face-api.js.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Auth | NextAuth.js v5 (JWT, Credentials provider) |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Face recognition | @vladmandic/face-api (TinyFaceDetector, client-side only) |
| Geofencing | Browser Geolocation API + Haversine formula |
| Hosting | Vercel (frontend) + Supabase (DB) |

## Quick Start

### 1. Install dependencies

```bash
cd timecheck
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in:

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
AUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to DB
npm run db:seed       # seed test users + locations
```

### 4. Download face-api.js models

The face scanner needs model weights in `/public/models/`. Download them:

```bash
mkdir -p public/models
# TinyFaceDetector
curl -L https://github.com/vladmandic/face-api/raw/master/model/tiny_face_detector_model-shard1 -o public/models/tiny_face_detector_model-shard1
curl -L https://github.com/vladmandic/face-api/raw/master/model/tiny_face_detector_model-weights_manifest.json -o public/models/tiny_face_detector_model-weights_manifest.json
# Face Landmark 68 Tiny
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_tiny_model-shard1 -o public/models/face_landmark_68_tiny_model-shard1
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_tiny_model-weights_manifest.json -o public/models/face_landmark_68_tiny_model-weights_manifest.json
# Face Recognition
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-shard1 -o public/models/face_recognition_model-shard1
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-shard2 -o public/models/face_recognition_model-shard2
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-weights_manifest.json -o public/models/face_recognition_model-weights_manifest.json
```

### 5. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@acme.co | admin123 |
| Staff | sarah.chen@acme.co | staff123 |

## Project Structure

```
timecheck/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (app)/
│   │   ├── dashboard/         # Home + punch buttons
│   │   ├── history/           # Monthly attendance history
│   │   ├── profile/           # Profile + sign out
│   │   └── admin/locations/   # Admin location CRUD
│   └── api/
│       ├── attendance/        # GET (today) / POST (punch)
│       ├── auth/[...nextauth] # NextAuth handler
│       └── locations/         # GET / POST / PATCH / DELETE
├── components/
│   ├── FaceScanner.tsx        # Camera + face-api detection
│   ├── GeofenceChecker.tsx    # GPS watch + Haversine check
│   ├── PunchButton.tsx        # 6-state attendance button
│   ├── LocationBadge.tsx      # In Zone / Out of Zone chip
│   ├── AttendanceRow.tsx      # History table row
│   └── BottomNav.tsx          # Mobile bottom navigation
├── lib/
│   ├── geofence.ts            # Haversine + findActiveLocation
│   ├── face.ts                # face-api.js wrapper
│   └── prisma.ts              # Prisma client singleton
├── prisma/
│   ├── schema.prisma          # DB schema
│   └── seed.ts                # Test data
└── types/index.ts             # Shared types + punch ordering
```

## Core Flows

### Punching In
1. Page loads → GeofenceChecker requests GPS
2. Haversine distance compared to all assigned locations
3. If within radius → `inZone = true`, punch buttons activate
4. User taps next punch button → FaceScanner opens
5. Camera → face detected → descriptor compared to stored embedding
6. If distance < 0.5 → score + pass sent to `POST /api/attendance`
7. Server re-validates geofence + face score before writing DB

### Face Enrollment
Currently users start with an empty `faceEmbedding []`, which auto-passes verification.
To enroll a face, add a `/profile/enroll` page that:
1. Opens camera
2. Captures descriptor
3. `PATCH /api/users/me` with the Float[] embedding

## Deploying to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all env vars from `.env.local`
4. Deploy — Prisma generates automatically on build

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Prisma connection string (pooled) |
| `DIRECT_URL` | Direct connection string (for migrations) |
| `AUTH_SECRET` | NextAuth secret (min 32 chars) |
| `NEXTAUTH_URL` | Canonical app URL |
