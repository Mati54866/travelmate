# TravelMate

TravelMate is a trip-guide booking platform for travelers and local guides.

## Features
- Traveler and guide accounts
- Guide profiles with tours, bookings, and reviews
- ImageKit-powered image uploads
- Google login and email/password auth
- Admin dashboard for user and guide management

## Screenshots
Stored in `assets/`:
- `assets/homepage.png`
- `assets/guidePage.png`
- `assets/GuideDashboard.png`
- `assets/ReviewsPage.png`

## Setup
```bash
npm run install:all
```

Copy the environment files and fill them in:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Start both apps:
```bash
npm run dev
```

## Environment
Backend:
- `MONGO_URI`
- `CLIENT_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `IMAGEKIT_URL_ENDPOINT`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

Frontend:
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Useful scripts
- `npm run build` - build the frontend
- `npm start` - start the backend
- `npm run seed:demo` - seed demo data

## Deployment
Frontend:
- Root: `frontend`
- Build: `npm run build`
- Output: `dist`

Backend:
- Root: `backend`
- Start: `npm start`
- Set production env vars in the host
- Make sure `CLIENT_URL` matches the deployed frontend URL
