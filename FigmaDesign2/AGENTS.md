# Mangiaria - Figma Make WebApp

## ⚠️ Gotchas & Landmines
- **Figma Webview Limitations**: DO NOT use native browser popups like `confirm()`, `alert()`, or `prompt()`. They are blocked by the Figma/Cursor webview and will silently fail, breaking execution. Always build custom UI modals (e.g., `Sheet` or inline overlays) for user confirmations.
- **Quotes in Strings**: Use double quotes for strings containing apostrophes (e.g., `"We're here"`). Unescaped apostrophes in single-quoted strings break the Vite build.

## 🎨 Design Rules
- **Tailwind CSS v4**: Utility classes are used directly in JSX. Global CSS and `@font-face` rules go in `src/index.css`.
- **CSS Imports**: Keep CSS `@import` statements strictly at the top of `src/index.css`.
- **Components**: Always export components as `default exports`.
- **No Emojis in UI**: Emojis are STRICTLY BANNED as a substitute for proper UI icons. Only use high-quality SVG/component icons (e.g. lucide-react) for a premium look. When you need high-level icons or design modifications, you MUST invoke the `design-orchestrator` skill.

## 🤖 Custom Agent Rules
- **Continuous Auto-Push**: Automatically run `git commit` and `git push` after EVERY user-confirmed code modification.
- **Skill Integrator**: Run `skill-integrator` to register automations when a new skill is installed.
- **Design Orchestrator**: Run `design-orchestrator` (which chains `frontend-design`, `theme-factory`, etc.) for high-level UI/aesthetic requests.
- **Theme Factory**: Invoke `theme-factory` when creating/modifying components to ensure palette & typography consistency.

## 👁️ Visual Verification Protocol (Mandatory)

At the end of **every** modification that impacts the UI, frontend, or a visible logic flow, you MUST strictly follow these steps before considering the task complete:

1. **No Code Assumptions:** Do not assume the implementation is correct just because there are no terminal errors.
2. **Use Computer Control:** Open the web browser pointing to the local test environment (e.g., http://localhost:8443).
3. **Manual Interaction:** Use mouse and keyboard control to interact with the newly modified element (click buttons, fill forms, open dropdowns).
4. **Visual Analysis:** Use your screen vision to confirm the layout is intact, colors are correct, and the element responds visually to clicks.
5. **Report:** Write the outcome of the visual inspection in the chat (e.g., "I looked at the screen, clicked button X, and the modal opened correctly"). If you spot visual defects, fix them autonomously before notifying me.
