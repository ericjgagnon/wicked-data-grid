import type * as CSS from 'csstype';
import { setStyleAttribute } from '../utils/DomUtil';
import Cell from './Cell';
import { Data } from './DataGrid';
import './Loading';
import DataOperatorService from '../operators/DataOperatorService';
import { debug } from '../utils/DebugUtils';
import { EventType } from '../constants/Event';
import BaseElement from '../BaseElement';
import DataGridRow from './DataGridRow';
import Context from '../context/Context2';

export type DataGridBodyProps = {
  data?: Data[] | null;
};

class DataGridBody extends Context.consumer(BaseElement) {
  static template = '<slot/>';
  readonly #data: Data[];
  readonly #indexedData: number[];
  readonly #bufferSize = 2;
  readonly #rowCount: number;
  #rowHeight = 0;
  #viewportHeight = 0;
  constructor({ data }: DataGridBodyProps) {
    super(DataGridBody.template);
    this.#rowCount = data === null || data === undefined ? 0 : data.length;
    this.#data = this.#rowCount > 0 ? (data as Data[]) : [];
    this.#indexedData =
      this.#rowCount > 0 ? this.#data.map((_, index) => index) : [];
  }

  connectedCallback() {
    super.connectedCallback();
    const rowHeight =
      this.request<CSS.PropertyValue<CSS.Property.Height>>('rowHeight');
    const gridHeight =
      this.request<CSS.PropertyValue<CSS.Property.Height>>('gridHeight');
    this.#viewportHeight =
      typeof gridHeight === 'string' ? parseInt(gridHeight) : gridHeight;
    setStyleAttribute(this, {
      height: gridHeight,
      overflow: 'auto',
    });

    const dataContainer = document.createElement('div');

    this.#rowHeight =
      typeof rowHeight === 'string' ? parseInt(rowHeight) : rowHeight;
    setStyleAttribute(dataContainer, {
      height: `${this.#rowHeight * this.#rowCount}px`,
      overflow: 'hidden',
      willChange: 'transform',
      position: 'relative',
    });

    this.appendChild(dataContainer);

    const dataOperatorService = new DataOperatorService(this.eventEmitter);

    this.onEvent(EventType.ApplyOperations, () => {
      debug(`Before applying operations ${this.#indexedData}`);
      const updatedIndexes = dataOperatorService
        .getDataOperators()
        .flatMap((dataOperator) => {
          return dataOperator.apply(this.#data, this.#indexedData);
        });

      this.#renderWindow(
        dataContainer,
        updatedIndexes.length > 0 ? updatedIndexes : this.#indexedData,
      );
    });

    this.#renderWindow(dataContainer, this.#indexedData);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  #getEndIndex(scrollTop: number) {
    return Math.min(
      Math.ceil((scrollTop + this.#viewportHeight) / this.#rowHeight - 1) +
        this.#bufferSize,
      this.#rowCount,
    );
  }

  #getStartIndex(scrollTop: number) {
    return Math.max(
      Math.floor(scrollTop / this.#rowHeight) - this.#bufferSize,
      0,
    );
  }

  #renderNoData() {
    const noData = new Cell({
      columnKey: 'noItems',
      value: 'No items',
      rowIndex: '0',
    });
    noData.setAttribute('column-key', 'noItems');
    const noDataRow = document.createElement('div');
    noDataRow.className = 'no-data-row';
    noDataRow.appendChild(noData);
    this.appendChild(noDataRow);
  }

  #renderWindow = (dataContainer: HTMLElement, indexedData: number[]) => {
    if (indexedData.length === 0) {
      this.#renderNoData();
    } else {
      const scrollHandle = () => {
        requestAnimationFrame(() =>
          this.#renderRows(dataContainer, indexedData),
        );
      };
      this.registerEventListener('scroll', scrollHandle);
      this.#renderRows(dataContainer, indexedData);
    }
  };

  #renderRows = (dataContainer: HTMLElement, indexedData: number[]) => {
    const scrollTop = this.scrollTop;
    const startIndex = this.#getStartIndex(scrollTop);
    const endIndex = this.#getEndIndex(scrollTop);
    this.#renderRowsInRange(dataContainer, indexedData, startIndex, endIndex);
  };

  #renderRowsInRange = (
    dataContainer: HTMLElement,
    indexedData: number[],
    startIndex: number,
    endIndex: number,
  ) => {
    dataContainer.innerHTML = '';
    const pageSize = Math.min(endIndex - startIndex, indexedData.length);
    const windowedIndexes = indexedData.slice(startIndex, endIndex);
    const rowIterator = windowedIndexes.values();
    for (let rowIndex = 0; rowIndex < pageSize; rowIndex++) {
      const dataIndex = rowIterator.next().value;
      const dataRow = this.#data[dataIndex];

      const row = new DataGridRow((column, index) => {
        const cellData = dataRow[column.columnKey] ?? {
          value: column.generator?.call(column.generator, dataIndex, index),
          columnKey: column.columnKey,
        };

        const cell = new Cell(cellData);
        cell.setAttribute('column-key', column.columnKey);
        cell.setAttribute('column-index', index.toString());
        cell.setAttribute('row-index', rowIndex.toString());
        cell.setAttribute('wrap', `${column.wrap ?? false}`);
        return cell;
      });
      row.setAttribute('row-index', rowIndex.toString());
      row.setAttribute('data-index', dataIndex.toString());
      setStyleAttribute(row, {
        top: `${startIndex * this.#rowHeight}px`,
      });

      dataContainer.appendChild(row);
    }
  };
}

customElements.define('wicked-grid-body', DataGridBody);
export default DataGridBody;
