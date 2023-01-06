import { setStyleAttribute } from '../utils/DomUtil';
import { CellData, ColumnDataType, ColumnDefinition } from './DataGrid';
import type * as CSS from 'csstype';
import TextControl from './controls/TextControl';
import SelectControl, { ModeChangePayload } from './controls/SelectControl';
import BooleanControl from './controls/BooleanControl';
import { uuidv4 } from '../utils/CryptoUtil';
import {
  CellEvent,
  EventType,
  ResizeColumnClickEventData,
  ResizeColumnEventData,
} from '../constants/Event';
import { cellDataStyle } from '../styles/styles';
import BaseElement from '../BaseElement';
import Context from '../context/Context2';

export enum InteractionMode {
  EDIT = 'EDIT',
  VIEW = 'VIEW',
}

class Cell extends Context.consumer(BaseElement) {
  static template = `
    ${cellDataStyle.outerHTML}
    <slot/>
  `;

  static get observedAttributes() {
    return ['column-index', 'column-key', 'row-index'];
  }

  #cellData: CellData;
  #mode: InteractionMode = InteractionMode.VIEW;

  constructor(cellData: CellData) {
    super(Cell.template);
    this.#cellData = { ...cellData };
    this.#content = cellData.value;
  }

  connectedCallback() {
    super.connectedCallback();
    const columnKey = this.getAttribute('column-key');
    if (columnKey === null) {
      throw new Error('A column key attribute must be supplied');
    }
    const id = `${columnKey}_${uuidv4()}`;
    const column = this.request<ColumnDefinition>(`column-${columnKey}`);
    this.#columnWidth = column.width ?? '150px';
    this.onEvent(
      EventType.ResizeColumnHandleClick,
      this.#onClickColumnResizeHandle(columnKey),
    );
    this.onEvent(EventType.ResizeColumn, this.#onResizeColumnWidth(columnKey));

    this.registerEventListener('click', this.#toggleActiveState);
    if (column.editable) {
      this.registerEventListener('dblclick', this.#editMode(id, column));
    }
  }

  #onClickColumnResizeHandle =
    (columnKey: string) => (eventData: ResizeColumnClickEventData) => {
      const { active, column } = eventData;
      if (columnKey === column.columnKey) {
        this.style.borderRightColor = active ? 'darkgray' : 'transparent';
      }
    };

  #onResizeColumnWidth =
    (columnKey: string) => (eventData: ResizeColumnEventData) => {
      const { column, width } = eventData;
      if (columnKey === column.columnKey) {
        this.#columnWidth = width;
      }
    };

  #toggleActiveState = (event: Partial<MouseEvent>) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const active = this.active;
    document.querySelectorAll('[active="true"]').forEach((activeCell) => {
      if (activeCell instanceof Cell) {
        activeCell.#active = false;
      }
    });
    this.#active = true;
    this.dispatch(EventType.CellActiveStateChange, {
      target: event.target,
      deactivated: !active,
    });
  };

  #viewMode = (cellEvent: CellEvent<ModeChangePayload>) => {
    this.#mode = InteractionMode.VIEW;
    this.#content = cellEvent.data?.value;
    this.setAttribute('cell-mode', this.#mode);
    this.classList.remove('cell-edit-mode');
  };

  #editMode = (id: string, column: ColumnDefinition) => (event: MouseEvent) => {
    if (
      !(event.currentTarget instanceof HTMLElement) ||
      this.#mode === InteractionMode.EDIT
    ) {
      return;
    }

    this.#mode = InteractionMode.EDIT;
    this.classList.add('cell-edit-mode');
    this.setAttribute('cell-mode', this.#mode);
    if (column.dataType === ColumnDataType.text) {
      this.#content = TextControl(
        id,
        this.currentValue,
        this.#viewMode,
        this.eventEmitter,
      );
    } else if (column.dataType === ColumnDataType.select) {
      const rect = this.getBoundingClientRect();
      this.#content = SelectControl(
        { cellId: id, cellValue: this.currentValue, rect },
        this.#viewMode,
        this.eventEmitter,
        this.#cellData.options || column.options,
        this.#cellData.multiple || column.multiple,
      );
    } else if (column.dataType === ColumnDataType.boolean) {
      this.#content = BooleanControl(
        id,
        this.currentValue,
        this.#viewMode,
        column.options,
        column.defaultValue ?? null,
        this.eventEmitter,
      );
    }
  };

  set #columnWidth(width: CSS.PropertyValue<CSS.Property.Width>) {
    setStyleAttribute(this, {
      width: width,
    });
  }

  get currentValue() {
    return this.#cellData.value;
  }

  set #active(active: boolean) {
    if (active) {
      this.setAttribute('active', 'true');
    } else {
      this.removeAttribute('active');
    }
  }

  get active() {
    return this.hasAttribute('active');
  }

  set #content(content: HTMLElement | string | undefined | null) {
    if (content instanceof HTMLElement) {
      this.innerText = '';
      this.appendChild(content);
    } else {
      if (content) {
        this.innerHTML = '';
        this.innerText = content;
        this.#cellData.value = content;

        this.setAttribute('title', content);
      }
    }
  }

  get mode() {
    return this.#mode;
  }
}

customElements.define('wicked-data-cell', Cell);

export default Cell;
