# @stacklogger/node

Capture and ingest errors from Node.js applications with StackLogger.

## 1. Install the package

```bash
pnpm add @stacklogger/node
```

## 2. Configure the API key

Set the API key in the server environment. Do not commit it to source control.

```bash
export STACKLOGGER_API_KEY=your-api-key
```

## 3. Initialize StackLogger

Initialize the client once during application startup.

```ts
// src/stacklogger.ts
import { StackLogger } from "@stacklogger/node";

StackLogger.init({
  apiKey: process.env.STACKLOGGER_API_KEY!,
  environment: process.env.NODE_ENV ?? "development",
  release: process.env.APP_VERSION,
});

export { StackLogger };
```

The default transport batches events and sends them to StackLogger. You can provide an `endpoint`, custom batching/retry settings, or an injectable transport through `StackLogger.init`.

## 4. Capture errors manually

Use `captureException` in a `catch` block. Add tags, request details, or other diagnostic data with the capture options.

```ts
import { StackLogger } from "./stacklogger.js";

try {
  await processPayment();
} catch (error) {
  StackLogger.captureException(error, {
    handled: true,
    tags: { component: "payments" },
    extra: { operation: "process-payment" },
  });

  await StackLogger.flush();
  throw error;
}
```

You can also capture messages and add breadcrumbs:

```ts
StackLogger.addBreadcrumb({ category: "worker", message: "Job started" });
StackLogger.captureMessage("Job failed validation", "error");
```

## 5. Capture uncaught exceptions and rejections

Install the Node process listeners after initialization. The function returns a cleanup function for tests or controlled shutdown.

```ts
import { StackLogger, installNodeCapture } from "@stacklogger/node";

StackLogger.init({
  apiKey: process.env.STACKLOGGER_API_KEY!,
  environment: process.env.NODE_ENV ?? "production",
});

const removeNodeCapture = installNodeCapture();
```

The handler reports both `uncaughtException` and `unhandledRejection` as unhandled errors. Keep your process lifecycle policy in place and flush during graceful shutdown:

```ts
async function shutdown() {
  await StackLogger.flush();
  removeNodeCapture();
  process.exit(0);
}

process.once("SIGTERM", () => void shutdown());
process.once("SIGINT", () => void shutdown());
```

## 6. Add request and application context

Set context that should be attached to subsequent events, or provide request data for an individual exception.

```ts
StackLogger.setUser({ id: "user-123" });
StackLogger.setTag("service", "checkout");
StackLogger.setContext("runtime", { region: "us-east-1" });

StackLogger.captureException(error, {
  request: {
    method: "POST",
    url: "/checkout",
    statusCode: 500,
    durationMs: 842,
  },
});
```

Sensitive keys such as passwords, tokens, authorization headers, cookies, and card data are sanitized by default. Review values passed through `extra`, `contexts`, and request data before sending them.
