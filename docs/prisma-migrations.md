# Prisma Migrations

All schema changes live in `api/prisma/schema.prisma` and are applied via Prisma Migrate:

1. **Generate migration** after touching the schema:
   ```sh
   cd api
   npx prisma migrate dev --name descriptive-change
   ```
   This writes SQL to `api/prisma/migrations/<timestamp>_descriptive-change/` and updates the client.

2. **Deploy migrations** in production/local compose environments:
   ```sh
   cd api
   npx prisma migrate deploy
   ```

3. **Refresh client** anytime tables or enums change:
   ```sh
   cd api
   npx prisma generate
   ```

Migrations include the full `Escrow`, `EscrowTimeline`, `Evidence`, `Dispute`, `IndexerCheckpoint`, `TokenRegistry`, `AuditLog`, `Nonce`, and associated indexes referenced by the PRD.
