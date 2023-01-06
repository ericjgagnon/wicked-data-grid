import EventEmitter from '../services/EventEmitter';
import BaseElement from '../BaseElement';

const providers = new WeakMap();
class ContextProvider extends BaseElement {
  readonly eventEmitter = new EventEmitter();

  constructor() {
    super();
    this.eventEmitter.on('context-request', ({ name, callback }) => {
      const dep = this.resolveDependency(name);
      callback(dep);
    });
    providers.set(this, 'some-context');
  }

  resolveDependency<T = unknown>(_name: string): T {
    return null as T;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

class ContextConsumer extends BaseElement {
  readonly eventEmitter: EventEmitter | null = null;

  constructor() {
    super();
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
}

customElements.define('wicked-context-provider', ContextProvider);
customElements.define('wicked-context-consumer', ContextConsumer);

export { ContextProvider, ContextConsumer };
