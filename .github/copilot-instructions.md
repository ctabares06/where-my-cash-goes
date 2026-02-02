# Copilot Instructions for AI Agents

## Project Overview
- This is a [NestJS](https://nestjs.com/) TypeScript backend for managing personal finance ("Where My Cash Goes").
- The codebase is organized by domain modules (e.g., `categories`, `user`, `database`) under `src/`.
- Data access is handled via Prisma ORM (see `prisma/schema.prisma` and generated client in `src/lib/ormClient/`).

## Key Architectural Patterns
- **Modules:** Each domain (e.g., `categories`, `user`) is a NestJS module with its own controller, service, DTOs, and tests.
- **Database:** Prisma schema defines models for `Account`, `Category`, `Cycle`, `Session`, `Transaction`, `User`, and `Verification`. Migrations are tracked in `prisma/migrations/`.
- **Validation:** DTOs and custom pipes (see `object-validation/`) are used for input validation.
- **Configuration:** Environment and constants are managed in `.env` and `src/lib/consts.ts`.

## Developer Workflows
- **Install dependencies:** `pnpm install`
- **Run development server:** `pnpm run start:dev`
- **Run tests:**
  - Unit: `pnpm run test`
  - E2E: `pnpm run test:e2e`
  - Coverage: `pnpm run test:cov`
- **Prisma migrations:**
  - Edit `prisma/schema.prisma`, then run `pnpm prisma migrate dev`
- **Debugging:** Use standard NestJS debugging tools; main entry is `src/main.ts`.

## Project-Specific Conventions
- **DTOs** are defined in `[module].dto.ts` and used for request validation.
- **Services** encapsulate business logic.
- **Controllers** handle HTTP routing only, controllers follow the restful conventions for paths and methods.
- **Tests** are colocated with their modules and use `.spec.ts` suffix.
- **Prisma client** is imported from `src/lib/ormClient/client.ts`.
- **No frontend code is present in this repo.**

## Integration Points
- **Database:** PostgreSQL via Prisma (see `prisma/schema.prisma`).
- **Environment:** Configured via `.env`.
- **Docker:** See `docker-compose.yml` for service orchestration (e.g., database).

## Examples
- To add a new resource, create a new module in `src/`, define its controller, service, DTO, and update `app.module.ts`.
- To add a new model, update `prisma/schema.prisma`, run a migration, and update the corresponding service.

Refer to `README.md` for more details on commands and setup.
