import { type EventEmitter } from "./EventEmitter.js";

export class EventCollector<
  TEventMap extends Record<keyof TEventMap, unknown>,
> {
  readonly #emitter: EventEmitter<TEventMap>;
  readonly #eventTypes: readonly (keyof TEventMap)[];
  readonly #listeners: readonly {
    readonly event: keyof TEventMap;
    readonly listener: (...args: readonly unknown[]) => void;
  }[];
  #events: {
    readonly event: keyof TEventMap;
    readonly args: readonly unknown[];
  }[] = [];

  constructor(
    emitter: EventEmitter<TEventMap>,
    eventTypes: readonly (keyof TEventMap)[]
  ) {
    this.#emitter = emitter;
    this.#eventTypes = eventTypes;
    this.#listeners = this.#eventTypes.map((event) => ({
      event,
      listener: (...args: readonly unknown[]) => {
        this.#events.push({ event, args });
      },
    }));

    for (const listener of this.#listeners) {
      this.#emitter.on(listener.event as any, listener.listener as any);
    }
  }

  done(): readonly {
    readonly event: keyof TEventMap;
    readonly args: readonly unknown[];
  }[] {
    for (const listener of this.#listeners) {
      this.#emitter.off(listener.event as any, listener.listener as any);
    }

    return this.#events;
  }
}
