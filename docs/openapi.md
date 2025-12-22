# OpenAPI / Swagger

The Trustfy API exposes an OpenAPI-compatible specification and UI at runtime:

- **Swagger UI**: `GET /v1/docs` (serves a browsable explorer with all endpoints, schemas, and authentication helpers).
- **Raw JSON**: `GET /v1/docs-json` (can be redirected to a file for generation).

After starting the API (`npm run --workspace @trustfy/api start` or via Docker Compose), point your browser to `http://localhost:4000/v1/docs` and use the bearer auth toggle to explore the authenticated routes. The Swagger document is derived from decorators, DTOs, and validation metadata, so every module is described in the resulting spec.
