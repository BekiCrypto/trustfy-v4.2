# RBAC Matrix

| Role | Permitted Modules | Can Access | Notes |
| --- | --- | --- | --- |
| `USER` | Auth / Escrow Read / Coordination | Read API (`/v1/escrows`, `/v1/escrows/:id`, timeline, participants) + messaging, payment instructions, evidence uploads, dispute creation | Default role assigned at login; on-chain writes remain wallet-signed |
| `ARBITRATOR` | All read + dispute / evidence / coordination | Same as user plus `/v1/disputes`, `/v1/disputes/:id`, `/v1/disputes/:id/recommendation`, `/v1/disputes/:id/resolve`, `/v1/escrows/:escrowId/evidence` | Requires allowlist via admin module and contract `ARBITRATOR_ROLE` |
| `ADMIN` | Full scope | All endpoints including `/v1/admin/*`, `/v1/notifications`, `/v1/indexer/status`, role/token management, withdrawal records | Back-office oversight, audit logs every action |
| `Moderator` (optional) | Coordination / Escrow Read | Reads, messaging moderation hooks | Not currently implemented but reserved for future content review tooling |

Audit logs capture actor address + action identifier whenever arbitrator/admin endpoints mutate state (`auth:login/logout`, `dispute:*`, `admin:*`, etc.), so compliance can trace privileged activity.
