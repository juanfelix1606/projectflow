# ProjectFlow

ProjectFlow is a project and team management application built with Next.js, React, TypeScript, Tailwind CSS, and Supabase. It brings workspaces, projects, tasks, a Kanban board, a calendar, comments, and team activity into one responsive workspace.

> **Project status:** this repository contains a working application foundation and core product flows. Authentication, database-backed workspace data, invitations, and file storage require a Supabase project configured by the operator. Billing, email delivery, AI assistance, and production deployment are not implemented. Do not treat this repository as a deployed service or claim that its RLS policies have been tested against a live Supabase project.

## Features

- **Authentication:** email/password registration and sign-in, email verification callbacks, password recovery, protected application routes, and sign-out using Supabase Auth.
- **Workspaces:** create, rename, delete, switch between workspaces, invite people with expiring single-use links, and manage member roles (owner, admin, member, viewer).
- **Projects:** create, edit, archive, restore, and delete projects; view status, priority, due date, and task-backed completion progress.
- **Tasks:** create and edit tasks; set status, priority, assignee, and due date; search, filter, and sort; add comments, labels, and private attachments.
- **Kanban:** five task statuses, drag-and-drop between columns, optimistic updates, and persistence through Supabase.
- **Overview:** database-backed counts, completion trends, project status distribution, assigned tasks, upcoming deadlines, project progress, and workspace activity.
- **Calendar:** month, week, and day views for task and project deadlines.
- **Collaboration:** workspace members, role controls, invitation links, comments, assignment notices, and activity history.
- **Notifications:** per-user notification history, read/unread state, and mark-all-read.
- **Search:** workspace-scoped project, task, and member search with a keyboard shortcut.
- **Settings:** profile information, avatar upload, appearance, timezone, date format, email-notification preference, and workspace details.
- **Marketing site:** responsive product overview, feature and workflow sections, a clearly labeled illustrative preview, FAQ, and transparent plan availability.
- **Security baseline:** server-side session refresh, server actions with input validation, tenant-aware foreign keys, Row Level Security policies, private task-file storage, and a public avatar bucket restricted to user-owned paths.

The sample dashboard image and its values are illustrative only. Customer testimonials, company logos, usage claims, paid plan prices, and a live deployment are intentionally not fabricated.

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS 4 and accessible custom components |
| Database and auth | Supabase PostgreSQL, Supabase Auth, Supabase Storage, RLS |
| Validation and forms | Zod, React Hook Form |
| Drag and drop | dnd-kit |
| Charts and dates | Recharts, date-fns |
| Notifications and icons | Sonner, Lucide React |
| Unit tests | Vitest, Testing Library |
| Browser tests | Playwright |
| Hosting target | Vercel |

## Screenshots

No product screenshots are checked into this repository yet. The marketing page contains a CSS-rendered, fictional product preview; it is not a screenshot of a populated production workspace. Add verified screenshots here after configuring and running the application with test data.

## Architecture

```text
src/
├── app/
│   ├── actions/                  # Validated server actions
│   ├── app/[workspaceId]/        # Protected workspace views
│   ├── auth/callback/            # Supabase OAuth/email callback
│   ├── invite/                   # Workspace invitation acceptance
│   ├── login/, register/, ...    # Authentication routes
│   ├── globals.css               # Design tokens and theme styles
│   └── page.tsx                  # Marketing landing page
├── components/
│   ├── app/                      # Workspace UI and product modules
│   └── auth/                     # Authentication experience
└── lib/
    ├── supabase/                 # Browser/server clients and session refresh
    └── utils.ts
supabase/
├── migrations/                   # PostgreSQL schema, constraints, triggers, and RLS
└── config.toml
tests/
└── e2e/                          # Playwright browser checks
```

Server Components are used for workspace data reads. Client Components are limited to forms, search, charts, drag-and-drop, and interactive controls. Database access uses the signed-in user session; the application does not require a service-role key.

## Database overview

The migration in [`supabase/migrations/20261113000000_projectflow_schema.sql`](./supabase/migrations/20261113000000_projectflow_schema.sql) creates:

- `profiles` and `user_preferences`
- `workspaces`, `workspace_members`, and `workspace_invitations`
- `projects` and `project_members`
- `tasks`, `task_labels`, `task_label_links`, `task_comments`, and `task_attachments`
- `notifications` and `activity_logs`

