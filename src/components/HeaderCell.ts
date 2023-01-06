/**
 * @format
 */
import { ColumnDefinition } from './DataGrid';
import { EventType } from '../constants/Event';
import { setStyleAttribute } from '../utils/DomUtil';
import { headerCellStyle } from '../styles/styles';
import BaseElement from '../BaseElement';
import Context from '../context/Context2';

class HeaderCell extends Context.consumer(BaseElement) {
  static template = `
      ${headerCellStyle.outerHTML}
      <slot name="content"></slot>
  `;
  #textContainer: HTMLElement;

  constructor() {
    super(HeaderCell.template);
    this.#textContainer = this.shadow.querySelector(
      'slot[name="content"]',
    ) as HTMLSlotElement;
  }

  connectedCallback() {
    super.connectedCallback();
    const columnKey = this.getAttribute('column-key');

    const column = this.request<ColumnDefinition>(`column-${columnKey}`);

    this.#content = column.label;
    this.setAttribute('column-key', column.columnKey);

    setStyleAttribute(this, {
      width: column.width ?? '150px',
    });
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'header-cell-resize-handle';
    this.shadow.appendChild(resizeHandle);
    this.#createResizableColumn(resizeHandle, column);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  #createResizableColumn = (resizer: HTMLElement, column: ColumnDefinition) => {
    // Track the current position of mouse
    let x = 0;
    let width = 0;
    let currentColumn: Element | null = null;

    const mouseMoveHandler = (mouseMoveEvent: MouseEvent) => {
      if (this === currentColumn) {
        // Determine how far the mouse has been moved
        const dx = mouseMoveEvent.pageX - x;

        // Update the width of column
        const newWidth = width + dx;
        const pixelWidth = `${newWidth}px`;
        this.style.width = pixelWidth;
        this.eventEmitter.emit(EventType.ResizeColumn, {
          width: pixelWidth,
          column: column,
        });
      }
    };

    const mouseDownHandler = (mouseDownEvent: MouseEvent) => {
      // Get the current mouse position
      currentColumn = (
        (mouseDownEvent.target as HTMLElement).getRootNode() as ShadowRoot
      ).host;
      x = mouseDownEvent.pageX;

      // Calculate the current width of column
      const computedStyles = window.getComputedStyle(this, null);
      const padding =
        parseFloat(computedStyles.paddingLeft) +
        parseFloat(computedStyles.paddingRight);
      width = this.offsetWidth - padding;
      this.eventEmitter.emit(EventType.ResizeColumnHandleClick, {
        active: true,
        column: column,
      });
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    // When user releases the mouse, remove the existing event listeners
    const mouseUpHandler = () => {
      width = 0;
      x = 0;
      currentColumn = null;
      this.eventEmitter.emit(EventType.ResizeColumnHandleClick, {
        active: false,
        column: column,
      });
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    const doubleClickHandler = () => {
      const newWidth = `${column.width}px`;
      this.style.width = newWidth;

      this.eventEmitter.emit(EventType.ResizeColumn, {
        width: `${newWidth}px`,
        column: column,
      });
    };

    this.registerEventListener('mousedown', mouseDownHandler, resizer);
    this.registerEventListener('dblclick', doubleClickHandler, resizer);
  };

  set #content(content: string) {
    this.#textContainer.innerText = content;
  }
}

customElements.define('wicked-header-cell', HeaderCell);

export default HeaderCell;
