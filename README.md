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
Frontend: Next.js
Backend: Supabase

## Idea Board
- look into using generated images for capturing important information for recall. This may help lead to more consistent descriptions of character appearance, locations (better staying on message with vibe). But need to consider token size vs a detailed description. Can compression be used on the image or will this degrage recognition. May not work for a model that is not multimodal.

