# @stacklogger/react

Capture and ingest errors from React applications with StackLogger.

## 1. Install the package

```bash
npm install @stacklogger/react
```

`react` is a peer dependency, so your application must already have React 18 or 19 installed.

## 2. Initialize StackLogger

Initialize the client once when the browser application starts. Keep the API key in an environment variable that is available to the browser.

```tsx
// src/StackLoggerProvider.tsx
import { useEffect } from "react";
import { StackLogger } from "@stacklogger/react";

export function StackLoggerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    StackLogger.init({
      apiKey: import.meta.env.VITE_STACKLOGGER_API_KEY,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
    });
  }, []);

  return children;
}
```

For another build tool, replace `import.meta.env...` with that tool's client-side environment-variable syntax. Never expose a server-only secret in browser code.

Mount the provider near the root of the application:

```tsx
import { createRoot } from "react-dom/client";
import { StackLoggerProvider } from "./StackLoggerProvider";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StackLoggerProvider>
    <App />
  </StackLoggerProvider>,
);
```

The default transport batches events and sends them to StackLogger. To use a different endpoint or transport, pass the corresponding options to `StackLogger.init`.

## 3. Capture uncaught browser errors

Call `installBrowserCapture` after initialization. It listens for `error` and `unhandledrejection` events and returns a cleanup function.

```tsx
import { useEffect } from "react";
import { StackLogger, installBrowserCapture } from "@stacklogger/react";

export function StackLoggerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    StackLogger.init({
      apiKey: import.meta.env.VITE_STACKLOGGER_API_KEY,
      environment: import.meta.env.MODE,
    });

    return installBrowserCapture();
  }, []);

  return children;
}
```

## 4. Capture errors manually

Use `captureException` for caught errors. Additional tags, context, and extra data are included in the event.

```tsx
import { StackLogger } from "@stacklogger/react";

try {
  await saveProfile(profile);
} catch (error) {
  StackLogger.captureException(error, {
    handled: true,
    tags: { feature: "profile" },
    extra: { operation: "save-profile" },
  });
}
```

You can also report a message with `captureMessage`, or add breadcrumbs with `addBreadcrumb` before an error occurs.

```ts
StackLogger.addBreadcrumb({ category: "checkout", message: "Payment started" });
StackLogger.captureMessage("Payment provider timed out", "error");
```

## 5. Capture render errors with an error boundary

Wrap the part of the component tree that should be protected. The boundary reports the error and component stack, then renders the supplied fallback.

```tsx
import { StackLoggerErrorBoundary } from "@stacklogger/react";

export function App() {
  return (
    <StackLoggerErrorBoundary
      fallback={({ reset }) => (
        <button onClick={reset}>Something went wrong. Try again</button>
      )}
    >
      <Routes />
    </StackLoggerErrorBoundary>
  );
}
```

## 6. Flush before shutdown

Events are queued and batched. Flush explicitly when the application is about to close or after a critical capture.

```ts
await StackLogger.flush();
```

The client sanitizes sensitive keys such as passwords, tokens, authorization headers, and cookies by default. Review the data passed in `extra`, `contexts`, and tags before sending it.
