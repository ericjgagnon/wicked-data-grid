/**
 * @format
 */
import * as CSS from 'csstype';

function toCssProperty(jsPropertyName: string): string {
  return jsPropertyName.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function setStyleAttribute(element: HTMLElement, attrs: CSS.Properties): void {
  if (attrs !== undefined) {
    Object.entries(attrs).forEach(([property, value]) => {
      element.style.setProperty(toCssProperty(property), value);
    });
  }
}

function createStyles(
  rules: string,
  baseStyle?: HTMLStyleElement,
): HTMLStyleElement {
  const style = baseStyle
    ? baseStyle.cloneNode(true)
    : document.createElement('style');
  style.textContent += rules;
  return style as HTMLStyleElement;
}

export type EventMap<S extends HTMLElement | Document> = S extends HTMLElement
  ? HTMLElementEventMap
  : DocumentEventMap;

function addEventListener<
  S extends HTMLElement | Document,
  K extends keyof EventMap<S>,
>(
  subscriber: S,
  type: K,
  listener: (this: S, event: EventMap<S>[K]) => unknown,
  options?: boolean | AddEventListenerOptions,
): () => void;
function addEventListener<S extends HTMLElement | Document>(
  subscriber: S,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  subscriber.addEventListener(type, listener, options);
  return () => {
    subscriber.removeEventListener(type, listener, options);
  };
}

export { createStyles, addEventListener, setStyleAttribute };
