# dm-intelligence
A web app posing as a mediocre TTRPG Game Master with some short term memory loss

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started
1. Rename `.env.example` to `.env.local` and update all relevant environment variables. 
2. In the project directory run:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Stack
Frontend: Next.js 15 with AppRouter
Backend: Supabase with pgvector extension

## Hints for Copilot
- `DATABASE_SCHEMA.md` contains a definition of the supabase schema
- All pages and routes except `/login` are hidden behind a successful authentication with supabase. This is enforced ./middleware.js
- Use `@/<path to resource>` notation for imports to keep them uniform and clean (ex. `@/components/Header`)
