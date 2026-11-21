# PayFlow

The backend uses PostgreSQL as its database, accessed through Prisma. You can
connect it to a PostgreSQL server already installed on your machine, or start
the project's PostgreSQL container with Docker Compose.

## Option 1: Use an existing PostgreSQL installation

Create a database for the application (the default name is `payflow`) and ensure
the PostgreSQL server is running. Set `DATABASE_URL` in `backend/.env` to match
your local PostgreSQL username, password, host, port, and database:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:<port|5432>/payflow?schema=public"
```

Change the port or other connection details if your local PostgreSQL setup uses
different values.

## Option 2: Start PostgreSQL with Docker Compose

Docker Desktop (or Docker Engine with the Compose plugin) must be installed and
running. From the repository root, start the database:

```sh
docker compose up -d
```

The Compose service uses PostgreSQL 17 and exposes the container's port `5432`
as port `5433` on your machine. It creates the `payflow` database and persists
its data in the `payflow_postgres_data` Docker volume. The configured database
connection for this service is:

```env
DATABASE_URL="postgresql://payflow_user:<POSTGRES_PASSWORD>@localhost:5433/payflow?schema=public"
```

Replace `<POSTGRES_PASSWORD>` with the `POSTGRES_PASSWORD` value configured for
the `postgres` service in `docker-compose.yml`.

To confirm the container is running and healthy:

```sh
docker compose ps
docker compose logs -f postgres
```

The Compose credentials are for local development. Change them in
`docker-compose.yml` and use the same credentials in `backend/.env` before
using this setup outside a local development environment.

## Backend guide

From the repository root, create the backend environment file:

```sh
cd backend
copy .env.example .env
```

On PowerShell, `copy` works as written. In a POSIX shell, use
`cp .env.example .env` instead.

Edit `backend/.env` and set `DATABASE_URL` for the PostgreSQL instance you
chose. Also replace the JWT secret and seed HR manager placeholders with local
development values. The default frontend origin is `http://localhost:5173`;
update `FRONTEND_URL` if the frontend uses a different origin.

Install dependencies, generate the Prisma client, apply migrations, and seed
the database:

```sh
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the backend API in development mode:

```sh
npm run dev
```

By default, the API runs on `http://localhost:5000`.

Other useful backend commands (run from `backend/`):

```sh
npm test
npm run build
npm run db:validate
npm run db:studio
```

`npm run db:studio` opens Prisma Studio for browsing the local database.

## Frontend guide

The frontend is a React and TypeScript application powered by Vite. Make sure
PostgreSQL and the backend API are running first (see the guides above), then
open a separate terminal from the repository root:

```sh
cd frontend
npm install
npm run dev
```

Vite prints the local frontend URL when the development server starts (normally
`http://localhost:5173`).

### Configure the API URL

By default, the frontend sends API requests to
`http://localhost:5000/api`. To use a different backend address, create
`frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The backend must allow the frontend origin through `FRONTEND_URL` in
`backend/.env` and enable credentialed CORS. For the default Vite URL, set
`FRONTEND_URL="http://localhost:5173"`. Restart Vite after changing its `.env`
file.

### Frontend checks and production preview

Run these commands from `frontend/`:

```sh
npm test
npm run lint
npm run build
```

To preview the production build locally, build first and then run:

```sh
npm run preview
```

## Stop the database container

To stop the Compose database without deleting its data:

```sh
docker compose stop postgres
```
