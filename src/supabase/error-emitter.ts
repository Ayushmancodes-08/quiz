import { EventEmitter } from 'events';
import { SupabasePermissionError } from './errors';

class SupabaseErrorEmitter extends EventEmitter {
  emit(event: 'permission-error', error: SupabasePermissionError): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  on(event: 'permission-error', listener: (error: SupabasePermissionError) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

export const errorEmitter = new SupabaseErrorEmitter();
