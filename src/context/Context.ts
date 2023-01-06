type Constructor<T> = new (..._args: any[]) => T;

interface Connectable extends EventTarget {
  connectedCallback(): void;
  disconnectedCallback(): void;
}

function provider<Base extends Constructor<Connectable>>(BaseClass: Base) {
  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);
    }

    resolveDependency(_name: string): unknown {
      return undefined;
    }

    connectedCallback() {
      this.addEventListener('context-request', this.handleContextRequest);
      super.connectedCallback();
    }

    disconnectedCallback() {
      this.removeEventListener('context-request', this.handleContextRequest);
    }

    private handleContextRequest = (event: Event) => {
      if (event instanceof ContextEvent) {
        event.stopPropagation();
        const dependencyName = event.context.name;
        const instance = this.resolveDependency(dependencyName);
        event.callback(instance);
        return;
      }
      throw new Error(
        `Context event must be of type ${ContextEvent.name} received ${event}`,
      );
    };
  };
}

function consumer<Base extends Constructor<EventTarget>>(BaseClass: Base) {
  return class extends BaseClass {
    request<T = unknown>(name: string): T {
      let service: T | null = null;
      const requestEvent = new ContextEvent(
        {
          name,
        },
        (value) => {
          service = value as T;
        },
      );

      if (!this.dispatchEvent(requestEvent) || service === null) {
        throw new Error(`Failed to request service with the name ${name}`);
      }

      return service;
    }
  };
}

/**
 * A Context object defines an optional initial value for a Context, as well as a name identifier for debugging purposes.
 */
export type Context<T> = {
  name: string;
  initialValue?: T;
};

/**
 * An unknown context type
 */
export type UnknownContext = Context<unknown>;

/**
 * A helper type which can extract a Context value type from a Context type
 */
export type ContextType<T extends UnknownContext> = T extends Context<infer Y>
  ? Y
  : never;

/**
 * A callback which is provided by a context requester and is called with the value satisfying the request.
 * This callback can be called multiple times by context providers as the requested value is changed.
 */
export type ContextCallback<ValueType> = (
  value: ValueType,
  dispose?: () => void,
) => void;

/**
 * An event fired by a context requester to signal it desires a named context.
 *
 * A provider should inspect the `context` property of the event to determine if it has a value that can
 * satisfy the request, calling the `callback` with the requested value if so.
 *
 * If the requested context event contains a truthy `multiple` value, then a provider can call the callback
 * multiple times if the value is changed, if this is the case the provider should pass a `dispose`
 * method to the callback which requesters can invoke to indicate they no longer wish to receive these updates.
 */
export class ContextEvent<T extends UnknownContext> extends Event {
  public constructor(
    private readonly _context: T,
    private readonly _callback: ContextCallback<ContextType<T>>,
    private readonly _multiple: boolean = true,
  ) {
    super('context-request', { bubbles: true, composed: true });
  }

  get context(): T {
    return this._context;
  }

  get callback(): ContextCallback<ContextType<T>> {
    return this._callback;
  }

  get multiple(): boolean {
    return this._multiple;
  }
}

declare global {
  interface HTMLElementEventMap {
    /**
     * A 'context-request' event can be emitted by any element which desires
     * a context value to be injected by an external provider.
     */
    'context-request': ContextEvent<UnknownContext>;
  }
}

export { consumer, provider };
