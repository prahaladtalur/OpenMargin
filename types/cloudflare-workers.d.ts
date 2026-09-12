declare global {
  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    run(): Promise<unknown>;
    all<T = unknown>(): Promise<{ results: T[] }>;
  }

  interface D1Database {
    prepare(sql: string): D1PreparedStatement;
    batch(statements: readonly D1PreparedStatement[]): Promise<unknown>;
  }

  interface R2Bucket {
    put(
      key: string,
      value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
      options?: Record<string, unknown>,
    ): Promise<unknown>;
    get(key: string): Promise<unknown | null>;
    delete(key: string): Promise<void>;
  }

  interface Fetcher {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  }
}

declare module "cloudflare:workers" {
  type RuntimeEnv = {
    DB?: D1Database;
    MANUSCRIPTS?: R2Bucket;
    EDITOR_EMAILS?: string;
    EDITOR_PASSWORD?: string;
    EDITOR_SESSION_SECRET?: string;
    NOTIFICATION_EMAIL?: string;
    RESEND_API_KEY?: string;
    RESEND_FROM?: string;
  };

  export const env: RuntimeEnv;
}

export {};
