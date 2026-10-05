declare module 'node:sqlite' {
  export class StatementSync {
    all(...args: unknown[]): unknown[];
    get(...args: unknown[]): unknown | undefined;
    run(...args: unknown[]): { lastInsertRowid: number | bigint; changes: number };
  }

  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean; readOnly?: boolean });
    prepare(sql: string): StatementSync;
    exec(sql: string): void;
    close(): void;
  }
}