Workspaces own projects, tasks, labels, comments, attachments, and activity. Composite foreign keys prevent a task or label from being linked across workspace boundaries. The migration enables RLS, adds policies for each table, keeps at least one workspace owner, validates task assignees against workspace membership, and provisions storage buckets/policies. Project and task triggers write activity records and assignment/comment notifications.

`create_workspace` and `accept_workspace_invitation` are authenticated RPC functions. Invitation tokens are generated with cryptographic randomness, stored only as SHA-256 hashes, restricted to the invited email, and expire after seven days.

## Requirements

- Node.js 22.12 or later (Node 24 is used in CI)
- npm 11 or a compatible npm version
- A Supabase project for authentication and database-backed features
- Supabase CLI only if you prefer CLI-based migration deployment

## Installation and local development

1. Install the project dependencies:

   ```bash
   npm ci
   ```

2. Create a Supabase project. In its SQL Editor, run the migration file in `supabase/migrations/`. Alternatively, install the Supabase CLI, authenticate, link the project, and run:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   These values are available in **Supabase → Project Settings → API**. The anon/publishable key is intended for browser use and is protected by RLS. **Never place a service-role key in a `NEXT_PUBLIC_` variable or expose it to client code.** The current application does not need a service-role key.

4. Configure Supabase Auth:
   - Enable email/password sign-in.
   - Set the local site URL to `http://localhost:3000`.
   - Add `http://localhost:3000/auth/callback` to the allowed redirect URLs.
   - Configure an SMTP provider before relying on verification or recovery emails in production. Supabase's development email behavior is not a production mail service.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000), create an account, and create a workspace. Without Supabase environment variables, public marketing pages still run and authentication/workspace routes display setup instructions instead of fake data.

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes for app data/auth | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes for app data/auth | Supabase public anon/publishable key; RLS is mandatory |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Auth callback and invitation link origin; use the production HTTPS origin in production |

Do not add secrets to `.env.example`, source control, browser bundles, or screenshots. No AI, billing, or transactional-email API keys are currently consumed by the application.

## Testing and quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Run browser tests with:

```bash
npx playwright install chromium
npm run test:e2e
```

The checked-in unit and browser tests cover utility behavior, the public landing page, and the explicit Supabase setup state. They do **not** substitute for live authentication, multi-tenant RLS, Storage, email-delivery, or concurrent Kanban integration tests. Configure a non-production Supabase project before performing those checks.

## Deployment

### Vercel

1. Import this repository into Vercel and select the Next.js framework.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` in the appropriate Vercel environments.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and allow that callback URL in Supabase Auth.
4. Apply the version-controlled migration to the intended Supabase project.
5. Run the CI checks and verify registration, email verification, password reset, membership isolation, invitation acceptance, file uploads, and production callbacks before inviting real users.
6. Confirm retention, backups, SMTP delivery, storage limits, monitoring, privacy terms, and incident response before production use.

The repository includes `vercel.json` and a GitHub Actions workflow. **No production deployment has been performed or verified.** Paid subscriptions and billing are not available.

## Security considerations

- All application data queries use the authenticated Supabase session and table-specific RLS.
- Do not bypass RLS with a service-role client for user-initiated features.
- Invitation acceptance checks the authenticated email, expiry, and one-time state.
- Task assignees must already belong to the same workspace.
- Private attachments are served using short-lived signed URLs and workspace-scoped storage paths; avatars are public by design.
- Review every schema/policy change in a separate non-production Supabase project. The migration has not been run against the project owner&apos;s live Supabase instance as part of this repository setup.
- Add rate limits, email delivery, audit/retention policies, malware scanning for uploads, and operational monitoring before production launch.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow and review checklist.

## Roadmap

- End-to-end tests against a dedicated Supabase test project, including cross-workspace RLS denial cases.
- Transactional email delivery for workspace invitations and improved notification email preferences.
- Server-mediated file/attachment cleanup and additional upload safety controls.
- Realtime collaboration where it improves the workflow.
- Paid-plan billing, only after product limits and pricing are defined.
- Optional AI project assistance through a secure server-side provider integration.
- Production monitoring, backups, and a verified deployment.

## License

This repository is currently unlicensed. See [`LICENSE`](./LICENSE) and select an appropriate license before redistribution.