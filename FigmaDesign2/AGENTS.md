# Mangiaria - Figma Make WebApp

## ⚠️ Gotchas & Landmines
- **Figma Webview Limitations**: DO NOT use native browser popups like `confirm()`, `alert()`, or `prompt()`. They are blocked by the Figma/Cursor webview and will silently fail, breaking execution. Always build custom UI modals (e.g., `Sheet` or inline overlays) for user confirmations.
- **Quotes in Strings**: Use double quotes for strings containing apostrophes (e.g., `"We're here"`). Unescaped apostrophes in single-quoted strings break the Vite build.

## 🎨 Design Rules
- **Tailwind CSS v4**: Utility classes are used directly in JSX. Global CSS and `@font-face` rules go in `src/index.css`.
- **CSS Imports**: Keep CSS `@import` statements strictly at the top of `src/index.css`.
- **Components**: Always export components as `default exports`.

## 🤖 Custom Agent Rules
- **Continuous Auto-Push**: Automatically run `git commit` and `git push` after EVERY user-confirmed code modification.
- **Skill Integrator**: Run `skill-integrator` to register automations when a new skill is installed.
- **Design Orchestrator**: Run `design-orchestrator` (which chains `frontend-design`, `theme-factory`, etc.) for high-level UI/aesthetic requests.
- **Theme Factory**: Invoke `theme-factory` when creating/modifying components to ensure palette & typography consistency.
- **Webapp Testing**: Test frontend modifications using `webapp-testing` before declaring success to ensure the output actually works.
