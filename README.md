# Messmate App

A full-stack web app to discover, add, and review mess services. Frontend built with Vite + React, backend with Express + TypeScript + Mongoose. Authentication uses JWT (Authorization header) and optional Google OAuth.

## Features

- Browse, filter, and sort mess listings
- Add mess listing (owners) with city, state, cuisine type, prices
- Add reviews with ratings
- Authentication with email/password and Google OAuth
- Stateless JWT stored client-side and attached as `Authorization: Bearer <token>`

## Tech Stack

- Client: React, Vite, Axios
- Server: Express (TypeScript), Mongoose, Passport Google OAuth, JSON Web Tokens
- Deployment: Netlify (client), Railway (server)

## Repository Structure

- `server/` Express API
- `api/` Axios client utilities
- `components/` React UI components
- `public/_redirects` Netlify SPA routing file

## Environment Configuration

### Client (root)

- `.env.development`
  - `VITE_API_URL=http://localhost:5000`
  - `VITE_SERVER_URL=http://localhost:5000/api`
  - `NODE_ENV=development`
- `.env.production`
  - `VITE_API_URL={Backend URL}`
  - `VITE_SERVER_URL={Backend URL}/api`
  - `NODE_ENV=production`

### Server (`server/`)

- `.env.development`
  - `PORT=5000`
  - `CLIENT_URL=http://localhost:5173`
  - `JWT_SECRET=<strong-secret>`
  - `MONGO_URI=<mongodb-connection-string>`
  - `GOOGLE_CLIENT_ID=<google-client-id>`
  - `GOOGLE_CLIENT_SECRET=<google-client-secret>`
  - `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`
- `.env` (production)
  - `PORT=5000`
  - `CLIENT_URL={Frontend URL}
  - `JWT_SECRET=<same-strong-secret>`
  - `MONGO_URI=<mongodb-connection-string>`
  - `GOOGLE_CLIENT_ID=<google-client-id>`
  - `GOOGLE_CLIENT_SECRET=<google-client-secret>`
  - `GOOGLE_CALLBACK_URL={Backend URL}/api/auth/google/callback`

## Google OAuth Console Settings

- Register app with Google Cloud Console
- Set credentials
  - Authorized JavaScript origins
    - `http://localhost:5173`
    - `{Frontend URL}`
  - Authorized redirect URIs
    - `http://localhost:5000/api/auth/google/callback`
    - `{Backend URL}/api/auth/google/callback`

## Netlify SPA Redirects

- Ensure client deep-links load the SPA by adding:
  - `public/_redirects` with:
    ```
    /* /index.html 200
    ```

## Development

- Install dependencies
  - Client: `npm install`
  - Server: `cd server && npm install`
- Run locally
  - Server: `npm run dev` in `server`
  - Client: `npm run dev` in root
- Access
  - Client at `http://localhost:5173`
  - Server at `http://localhost:5000`

## Production

- Build
  - Client: `npm run build` (outputs `dist/`)
  - Server: `cd server && npm run build` (outputs `server/dist/`)
- Run server
  - `cd server && node dist/index.js` or `npm run serve`
- Deploy
  - Netlify: publish `dist/`
  - Railway: point to server start command, set environment variables

## API Overview

- Auth
  - `POST /api/auth/register` → `{ _id, name, email, role, token }`
  - `POST /api/auth/login` → `{ _id, name, email, role, token }`
  - `POST /api/auth/logout` → `{ message }`
  - `GET /api/auth/me` (requires `Authorization: Bearer`) → user profile
  - `GET /api/auth/google` → initiate OAuth
  - `GET /api/auth/google/callback` → issues JWT, redirects to `CLIENT_URL/auth/callback?token=...`
- Messes
  - `GET /api/messes` → list messes
  - `POST /api/messes` (requires `Authorization: Bearer`) → create mess with `{ name, address, contact, city, state, cuisineType, price, googleMapsLink }`
  - `POST /api/messes/:messId/reviews` → add review `{ rating, comment, author }`

## Authentication Flow

- Login/Register returns a JWT; client stores in `localStorage` as `jwtToken`
- Axios attaches `Authorization: Bearer <jwt>` automatically (`api/axiosClient.ts`)
- Server middleware `protect` verifies token and populates `req.user`
- Google OAuth redirects back to `/auth/callback?token=...`; the SPA stores the token and returns to `/`

## Troubleshooting

- 404 on `/auth/callback` (Netlify): add `public/_redirects` as shown above
- 502 on Railway: ensure server runs compiled JS (`npm run build`, then `npm run serve`)
- 401 invalid signature: clear `jwtToken` and re-login in the same environment (don’t mix prod/local tokens)
