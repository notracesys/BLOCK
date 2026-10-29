'use client';

type Callback = (data: any) => void;

class ErrorEmitter {
  private listeners: { [key: string]: Callback[] } = {};

  on(event: string, cb: Callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const errorEmitter = new ErrorEmitter();
