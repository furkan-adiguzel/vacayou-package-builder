# Vacayou Package Builder

A small full-stack admin tool for creating curated vacation packages as drafts and publishing them through a rule-driven workflow.

The repository contains two independent applications:

- `backend/` — Laravel 12 REST API with SQLite
- `frontend/` — React 19, TypeScript, Vite, MUI, TanStack Query, and Zod

## Product flow

Operators create an empty server-backed draft, then move through four guarded steps:

1. **Property** — choose exactly one property, with server-side name/location search.
2. **Inclusions** — add at least one spa, activity, dining, or transfer item.
3. **Details** — provide a valid title, price, and future travel range; description is optional.
4. **Review & publish** — review the complete package, save it as a draft, or publish it permanently.

Drafts can be incomplete, explicitly saved from any step, reopened from the package list, and resumed at their last saved step. Published packages are final and only have a read-only view.

## Prerequisites

- PHP 8.2+ with `pdo_sqlite`
- Composer 2
- Node.js 22.22+
- npm 8+

## Setup and run

Clone the repository, then start the API:

```bash
cd backend
composer install
composer setup
php artisan serve
```

`composer setup` copies `.env.example`, generates the app key, creates the SQLite file, runs all migrations, and loads the exact assignment seed data. The API runs at `http://127.0.0.1:8000`.

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` requests to Laravel on port `8000`.

To reset the app to a clean state later:

```bash
cd backend
composer reset-demo
```

This removes all created packages and reloads the six properties and twelve inclusions.

## Tests and quality checks

Backend feature tests exercise draft permissiveness, referential integrity, property search, aggregate publish errors, valid publishing, repeat-publish conflicts, and published-package immutability.

```bash
cd backend
composer test
vendor/bin/pint --test app routes tests database
```

Frontend tests target the highest-value pure behavior: wizard step gating and date/business-rule boundaries.

```bash
cd frontend
npm test
npm run lint
npm run build
```

## API contract

All endpoints return JSON. Successful resources use Laravel's `{ "data": ... }` envelope.

| Method | Endpoint | Purpose | Success |
| --- | --- | --- | --- |
| `GET` | `/api/properties?search=bodrum` | List/search properties by name or location | `200` |
| `GET` | `/api/inclusions` | List inclusions with categories | `200` |
| `GET` | `/api/packages` | List drafts and published packages | `200` |
| `POST` | `/api/packages` | Create a partial or empty draft | `201` |
| `GET` | `/api/packages/{id}` | Retrieve a package with its selections | `200` |
| `PATCH` | `/api/packages/{id}` | Partially update a draft | `200` |
| `POST` | `/api/packages/{id}/publish` | Validate and permanently publish a draft | `200` |

Draft updates accept only these fields: `property_id`, `inclusion_ids`, `title`, `description`, `price`, `travel_start_date`, `travel_end_date`, and `current_step`. Status and `published_at` cannot be set through the draft endpoint.

A failed publish returns all discovered problems in one response:

```json
{
  "message": "Package cannot be published.",
  "errors": {
    "property_id": ["A property must be selected."],
    "inclusion_ids": ["At least one inclusion is required."],
    "title": ["A package title is required."],
    "price": ["A package price is required."],
    "travel_start_date": ["A travel start date is required."],
    "travel_end_date": ["A travel end date is required."]
  }
}
```

Invalid input uses `422 Unprocessable Entity`. Editing or republishing an already published resource uses `409 Conflict`, because the requested transition conflicts with the resource's final state rather than with a permission rule.

## Architecture decisions

### Persistence validity is separate from publishability

Draft writes intentionally validate only shape and referential integrity. A short title, negative price, past date, or otherwise incomplete package can be saved. This preserves work-in-progress exactly as the brief requires.

Publishability is evaluated separately in two places:

- pure client-side functions gate wizard progression and provide immediate feedback;
- `PublishPackage` authoritatively evaluates every business rule on the server.

The server remains the source of truth. Client checks improve the experience but never weaken the publish contract.

### Publishing is an explicit state transition

Publishing is a dedicated action endpoint instead of a general status update. The Laravel action locks and reloads the aggregate inside a transaction, validates the property/inclusion relationships plus commercial fields, and changes `status` and `published_at` together. The draft update request rejects a published package before payload validation, so immutability wins consistently.

### One server-backed draft per wizard URL

Clicking **New package** immediately creates an empty draft and routes to `/packages/{id}/edit`. The URL is refresh-safe, reopening is simple, and there is no local-only package identity to reconcile later. `current_step` records where the operator last saved or continued.

### Local editing state, query-managed server state

TanStack Query owns fetched/cached server data. The wizard owns one local working copy and an explicit dirty flag. This makes changes, save boundaries, and the unsaved-navigation warning visible without introducing a global state store. Step validation is implemented as pure functions so gating is deterministic and cheap to test.

### Responses favor a small, cohesive client contract

The package resource includes its selected property and inclusions. That slightly enlarges list responses but avoids follow-up requests and keeps this intentionally small dataset simple. A production catalogue would likely add pagination, sparse list resources, and query filters.

## Assumptions and trade-offs

- The brief does not define currency. Package and seed prices are displayed as USD consistently; production data would carry an ISO currency code.
- Saves are explicit rather than debounced autosaves. This keeps incomplete draft persistence predictable and gives the unsaved-changes warning a clear meaning.
- Reference data is seeded and treated as read-only, as requested.
- Authentication, deployment, image upload, i18n, and pixel-perfect mobile design are intentionally out of scope.
- Accessibility uses semantic controls, labels, focusable step navigation, and MUI defaults; a formal audit was outside the timebox.

## AI usage

I used OpenAI Codex as a pair-programming aid for scaffolding, test-case brainstorming, visual review, and checking API/UI design decisions. I reviewed and adjusted the resulting code and made the final architectural and trade-off decisions.

## What I would do with more time

- Add Playwright end-to-end coverage for the full save/reopen/publish journey.
- Add authentication, authorization, audit history, and named operators.
- Add optimistic concurrency/version checks so two open editor sessions cannot silently overwrite a draft.
- Introduce pagination and a lighter package-list resource as catalogue size grows.
- Model currencies and operator time zones explicitly, then test date boundaries around those zones.
- Add production observability and a deployment pipeline.
