# Contributing to ProjectFlow

Thanks for helping improve ProjectFlow. Keep changes focused, preserve tenant isolation, and document any user-visible or database behavior changes.

## Development setup

1. Follow the local setup instructions in [`README.md`](./README.md).
2. Use a dedicated, non-production Supabase project for testing migrations and RLS.
3. Never commit `.env.local`, service credentials, or real user data.

## Before opening a pull request

Run the relevant checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

For browser-facing changes, also run `npm run test:e2e`. For schema or access-control changes, verify both allowed and denied access using separate users in separate workspaces.

## Pull request checklist

- Explain the behavior change and any external setup requirements.
- Add focused tests for new behavior.
- Include a migration for database changes and keep RLS policies aligned with server-side permission checks.
- Ensure all loading, error, empty, and responsive states are handled.
- Do not add fake production metrics, customer claims, or API responses.
- Update the README when setup, environment, architecture, or deployment steps change.
- Do not include secrets or generated build artifacts.

## Code style

- Use TypeScript strict mode and existing Next.js App Router patterns.
- Prefer Server Components and server-side Supabase queries where possible.
- Validate user-provided data at server-action boundaries.
- Keep error messages actionable without exposing database internals.
- Use semantic HTML and keyboard-accessible controls.
