export class SupabasePermissionError extends Error {
  public readonly operation: string;
  public readonly table: string;

  constructor({ operation, table }: { operation: string; table: string }) {
    super(`Permission denied: ${operation} on ${table}`);
    this.name = 'SupabasePermissionError';
    this.operation = operation;
    this.table = table;
  }
}

export class SupabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}
