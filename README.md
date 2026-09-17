# StackLogger JavaScript SDK

TypeScript-first packages for structured logs and exception telemetry: `@stacklogger/core`, `@stacklogger/react`, and `@stacklogger/node`.

```ts
import {StackLogger} from "@stacklogger/node";
StackLogger.init({apiKey: process.env.STACKLOGGER_API_KEY!, environment:"production"});
StackLogger.info("Application started");
StackLogger.captureException(new Error("boom"));
await StackLogger.flush();
```

The core API supports all six levels, `captureMessage`, context (`setUser`, `setTag`, `setTags`, `setContext`), breadcrumbs, synchronous `beforeSend`, sampling, batching, retries, and injectable transports. Sensitive keys, bodies, headers, query strings, and rich user data are opt-in; values are bounded and safely serialized. The default endpoint and authentication header are isolated in the core transport.

React additionally exports `StackLoggerErrorBoundary` and `installBrowserCapture`; Node exports `installNodeCapture`. Browser/Node capture is explicit so applications control lifecycle and uncaught-exception policy.

## Next.js usage

There is not yet a dedicated `@stacklogger/nextjs` package. In a Next.js application, use `@stacklogger/react` for client-side errors and `@stacklogger/node` for server-side errors.

### Install

```bash
pnpm add @stacklogger/react @stacklogger/node
```

Keep the server API key private:

```env
STACKLOGGER_API_KEY=your-api-key
```

Do not use `NEXT_PUBLIC_` for this server key. Create a server initializer such as `lib/stacklogger-server.ts`:

```ts
import { StackLogger } from "@stacklogger/node";

let initialized = false;

export function getServerStackLogger() {
  if (!initialized) {
    StackLogger.init({
      apiKey: process.env.STACKLOGGER_API_KEY!,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_APP_VERSION,
    });

    initialized = true;
  }

  return StackLogger;
}
```

Capture errors in a route handler or server action:

```ts
// app/api/payment/route.ts
import { NextResponse } from "next/server";
import { getServerStackLogger } from "@/lib/stacklogger-server";

export async function POST() {
  const logger = getServerStackLogger();

  try {
    await processPayment();
    logger.info("Payment completed");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.captureException(error, {
      tags: { component: "payment" },
      extra: { route: "/api/payment" },
    });

    await logger.flush();
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
```

For browser-side capture, create a client component and mount it from the root layout:

```tsx
// app/stacklogger-client.tsx
"use client";

import { useEffect } from "react";
import {
  StackLogger,
  installBrowserCapture,
} from "@stacklogger/react";

export function StackLoggerClient() {
  useEffect(() => {
    StackLogger.init({
      // Browser transport requires a browser-visible key in the current SDK.
      apiKey: process.env.NEXT_PUBLIC_STACKLOGGER_API_KEY!,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_APP_VERSION,
      capture: {
        stack: true,
        page: true,
        user: false,
        tags: true,
        contexts: true,
        extra: true,
        breadcrumbs: true,
        request: {
          method: true,
          url: true,
          statusCode: true,
          duration: true,
          queryString: false,
          headers: false,
          body: false,
          responseBody: false,
        },
      },
    });

    return installBrowserCapture();
  }, []);

  return null;
}
```

```tsx
// app/layout.tsx
import { StackLoggerClient } from "./stacklogger-client";

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StackLoggerClient />
        {children}
      </body>
    </html>
  );
}
```

Handle App Router rendering errors with `app/error.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { StackLogger } from "@stacklogger/react";

export default function ErrorPage({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    StackLogger.captureException(error, {
      tags: { component: "next-error-page" },
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <main>
      <h1>Something went wrong</h1>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
```

Set context after the authenticated user is available:

```tsx
"use client";

import { useEffect } from "react";
import { StackLogger } from "@stacklogger/react";

export function UserTelemetry({ user }: {
  user: { id: string; plan: string };
}) {
  useEffect(() => {
    StackLogger.setUser({ id: user.id, plan: user.plan });
    StackLogger.setTag("application", "web");
  }, [user]);

  return null;
}
```

User capture is disabled by default. Enable it explicitly when appropriate:

```ts
capture: { user: true }
```

For long-running Node deployments, flush queued events during graceful shutdown:

```ts
import { getServerStackLogger } from "@/lib/stacklogger-server";

process.on("SIGTERM", async () => {
  await getServerStackLogger().flush();
  process.exit(0);
});
```

The current browser example uses a `NEXT_PUBLIC_` key because browser transport sends directly to the ingestion endpoint. For production applications where the API key must remain secret, route browser events through a server-side proxy or wait for the future Next.js integration package.
