# @stacklogger/core

Shared StackLogger client used by the Node.js and React packages.

## Get started

1. Create an account at [stacklogger.io](https://stacklogger.io).
2. Create an application for React, Node.js, NestJS, or Next.js and activate it.
3. Open the application home page, go to the **Integration** section, and copy the app key.
4. Use the app key when initializing the library to start logging and ingesting errors from your code.

For most applications, install [`@stacklogger/node`](../node) or [`@stacklogger/react`](../react), which provide the platform-specific integration. The core client accepts the app key through `StackLogger.init`:

```ts
import { StackLogger } from "@stacklogger/core";

StackLogger.init({
  apiKey: process.env.STACKLOGGER_APP_KEY!,
});
```
