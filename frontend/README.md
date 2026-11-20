# PayFlow frontend

The React/Vite frontend uses the cookie-authenticated API. Start the backend first, then run:

```sh
npm install
npm run dev
```

By default, the frontend calls `http://localhost:5000/api`, matching the backend's default port. To use another API address, set `VITE_API_BASE_URL` in a local `.env` file:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

The backend must allow the frontend origin in `FRONTEND_ORIGINS` and enable credentialed CORS. Authentication cookies are HttpOnly; the frontend does not store access or refresh tokens in browser storage.

All API modules live in `src/api/`. Each RTK Query API slice is created with `createAppApi` and registered in the Redux store; CSV downloads use the reports helper. UI pages and validation schemas are organized by feature under `src/features/`. The Redux store lives in `src/app/`.

Run the frontend checks with:

```sh
npm test
npm run lint
npm run build
```
