import { setStyleAttribute } from '../utils/DomUtil';
import { ColumnDefinition } from './DataGrid';
import HeaderCell from './HeaderCell';
import { EventType, FilterEventData } from '../constants/Event';
import BaseElement from '../BaseElement';
import DataGridRow from './DataGridRow';
import SortableHeaderCellPlugin from './SortableHeaderCellPlugin';
import Context from '../context/Context2';

class DataGridHeader extends Context.consumer(BaseElement) {
  static template = '<slot/>';
  constructor() {
    super(DataGridHeader.template);
  }

  connectedCallback() {
    super.connectedCallback();
    const columnRow = new DataGridRow((column, index) => {
      const cell = new HeaderCell();
      cell.setAttribute('column-key', column.columnKey);
      cell.setAttribute('column-index', index.toString());
      return SortableHeaderCellPlugin(cell);
    });
    const filterRow = new DataGridRow((column, index) => {
      if (column.filterable) {
        return this.#createFilterCell(column, index.toString());
      }
      return document.createElement('div');
    });
    this.appendChild(columnRow);
    this.appendChild(filterRow);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  #createFilterCell(column: ColumnDefinition, index: string) {
    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('autocomplete', `filter-column-${column.columnKey}`);
    setStyleAttribute(input, {
      boxSizing: 'border-box',
      height: '100%',
      width: '100%',
    });
    input.setAttribute('id', `filter-column-${column.columnKey}`);
    input.setAttribute('name', `filter-column-${column.columnKey}`);
    input.setAttribute('filter-column-index', index);
    input.addEventListener('input', (event) => {
      if (event.target instanceof HTMLInputElement) {
        const previousValue = event.target.value.substring(
          0,
          event.target.value.length - 1,
        );
        const filterEvent: FilterEventData = {
          column,
          value: event.target.value,
          previousValue,
        };
        this.eventEmitter.emit(EventType.FilterColumn, filterEvent);
      }
    });
    const cellContent = document.createElement('div');
    cellContent.appendChild(input);
    setStyleAttribute(cellContent, {
      width: '100%',
    });
    const cell = document.createElement('div');
    setStyleAttribute(cell, {
      border: '1px solid transparent',
      textAlign: 'center',
      width: column.width,
      display: 'inline-flex',
    });

    this.eventEmitter.on(EventType.ResizeColumn, (payload) => {
      const { column: eventColumn, width } = payload;
      if (column === eventColumn) {
        cell.style.width = width;
      }
    });

    this.eventEmitter.on(EventType.ResizeColumnHandleClick, (payload) => {
      const { active, column: eventColumn } = payload;
      if (column === eventColumn) {
        cell.style.borderRightColor = active ? 'darkgray' : 'transparent';
      }
    });
    cell.appendChild(cellContent);
    return cell;
  }
}

customElements.define('wicked-grid-header', DataGridHeader);

export default DataGridHeader;
