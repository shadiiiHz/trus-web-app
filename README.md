# TruS

Premium, motion-forward marketing site for **TruS** — a web development studio
that builds high-end React websites with full client ownership.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with HMR        |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

## Project Structure

```
src/
├── components/   UI atoms, layout, and page sections
├── config/       Site content configuration
├── hooks/        Reusable React hooks
├── i18n/         Translation strings
├── motion/       Shared Framer Motion variants
├── styles/       Global styles and design tokens
└── utils/        Helpers
public/           Static assets (video, images, icons)
```

## Notes

- Design tokens live in `src/styles/globals.css` (Tailwind v4 `@theme`).
- Site copy and section content are driven from `src/config/site.config.ts`
  and `src/i18n/`.
