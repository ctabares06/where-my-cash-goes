# Copilot Instructions for AI Agents

## Project Overview

- This is a [NestJS](https://nestjs.com/) TypeScript backend for managing personal finance ("Where My Cash Went").
- The codebase is organized by domain modules (e.g., `categories`, `user`, `database`) under `src/`.
- Data access is handled via Prisma ORM (see `prisma/schema.prisma` and generated client in `src/lib/ormClient/`).
- Authentication is managed through better-auth library.
- use Context7 to search any documentation when needed.

## Key Architectural Patterns

- **Modules:** Each domain (e.g., `categories`, `user`) is a NestJS module with its own controller, service, DTOs, and tests.
- **Database:** Prisma schema defines models on `prisma/schema.prisma`. Migrations are tracked in `prisma/migrations/`.
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
- **Rules:**
  - Follow NestJS best practices.
  - Use async/await for asynchronous operations.
  - Ensure proper error handling with NestJS exceptions.
  - Maintain consistent code style (use Prettier and ESLint configurations provided).
  - handle errors on controller level and return appropriate HTTP status codes.
  - return 404 for not found resources for `GET` single resources.
  - return 200 and an empty array for `GET` collection resources when no data is found.
  - when creating new modules
    - create a folder under `src/` with the module name
    - include controller, service, dto, and test files for service and controller independently
    - register the module in `app.module.ts`

## Testing

- **Unit tests** are written using Jest and are located alongside the modules they test.
- **E2E tests** are located in `test/` and use Supertest for HTTP assertions.
- **Rules:**
  - Always look for the typescript types when writing tests
  - avoid using `any` type in tests
  - Ensure tests cover both success and failure cases
  - test behavior and not implementation
  - maintain test isolation
  - use jest spy functions over mock functions.

  ```ts
  const spy = jest.spyOn(service, 'methodName');
  expect(spy).toHaveBeenCalledWith(args);
  ```

  - Follow recommended rules from NestJS testing documentation.
  - Use descriptive test names.
  - do not test third-party libraries.
  - use `createMockContext` from `test/prisma.mock.ts` for mocking Prisma client in tests.
  - priotize spying over mocking.
  - mock external services only when necessary.

## Integration Points

- **Database:** PostgreSQL via Prisma (see `prisma/schema.prisma`).
- **Environment:** Configured via `.env`.
- **Docker:** See `docker-compose.yml` for service orchestration (e.g., database).

## Examples

- To add a new resource, create a new module in `src/`, define its controller, service, DTO, and update `app.module.ts`.
- To add a new model, update `prisma/schema.prisma`, run a migration, and update the corresponding service.

Refer to `README.md` for more details on commands and setup.
