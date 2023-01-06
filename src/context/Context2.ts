import EventEmitter, { Listener } from '../services/EventEmitter';
import { EventTypeData } from '../constants/Event';

type Constructor<T> = new (..._args: any[]) => T;

interface Connectable extends Node {
  connectedCallback(): void;
  disconnectedCallback(): void;
}

const providers = new WeakMap();
function createProvider<Base extends Constructor<Connectable>>(
  BaseClass: Base,
) {
  return class extends BaseClass {
    readonly eventEmitter = new EventEmitter();
    constructor(...args: any[]) {
      super(...args);
      providers.set(this, '');
      this.eventEmitter.on('context-request', (contextRequestData) => {
        const { name, callback } = contextRequestData;
        const instance = this.resolveDependency(name);
        callback(instance);
      });
    }

    resolveDependency(_name: string): unknown {
      return undefined;
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.eventEmitter.clear();
    }
  };
}

const onAppend = (node: Node, callback: (addedNodes: NodeList) => void) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        callback(mutation.addedNodes);
      }
    });
  });

  observer.observe(node, { childList: true, subtree: true });
};

function createEmitterElement<Base extends Constructor<Connectable>>(
  BaseClass: Base,
) {
  return class extends BaseClass implements HasEmitter {
    eventEmitter: EventEmitter | null = null;

    readonly #cleanupFunctions: Array<() => void> = [];

    protected onEvent<E extends keyof EventTypeData>(
      event: E,
      listener: Listener<E>,
    ) {
      const off = this.eventEmitter?.on(event, listener);
      if (off) {
        this.#cleanupFunctions.push(off);
      }
      return this;
    }

    protected dispatch<E extends keyof EventTypeData>(
      event: E,
      data: EventTypeData[E],
    ) {
      this.eventEmitter?.emit(event, data);
    }

    connectedCallback() {
      super.connectedCallback();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.#cleanupFunctions.forEach((cleanup) => cleanup());
    }
  };
}

type HasEmitter = Node & {
  eventEmitter: EventEmitter | null;
};

function createConsumer<Base extends Constructor<Connectable>>(
  BaseClass: Base,
) {
  return class extends createEmitterElement(BaseClass) {
    constructor(...args: any[]) {
      super(...args);
    }
    request<T = unknown>(name: string): T {
      let instance: T | null = null;
      this.eventEmitter?.emit('context-request', {
        name,
        callback: (value: unknown) => {
          instance = value as T;
        },
      });

      if (instance === null) {
        throw new Error(`Failed to request service with the name ${name}`);
      }

      return instance;
    }

    connectedCallback() {
      super.connectedCallback();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
    }
  };
}

const createContext = () => {
  return {
    provider: createProvider,
    consumer: createConsumer,
  };
};

const Context = createContext();

export default Context;
