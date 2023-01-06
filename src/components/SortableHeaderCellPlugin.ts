import { EventType, SortDirection } from '../constants/Event';
import EventEmitter from '../services/EventEmitter';
import DataGrid, { ColumnDefinition } from './DataGrid';
import HeaderCell from './HeaderCell';
import Plugin from './plugins/Plugin';
import { consumer } from '../context/Context';

class SortableHeaderCellPlugin extends consumer(EventTarget) {
  #previousSortDirection = SortDirection.None;
  #sortDirection = SortDirection.None;

  apply(headerCell: HeaderCell): HeaderCell {
    headerCell.addEventListener(
      `connected-${DataGrid.localName}`,
      () => {
        const column = this.request<ColumnDefinition>(`column-country`);
        const eventEmitter = this.request<EventEmitter>('eventEmitter');
        headerCell.registerEventListener('click', () => {
          this.#emitSortEvent(column, eventEmitter);
        });
      },
      { capture: true },
    );
    return headerCell;
  }

  #emitSortEvent = (column: ColumnDefinition, eventEmitter: EventEmitter) => {
    this.#previousSortDirection = this.#sortDirection;
    if (this.#previousSortDirection === SortDirection.None) {
      this.#sortDirection = SortDirection.Asc;
      // this.#headerCell.#content = column.label + ' ▲';
    } else if (this.#previousSortDirection === SortDirection.Desc) {
      this.#sortDirection = SortDirection.None;
      // this.#content = column.label;
    } else {
      this.#sortDirection = SortDirection.Desc;
      // this.#content = column.label + ' ▼';
    }
    eventEmitter.emit(EventType.SortColumn, {
      column,
      sortDirection: this.#sortDirection,
      previousSortDirection: this.#previousSortDirection,
    });
  };
}

const singleton = new SortableHeaderCellPlugin();
const SortableCallable: Plugin<HeaderCell> = (headerCell) =>
  singleton.apply(headerCell);

export default SortableCallable;
