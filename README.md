# PackDB

PackDB is a browser-first equipment planner for hikers, travelers, and anyone who wants to know **what they own, what they packed, and what it weighs** before leaving home. It pairs a reusable inventory with trip-specific packing lists and keeps weight pressure visible without turning preparation into a spreadsheet.

## Product language

The interface uses a small, consistent vocabulary:

- **Gear Vault** — the durable catalog of every item you own or might pack. An item lives here once and can be reused across many trips.
- **Loadout** — the active, trip-specific collection of packed items. Adding gear to a Loadout does not remove it from the Gear Vault.
- **Carry Capacity** — the target maximum packed weight for a Loadout. It is a planning limit, not a claim about medical or physical ability.
- **Encumbered** — the Loadout state shown when packed weight exceeds Carry Capacity. It is resolved by removing weight or increasing the selected capacity.

## Initial feature scope

This first slice establishes the responsive application shell and demonstrates the core workflow with representative seed gear. It includes:

- browsing and filtering a seeded Gear Vault;
- selecting an item to view its details in the Inspector;
- seeing an active Loadout, packed-weight progress, and Encumbered state;
- adding available gear to and removing gear from the Loadout; and
- a three-region desktop layout that becomes a focused, touch-friendly single-column flow on smaller screens.

The validated local-first slice now includes persistence, multiple saved Loadouts,
item editing, quantities, and JSON import/export.

### Deliberately deferred

Accounts, cloud synchronization, collaborative lists, retailer integrations, and
shared public loadouts remain out of scope until the local-first workflow has
been validated against the release criteria below. These features must not be
introduced as release blockers or quietly coupled to local storage.

## Local development

PackDB requires Node.js 22 or newer and npm 10 or newer. CI uses the committed
lockfile with `npm ci`, so dependency installation is deterministic.

```bash
npm install          # install dependencies
npm run dev          # start Vite's development server
npm run build        # type-check and create a production build
npm run preview      # serve the production build locally
npm run lint         # run ESLint
npm run format       # format source files with Prettier
npm run format:check # verify formatting without changing files
npm test             # run the Vitest suite once
npm run test:watch   # run tests interactively
npm run test:e2e     # run Playwright in four responsive viewport projects
npm run check        # run every automated release check
```

Install Playwright's Chromium binary once after installing dependencies:

```bash
npx playwright install chromium
```

## Production and deployment

`npm run build` type-checks the application and emits the static site to
`dist/`. `npm run preview` serves that exact artifact for local smoke testing.
Assets use relative paths, so the artifact can be hosted at either a domain root
or a project subpath. `netlify.toml` supplies a Netlify build and SPA fallback.
The GitHub Actions workflow runs release checks for pull requests and deploys
successful `main` builds to GitHub Pages. Enable **GitHub Actions** as the Pages
source in repository settings before the first release.

## Release criteria

A release candidate is ready only when all of the following are true:

- `npm run format:check`, `npm run lint`, `npm test`, and `npm run build` pass.
- `npm run test:e2e` passes for the phone (390×844), tablet (768×1024), laptop
  (1366×768), and wide-desktop (1920×1080) projects with no horizontal overflow.
- The end-to-end local-first journey passes: create gear, create a trip, exceed
  capacity, adjust its loadout, export the JSON, clear local state, and restore it.
- Persistence reload, merge/overwrite import, malformed JSON, import and image
  size limits, supported image types, safe external links, and storage-quota
  failure paths have automated coverage.
- The built `dist/` artifact is smoke-tested through `npm run preview`; a direct
  route refresh and asset loading work on the intended static host.
- No deferred network/account capability is required for the core workflow.

### Manual accessibility checklist

- Complete item creation, editing, filtering, trip creation, loadout adjustment,
  export, and import using only Tab, Shift+Tab, Enter, Space, and Escape.
- Confirm focus is visible, enters a dialog at its first field, cannot escape the
  open modal, returns to the trigger after close, and follows removal/add actions.
- With VoiceOver, NVDA, or another screen reader, confirm controls have useful
  names and additions, removals, saves, errors, and capacity changes are announced.
- At 200% and 400% zoom, confirm content reflows without two-dimensional scrolling
  and remains operable at a 320 px CSS viewport.
- Enable the operating system's reduced-motion preference and confirm transitions
  and animations are removed without hiding state changes.
- Check keyboard focus, text, status, error, and disabled-control contrast in both
  ordinary and high-contrast/forced-colors modes.

## Browser and responsive support

PackDB targets the latest two stable releases of Chrome, Edge, Firefox, and Safari. JavaScript, CSS Grid, custom properties, and `localStorage` are expected platform capabilities; Internet Explorer is not supported.

Responsive behavior is a baseline requirement for every feature—not a follow-up enhancement. New work must remain usable from a 320 px mobile viewport through wide desktop displays, preserve keyboard access and visible focus states, avoid horizontal page scrolling, and keep primary actions comfortably touchable.

## Project structure

```text
src/
├── components/          # shared interface building blocks
├── features/
│   ├── inventory/       # Gear Vault domain and UI
│   └── loadouts/        # Loadout domain and UI
├── lib/                 # framework-independent helpers
├── styles/              # global and feature styles
└── types/               # shared TypeScript models
```
