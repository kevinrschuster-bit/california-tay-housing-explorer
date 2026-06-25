# California TAY Housing Finance Explorer

A deployable Next.js prototype for exploring public funding, subsidy, service, partner, and philanthropic options for transition-aged youth housing projects in Los Angeles County. The app uses static local CSV/JSON data only; there is no backend, login, database, or required environment configuration.

## What it does

- Captures a hypothetical project profile.
- Reads static local program data from `src/data/programs.json`.
- Scores each program with transparent rule-based matching logic.
- Displays an executive strategy summary, illustrative capital stack/pro forma estimate, recommended capital sources, rental subsidies, operating/service funding, public partners, philanthropic gaps, timeline considerations, and key risks.
- Uses Tailwind CSS for a lightweight strategy-dashboard interface.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
pnpm lint
pnpm build
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Use the default Next.js settings. Vercel will detect `pnpm-lock.yaml`.
4. Deploy.

No database, login, or environment variables are required.

## Updating the data

The app uses static JSON generated from a CSV.

To replace the dataset:

1. Replace `src/data/programs.csv` with a new CSV using the same or similar column names.
2. Run:

```bash
pnpm data:update
```

The converter writes `src/data/programs.json`. Missing fields are handled gracefully in the UI and scoring logic.

## Editing the matching rules

The scoring logic lives in `src/lib/matching.ts`.

Useful places to edit:

- `PROJECT_TERMS`, `MODEL_TERMS`, `POPULATION_TERMS`, and `AFFORDABILITY_TERMS` for keyword matching.
- `scoreProgram()` for scoring weights and special rules.
- `buildStarterSummary()`, `timelineConsiderations()`, and `keyRisks()` for the plain-English guidance.

The current special rules boost former foster youth resources, youth homelessness pathways, PSH supports, construction/rehab capital sources, acquisition/adaptive reuse sources, and high-intensity service funding.

## Editing the illustrative capital stack

The capital stack and annual subsidy assumptions live in `src/lib/capitalStack.ts`.

Current assumptions include:

- New construction: `$600,000` per unit
- Acquisition/rehabilitation: `$350,000` per unit
- Adaptive reuse: `$400,000` per unit
- Transitional housing: `$300,000` per unit
- Master lease and scattered-site models show annual operating/rental subsidy estimates instead of development cost
- Service funding estimates vary by housing model and service intensity
