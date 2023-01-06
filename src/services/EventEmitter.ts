/**
 * @format
 */
import { EventTypeData } from '../constants/Event';
import { debug } from '../utils/DebugUtils';
import { uuidv4 } from '../utils/CryptoUtil';

export type Listener<T extends keyof EventTypeData> = (
  args: EventTypeData[T],
) => void;

type EventMap = {
  [K in keyof EventTypeData]: Listener<K>[];
};

const defaultEvents = {
  ApplyOperations: [],
  CellActiveStateChange: [],
  CellEditMode: [],
  CellValueChange: [],
  CellValueChangeCommitted: [],
  CellViewMode: [],
  FilterColumn: [],
  ResizeColumn: [],
  ResizeColumnHandleClick: [],
  Scrolling: [],
  SortColumn: [],
};
export default class EventEmitter {
  readonly id = uuidv4();
  #events: EventMap = structuredClone(defaultEvents);

  on<E extends keyof EventTypeData>(
    event: E,
    listener: Listener<E>,
  ): () => void {
    if (!Array.isArray(this.#events[event])) {
      this.#events[event] = [];
    }

    this.#events[event].push(listener);
    return () => this.off(event, listener);
  }

  off<E extends keyof EventTypeData>(event: E, listener: Listener<E>): void {
    if (!Array.isArray(this.#events[event])) {
      return;
    }

    const idx = this.#events[event].indexOf(listener);
    if (idx > -1) {
      this.#events[event].splice(idx, 1);
    }
  }

  emit<E extends keyof EventTypeData>(event: E, args: EventTypeData[E]): void {
    if (Array.isArray(this.#events[event])) {
      debug(
        `Invoking ${
          this.#events[event].length
        } listeners for event ${event} with args ${JSON.stringify(
          args,
          null,
          2,
        )}`,
      );
      this.#events[event].forEach((listener) => {
        listener(args);
      });
    }
  }

  once<E extends keyof EventTypeData>(event: E, listener: Listener<E>) {
    const remove: () => void = this.on(
      event,
      (...args: Parameters<typeof listener>) => {
        remove();
        listener.apply(this, args);
      },
    );
  }

  clear() {
    this.#events = structuredClone(defaultEvents);
  }
}
