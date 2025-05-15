# Herogram Live Poll Application

This project is a real-time polling application with a React frontend and a Node.js backend, using Docker for easy setup and deployment. It supports live poll results using WebSockets and Redis.

---

## Quick Start

### 1. Start All Services

From the project root directory, run:

```
docker compose up -d
```
This will start the frontend, backend, and Redis containers.

### 2. Initialize the Poll

After the containers are running, initialize the default poll ("age") by running:

```
docker compose exec backend node src/initGlobalPoll.js
```
This ensures the poll exists in the database.

---

## Access the App
- Frontend: [http://localhost:3000/](http://localhost:3000/)
- Backend API: [http://localhost:4000/](http://localhost:4000/)

---

## Troubleshooting
- If you see old UI, clear your browser cache and/or rebuild containers:
  - `docker compose down && docker compose up --build -d`
- If you get `{"error":"Poll not found"}` from the backend, make sure to run the poll initialization script above.

---

## Project Structure
- `frontend/` — React app for voting and displaying live results
- `backend/` — Node.js API and WebSocket server
- `docker-compose.yml` — Multi-service orchestration

---

## Development
- Frontend changes are hot-reloaded if using bind mounts.
- Backend changes may require a container restart: `docker compose restart backend`

---

## License
MIT
