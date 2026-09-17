# Menach

A multilingual digital heritage catalog. Visitors browse **items** grouped into **collections**, each with attached media (images, scans, recordings) stored in S3-compatible object storage and, where available, a map location. Authenticated **producers** can create items/collections, upload media, and send an item's media into long-term digital preservation via **Archivematica**.

## Tech stack

- **Runtime**: [Bun](https://bun.sh) (used for the dev/build/start scripts, and for its native `S3Client`)
- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **UI**: React 19, Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) primitives (`src/components/ui`), `next-themes` for light/dark mode
- **i18n**: [next-intl](https://next-intl.dev), locales `en`, `fr`, `ar`, `de` (default: `de`)
- **Database & Auth**: [Supabase](https://supabase.com) (Postgres + Auth), accessed via `@supabase/ssr` / `@supabase/supabase-js`
- **Object storage**: S3-compatible storage (a [Garage](https://garagehq.deuxfleurs.fr/) cluster in production) accessed through Bun's built-in `S3Client`, using presigned URLs for reads
- **Digital preservation**: [Archivematica](https://www.archivematica.org/) REST API, driven by a standalone background worker
- **Maps**: Leaflet / react-leaflet
- **Search**: [Fuse.js](https://www.fusejs.io/) fuzzy search over items/collections

## Project structure

```
src/
├─ app/
│  ├─ [lang]/                      # all UI routes, nested under the locale segment
│  │  ├─ page.tsx                  # home: grid of items
│  │  ├─ search/page.tsx           # fuzzy search over items + collections
│  │  ├─ collections/              # collection list + detail
│  │  ├─ [id]/                     # item detail page
│  │  │  └─ upload/                # producer-only: attach media to an item
│  │  ├─ new-item/, new-collection/# producer-only: create items/collections
│  │  └─ auth/login/               # producer sign-in
│  └─ api/archivematica/transfers/[id]/route.ts  # transfer status polling endpoint
├─ components/                     # feature components + shadcn/ui primitives (components/ui)
├─ lib/                            # domain types, Supabase client factories, auth data-access layer
├─ i18n/                           # next-intl routing/navigation config
├─ messages/                       # translation catalogs (en.json, fr.json, ar.json, de.json)
├─ utils/
│  ├─ supabase.ts                  # generic query helpers (getEntries, getById, insertRow)
│  ├─ s3.ts                        # media bucket: presigned GET URLs, uploads
│  └─ archive/                     # Archivematica integration
│     ├─ actions.ts                # server action to queue a transfer
│     ├─ package.ts, metadata.ts   # builds the zip transfer package + metadata for an item
│     ├─ transfer.ts               # transfer state in Supabase + archive-bucket S3 client
│     ├─ client.ts                 # Archivematica Dashboard API wrapper
│     └─ worker.ts                 # standalone polling loop (packages, uploads, tracks transfers)
└─ proxy.ts                        # locale routing + auth-gates producer-only routes
```

### Data model (Supabase/Postgres)

The schema isn't managed via local migrations in this repo — it lives directly in the Supabase project. The app expects these tables (see [`src/lib/types.ts`](src/lib/types.ts) and [`src/utils/archive/types.ts`](src/utils/archive/types.ts)):

| Table                           | Purpose                                                                                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`                         | Catalog entries (`title`, `description`, `date`, `collection`, `location` as a PostGIS `geography(Point,4326)`, `latitude`/`longitude`)                                 |
| `collections`                   | Groupings of items (`title`, `institution`, `city`, `country`)                                                                                                          |
| `media`                         | Uploaded files (`storage_key`, `title`, `media_type`, ...)                                                                                                              |
| `assets`                        | Join table linking `items` to `media`                                                                                                                                   |
| `archivematica_transfers`       | State machine for archival transfers (`queued` → `packaging` → `uploading` → `starting` → `transfer_processing` → `ingest_processing` → `complete`/`failed`/`rejected`) |
| `archivematica_transfer_events` | Append-only event log per transfer                                                                                                                                      |

Producer accounts are plain Supabase Auth users (email/password) — there's no self-service sign-up flow, so accounts must be created directly in the Supabase dashboard. Any authenticated user is treated as a "producer" and can create content and trigger archival transfers.

## Running locally

### Prerequisites

- [Bun](https://bun.sh) 1.x
- A Supabase project with the tables above (and the PostGIS extension enabled for `items.location`)
- An S3-compatible bucket for media (Garage, MinIO, AWS S3, ...)
- Optional, only needed to exercise the archival flow: a second S3-compatible bucket for transfer packages, and an Archivematica instance with dashboard API access

### Setup

1. Install dependencies:

    ```bash
    bun install
    ```

2. Create a `.env.local` file in the project root with:

    ```bash
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
    SUPABASE_SERVICE_ROLE_KEY=

    # Primary S3 bucket (item/media storage)
    S3_ENDPOINT=
    S3_ACCESS_KEY_ID=
    S3_SECRET_ACCESS_KEY=
    S3_BUCKET=
    S3_REGION=

    # Archive S3 bucket (Archivematica transfer source) — only needed for the worker
    ARCHIVE_S3_ENDPOINT=
    ARCHIVE_S3_ACCESS_KEY_ID=
    ARCHIVE_S3_SECRET_ACCESS_KEY=
    ARCHIVE_S3_BUCKET=
    ARCHIVE_S3_REGION=
    ARCHIVE_S3_PREFIX=

    # Archivematica dashboard — only needed for the worker
    ARCHIVEMATICA_DASHBOARD_URL=
    ARCHIVEMATICA_DASHBOARD_API_USER=
    ARCHIVEMATICA_DASHBOARD_API_PASS=
    ARCHIVEMATICA_TRANSFER_SOURCE_LOCATION_UUID=
    ```

3. Start the dev server:

    ```bash
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) — it redirects to the default locale (`/de`).

4. (Optional) To exercise archival transfers, run the worker in a separate terminal. It polls Supabase for queued/active transfers, packages an item's media into a zip, uploads it to the archive bucket, and drives it through Archivematica:

    ```bash
    bun run worker
    ```

### Other scripts

```bash
bun run build   # production build
bun run start   # run the production build
bun run lint    # eslint
```

## Deployment

The two processes are deployed separately:

- The Next.js app is deployed to **Vercel** ([`vercel.json`](vercel.json) pins the Bun version).
- The archival `worker` runs as a long-lived process on a **Nixpacks**-based host (e.g. Railway) — [`nixpacks.toml`](nixpacks.toml) installs dependencies with Bun and starts `bun run worker` directly, since it's a polling loop rather than a request-driven server.

## Internationalization

Locales live under `src/app/[lang]`, with translation strings in `src/messages/*.json` (`en`, `fr`, `ar`, `de`). `src/proxy.ts` handles locale detection/redirects (via `next-intl`'s middleware) and also blocks unauthenticated access to producer-only routes (`new-item`, `new-collection`, `/[id]/upload`), redirecting to `/[locale]/auth/login`.
