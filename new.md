Goal:
Create a professional, production-ready, stylish UI notification system for a React + TypeScript app using Mantine. The system must provide:

1. A **full-screen loading overlay** used for:
   - all page navigations (react-router),
   - signup / login / logout flows,
   - general state-changing async actions (API calls).
   - It must support a small UX debounce (e.g., 200-300ms) to prevent flicker for very fast operations.

2. A **realtime percentage progress overlay** (full-screen translucent card centered) supporting:
   - start/update/complete API so backend operations or uploads can push percent updates,
   - smooth animated progress bar and numeric percent,
   - optional indeterminate mode if percent unknown.

3. **Snackbars (toasts)** for success/warn/error/info:
   - 7 second auto-close for all by default (configurable),
   - stacked top-right, max 4 visible, newest on top,
   - variant styling (success = teal, warning = orange, error = red, info = blue),
   - includes optional action buttons (e.g., Undo) and accessible labels,
   - dedupe identical messages within a short window to avoid spam.

4. Clean developer API (TypeScript) with these top-level calls:
   - `notify.success(message: string, opts?: NotifyOptions)`
   - `notify.warn(...)`
   - `notify.error(...)`
   - `notify.info(...)`
   - `loader.show(preset?: {message?})`
   - `loader.hide()`
   - `progress.start(total?: number)` -> returns a `progressId`
   - `progress.update(progressId, percent: number)` 
   - `progress.complete(progressId, success?: boolean)`
   - All APIs return Promises when appropriate so caller can `await` if needed.

5. Integrations:
   - **Axios interceptor** that automatically shows loader for requests > debounce and hides on response/error. Also hook request upload/download progress to progress API.
   - **React-Router** integration: automatic show loader on navigation start, hide on complete. Should integrate with v6 react-router patterns; fallback instructions for projects using `react-router-dom` v6+.
   - **Auth actions**: show loader and appropriate toast on signup/login/logout. Provide an example wrapper `withAuthAction(action)` that handles loader and notification.
   - Example of how to emit realtime progress from server (e.g., websockets or SSE) and feed into `progress.update`.

6. Accessibility & polished UX:
   - Loader overlay uses `role="status"` and `aria-live="polite"` for announcements, focus trap while overlay visible, and escape-to-cancel option if appropriate.
   - Toasts use `aria-live="polite"` and are keyboard accessible.
   - Provide dark and light friendly styling and subtle entrance/exit animations (scale + opacity).
   - Debounce loaders to only show when an operation exceeds 200–300ms. If operation ends before debounce, nothing appears.
   - Avoid blocking the UI forever: provide timeout fallback (e.g., auto-hide loader after configurable X seconds and emit an error notification).

7. Packaging & testability:
   - Create modular files so consumer can import only the provider and `notify`, `loader`, `progress` APIs.
   - Provide types for all public APIs, and JSDoc comments.
   - Include minimal unit test descriptions (what to test) for core functions.

Files to produce (full TSX/TS files, ready to drop into a React + Vite/Create React App project):
- `src/ui/notifications/NotificationProvider.tsx`
  - Wraps MantineProvider + NotificationsProvider
  - Exports `<UIRootProviders>{children}</UIRootProviders>` (for app root)
  - Exposes `initNotifications(options?)` internal config

- `src/ui/notifications/notify.ts`
  - Exports `notify` object with `success/warn/error/info/custom` methods matching the API above.
  - Internally uses `showNotification` from `@mantine/notifications` and `@tabler/icons-react`.
  - Ensures dedupe and 7s auto-close default.

- `src/ui/loading/FullScreenLoader.tsx`
  - React component that renders an animated full-screen overlay with a centered card and spinner + optional message.
  - Uses Mantine `Loader` and elegantly styled text.
  - Should support `visible`, `message`, and optional `onCancel` props.

- `src/ui/loading/loaderContext.tsx`
  - A React context + hook (`useLoader`) that provides `show` / `hide` and manages debounce + stacking (multiple concurrent calls should not hide overlay until all complete).
  - Expose a simple global `loader` object that other non-React modules can import (bridge between imperative code and context).

- `src/ui/progress/ProgressOverlay.tsx`
  - Component rendering a translucent overlay with a card showing percent and a progress bar.
  - Supports multiple simultaneous progress sessions using `progressId`.
  - Expose `useProgress()` hook and a global `progress` object with `start/update/complete`.

- `src/lib/api.ts` (axios wrapper)
  - Axios instance with interceptors:
    - On request: start loader after debounce; if `onUploadProgress`/`onDownloadProgress`, map to `progress` API.
    - On response/error: hide loader, show toast on network error (configurable).
  - Export `api` axios instance for app usage.

- `src/ui/integrations/routerLoader.tsx`
  - Utility to integrate with react-router:
    - Example for v6+: `<RouterLoader />` placed inside your Router tree; listens to navigation changes, shows loader on navigation start and hides after render/settled.
    - Provide fallback instructions if app uses Suspense or server-side rendering.

- `src/components/DemoNotifications.tsx`
  - A demo page with buttons to demonstrate: loader, progress simulation (start -> interval -> complete), success/warn/error toasts, and an Undo action on a toast.

- `src/ui/index.ts`
  - Barrel exports: `UIRootProviders`, `notify`, `loader`, `progress`, `api`.

Other requirements for the assistant:
- Write all code in TypeScript with strict types.
- Use Mantine for UI bits and `@tabler/icons-react` for icons.
- Keep styling minimal but modern and "beautiful" (soft shadows, rounded corners, subtle gradients). Use Mantine theming tokens.
- Include comments explaining key logic (debounce, stacking, dedupe).
- Provide example usage in `src/main.tsx` or `src/index.tsx` showing how to wrap the app with `UIRootProviders` and where to put `RouterLoader`.
- Add a short README snippet describing how to use the APIs.
- Provide simple unit test suggestions (not full tests): e.g., "test that loader show/hide respects debounce and stacking", "test that notify dedupes identical messages".

Output format required:
1. A short summary of what was created.
2. Full file contents for each file listed above (copy/paste ready).
3. One-file patch in `git apply` format (optional — provide if possible).
4. A short "How to integrate" checklist: install commands, where to add provider in `index.tsx`, and how to replace current direct `react-toastify` usage with `notify`.

Make the output concise but complete and production-ready. Keep code idiomatic, well-structured and easy to maintain.
