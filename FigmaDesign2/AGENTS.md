# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.


## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.

## Custom Agent Rules

- **CRITICAL RULE**: Every time the user accepts or confirms a code modification, you MUST automatically commit and push the changes to Git (Continuous Auto-Push Mode).
- **skill-integrator**: Whenever a new skill is created or installed, you must invoke the skill-integrator skill to analyze and register its automations in AGENTS.md.
- **theme-factory**: Whenever you create or modify UI components, consider invoking the theme-factory skill to ensure color palette and typography consistency.
