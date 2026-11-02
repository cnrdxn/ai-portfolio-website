# Connor Dixon | AI Portfolio

Connor Dixon’s portfolio of AI systems, production data science, and software engineering work. Built with React, TypeScript, and Vite, with a dark theme and cyan accents.

## Features

- Interactive 3D capability orb with continuous rotation, drag controls, and experience details.
- Four project case studies with architecture diagrams and outcomes.
- Experience, background, and contact sections with sticky navigation.
- Playable Binary logic puzzle with Easy (6×6), Medium (8×8), and Hard (10×10) modes, undo, reset, and new puzzles.
- Responsive layouts, touch controls, keyboard navigation, and reduced motion support.

## Run locally

Use a current Node.js LTS release and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Changes appear automatically while the development server runs. Port 5173 must be available.

No API keys, environment variables, or backend services are required.

## Build and preview

```sh
npm run build
npm run preview
```

The production build is written to `dist/`. Preview it at http://127.0.0.1:4173. Deploy the contents of `dist/` to a static website host.

## Edit the site

| File | Purpose |
| --- | --- |
| `src/content.ts` | Profile, contact information, experience, and project case studies |
| `src/capabilities.ts` | Orb capability labels, descriptions, and skills |
| `src/App.tsx` | Page sections, navigation, and project detail dialogs |
| `src/styles.css` | Theme, typography, layout, and responsive styles |
| `src/components/AnimatedNeurons.tsx` | Orb animation and pointer interactions |
| `src/components/Diagrams.tsx` | Diagram composition and capability selection |
| `src/components/ResumeProjectDiagram.tsx` | Project architecture illustrations |
| `src/components/HouseButlerDiagram.tsx` | House Butler architecture illustration |
| `src/components/BinaryGame.tsx` | Puzzle interface and player interactions |
| `src/games/binary.ts` | Puzzle generation and rule validation |
| `public/connor-mark.svg` | Browser tab icon |
| `index.html` | Browser title and page metadata |

## Tests

Start the development server in one terminal:

```sh
npm run dev
```

Run the browser tests in another:

```sh
npm test
```

On macOS, tests use installed Google Chrome. On other platforms, install the Playwright Chromium browser before the first run:

```sh
npx playwright install chromium
```

To use Playwright Chromium on macOS:

```sh
npx playwright install chromium
PLAYWRIGHT_CHANNEL=chromium npm test
```

The test suite covers navigation, project dialogs, orb interactions, responsive layouts, puzzle rules, keyboard controls, and touch input at phone widths.
