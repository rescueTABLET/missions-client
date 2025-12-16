export type EventListener<
  EventMap extends Record<keyof EventMap, unknown>,
  Event extends keyof EventMap,
> = (event: EventMap[Event]) => void;

export abstract class EventEmitter<
  EventMap extends Record<keyof EventMap, unknown>,
> {
  readonly #listeners = new Map<
    keyof EventMap,
    Set<EventListener<EventMap, any>>
  >();

  on<T extends keyof EventMap>(type: T, listener: EventListener<EventMap, T>) {
    let listeners = this.#listeners.get(type);
    if (!listeners) {
      listeners = new Set<EventListener<EventMap, any>>();
      this.#listeners.set(type, listeners);
    }
    listeners.add(listener);
  }

  off<T extends keyof EventMap>(type: T, listener: EventListener<EventMap, T>) {
    let listeners = this.#listeners.get(type);
    if (listeners) listeners.delete(listener);
  }

  protected emit<T extends keyof EventMap>(type: T, event: EventMap[T]) {
    const listeners = this.#listeners.get(type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  protected close() {
    for (const [type, listeners] of this.#listeners.entries()) {
      for (const listener of listeners) {
        this.off(type, listener);
      }
    }

    this.#listeners.clear();
  }
}
