import { addEventListener } from '../utils/DomUtil';

const style = `
    :host {
        position: absolute;
        z-index: 10;
        transform: translateX(-50%);
    }
    
    .container {
        box-sizing: border-box;
        max-height: 300px;
        background-color: #ffffff;
        border: 1px solid #babfc7;
        display: flex;
        flex-direction: column;
        border-radius: 3px;
        cursor: default;
        text-overflow: ellipsis;
        font-family: inherit;
        font-size: 1em;
        text-align: left;
        white-space: nowrap;
    }
    
    .selection {
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: 1px solid #babfc7;
        box-sizing: border-box;
        padding: 0.333rem;
    }
    
    .value {
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    
    .arrow {
        flex: 1 1 auto;
        text-align: right;
    }
    
    .arrow:after {
        content: '\\25BE';
    }
    
    .list-box {
        flex: 1;
        overflow: hidden scroll;
    }
    
    ::slotted(.item) {
        display: block;
        padding: 0.333rem 0 0.333rem 0.333rem;
        cursor: pointer;
    }
    ::slotted(.item:hover), ::slotted(.item[selected="true"]) {
        background: rgba(33, 150, 243, 0.1);
    }
`;

class DropdownMenu extends HTMLElement {
  static singleValueKey = '0';

  #multiple = false;

  #shadow: ShadowRoot;

  #value = new Map<string, string>();

  #cleanupFunctions: Array<() => void> = [];

  static get observedAttributes() {
    return ['multiple'];
  }

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.innerHTML = `
        <style>${style}</style>
        <div class="container">
            <slot name="selection">
              <div class="selection">
                  <span class="value"></span>
                  <span class="arrow"></span>
              </div>
            </slot> 
            <div class="list-box"><slot/></div>
        </div>
    `;
  }
  connectedCallback() {
    const parentElement = this.parentElement;
    if (parentElement) {
      requestAnimationFrame(() => {
        const { height, width } = parentElement.getBoundingClientRect();
        const style = {
          top: '0px',
          width: `${width}px`,
        };
        this.setAttribute(
          'style',
          Object.entries(style).reduce((acc, [prop, val]) => {
            acc += `${prop}: ${val};`;
            return acc;
          }, ''),
        );

        const selection = this.#shadow.querySelector(
          '.selection',
        ) as HTMLElement;
        if (selection) {
          selection.style.minHeight = `${height}px`;
        }
      });
    }

    let unsubscribe = addEventListener(this, 'click', (event) => {
      if (event.target instanceof DropdownMenuItem) {
        const menuItem = event.target;
        menuItem.selected = true;
        this.value = menuItem.value;
        this.remove();
      }
    });
    this.#cleanupFunctions.push(unsubscribe);

    unsubscribe = addEventListener(document, 'click', (event) => {
      const targetNode = event.target as Node;
      if (!(this === targetNode || this.contains(targetNode))) {
        this.remove();
      }
    });
    this.#cleanupFunctions.push(unsubscribe);

    unsubscribe = addEventListener(document, 'keydown', (event) => {
      if (
        event.key === 'Escape' ||
        event.key === 'Esc' ||
        event.key === 'Enter'
      ) {
        this.remove();
      }
    });
    this.#cleanupFunctions.push(unsubscribe);
  }

  disconnectedCallback() {
    this.#cleanupFunctions.forEach((cleanupFunction) => cleanupFunction());
  }

  get value(): string[] | string {
    if (this.#multiple) {
      return Array.from(this.#value.values());
    }
    const maybeValue = this.#value.get(DropdownMenu.singleValueKey);
    if (maybeValue) {
      return maybeValue;
    }
    return '';
  }

  set value(value: string[] | string | null) {
    if (value) {
      if (this.#multiple) {
        if (Array.isArray(value)) {
          value.forEach((val) => this.#value.set(val, val));
        } else {
          this.#value.set(value, value);
        }
      } else {
        const singleValue = Array.isArray(value) ? value[0] : value;
        this.#value.set(DropdownMenu.singleValueKey, singleValue);
      }
      const selectionElement = this.#shadow.querySelector('.value');
      if (selectionElement) {
        selectionElement.textContent = Array.from(this.#value.values()).join(
          ',',
        );
      }
    }
  }

  get multiple() {
    return this.#multiple;
  }

  set multiple(multiple) {
    this.#multiple = multiple;
    this.setAttribute('multiple', String(multiple));
  }
}

class DropdownMenuItem extends HTMLElement {
  #selected = false;
  #value: string | null = null;

  static get observedAttributes() {
    return ['value', 'label'];
  }
  constructor() {
    super();
    this.className = 'item';
  }

  connectedCallback() {
    this.title = this.innerText;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<slot/>';
  }

  attributeChangedCallback(
    name: string,
    _oldValue: unknown,
    newValue: unknown,
  ) {
    if (
      name === 'value' &&
      (typeof newValue === 'string' || newValue === null)
    ) {
      this.value = newValue;
    } else if (name === 'selected' && typeof newValue === 'string') {
      this.selected = newValue === 'true';
    }
  }

  get label() {
    return this.innerText;
  }

  set label(label: string | null) {
    this.innerText = label ?? '';
  }

  get value(): string {
    return this.#value ?? '';
  }

  set value(value: string | null) {
    this.#value = value;
    const attributeValue = this.getAttribute('value');
    if (value && attributeValue != value) {
      this.setAttribute('value', value);
    }
  }

  get selected() {
    return this.#selected;
  }

  set selected(selected: boolean) {
    this.#selected = selected;
    const attributeSelected = this.getAttribute('selected');
    const stringSelected = String(selected);
    if (attributeSelected != stringSelected) {
      this.setAttribute('selected', stringSelected);
    }
  }
}

customElements.define('dropdown-menu-item', DropdownMenuItem);
customElements.define('dropdown-menu', DropdownMenu);

export { DropdownMenu, DropdownMenuItem };

export default DropdownMenu;
