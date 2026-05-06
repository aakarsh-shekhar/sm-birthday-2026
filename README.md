# Family Trip Swipe Planner

A Tinder-style voting app for group trip planning:

- Each family member enters their name.
- They go through the full activity list and vote `Pass`, `Like`, or `Superlike` (must-do).
- Votes are stored in a database.
- Admin dashboard aggregates popularity and shows individual responses.

## Routes

- `/` participant voting flow
- `/admin` admin dashboard
- `/api/session` create participant session + fetch activities
- `/api/swipes` save swipe decisions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:

```bash
cp .env.example .env
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Start the app:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Deploy Notes

For production deployment, switch `DATABASE_URL` to a hosted Postgres database (Neon, Supabase, Railway, etc.) and run Prisma migrations in your deploy pipeline.
