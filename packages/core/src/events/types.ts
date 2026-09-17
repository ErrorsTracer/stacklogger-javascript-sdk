export type StackLoggerLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
export type StackLoggerEventType = "log" | "exception";
export interface StackLoggerException { name: string; message: string; stack?: string; cause?: unknown }
export interface StackLoggerUser { id?: string; email?: string; username?: string; [key: string]: unknown }
export interface StackLoggerBreadcrumb { category?: string; message: string; level?: StackLoggerLevel; timestamp: string; data?: Record<string, unknown> }
export interface StackLoggerRequestContext { method?: string; url?: string; statusCode?: number; durationMs?: number; traceId?: string; spanId?: string }
export interface StackLoggerPlatformContext { language: string; runtime: string; framework?: string; frameworkVersion?: string; sdk: { name: string; version: string } }
export interface StackLoggerEvent { eventId: string; timestamp: string; type: StackLoggerEventType; level: StackLoggerLevel; message: string; exception?: StackLoggerException; environment?: string; release?: string; fingerprint?: string[]; handled?: boolean; platform?: StackLoggerPlatformContext; url?: string; transaction?: string; user?: StackLoggerUser; request?: StackLoggerRequestContext; tags?: Record<string, string | number | boolean>; extra?: Record<string, unknown>; breadcrumbs?: StackLoggerBreadcrumb[]; contexts?: Record<string, Record<string, unknown>>; additionalData?: unknown }
export interface EventContext { tags?: Record<string, string | number | boolean>; extra?: Record<string, unknown>; contexts?: Record<string, Record<string, unknown>>; request?: StackLoggerRequestContext; fingerprint?: string[]; handled?: boolean }
