import { EventMap } from './utils/DomUtil';

export default class BaseElement extends HTMLElement {
  protected readonly shadow: ShadowRoot;
  #cleanupFunctions: Array<() => void> = [];

  constructor(template?: string) {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = template ?? '<slot/>';
  }

  registerEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  registerEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  registerEventListener<
    S extends HTMLElement | Document,
    K extends keyof EventMap<S>,
  >(
    type: K,
    listener: (this: S, event: EventMap<S>[K]) => unknown,
    subscriber?: S,
    options?: boolean | AddEventListenerOptions,
  ): void;

  registerEventListener<S extends HTMLElement | Document>(
    type: string,
    listener: EventListenerOrEventListenerObject,
    subscriber?: S,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (subscriber) {
      subscriber.addEventListener(type, listener, options);
      this.#cleanupFunctions.push(() => {
        subscriber.removeEventListener(type, listener, options);
      });
    } else {
      this.addEventListener(type, listener, options);
      this.#cleanupFunctions.push(() => {
        this.removeEventListener(type, listener, options);
      });
    }
  }

  connectedCallback() {
    const connectedEvent = new CustomEvent(`connected-${this.localName}`);
    this.dispatchEvent(connectedEvent);
    return;
  }

  attributeChangedCallback(
    _name: string,
    _oldVal: string | null,
    _newVal: string | null,
  ): void {
    return;
  }

  disconnectedCallback() {
    this.#cleanupFunctions.forEach((fn) => fn());
  }

  protected addCleanup(cleanup: () => void) {
    this.#cleanupFunctions.push(cleanup);
  }
}
