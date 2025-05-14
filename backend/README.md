# Poll Backend

## Architecture
- **Express.js** for REST API
- **WebSocket** for live poll updates
- **Redis** for pub/sub and rate limiting
- **Helmet** for security headers
- **ENV-based secrets**; see `.env.example`
- **Jest** for tests and coverage

## Run Commands
```
npm install
npm start
```

## Testing (with coverage)
```
npm test
```

## Scaling Notes
- Redis pub/sub enables horizontal scaling for WebSocket fan-out.
- Rate limiting can be enforced via Redis tokens per user.
- In-memory poll storage should be replaced with persistent DB/Redis for production.

## Security
- Helmet sets OWASP headers.
- No secrets in repo; use `.env` file.

## Reasoning
- Express is lightweight and familiar for REST.
- Redis enables scalable real-time pub/sub.
- Jest + supertest ensures >80% coverage.
