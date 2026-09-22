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

Persistence, authentication, multiple saved Loadouts, item editing, quantities, import/export, and cloud sync are intentionally outside the initial scope.

## Local development

PackDB requires Node.js 20 or newer and npm 10 or newer.

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
```

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
