/**
 * @format
 */
import { EventType, SortDirection, SortEventData } from '../constants/Event';
import { ColumnKey, Data } from '../components/DataGrid';
import { ComparisonResult, sort } from '../utils/ArrayUtil';
import DataOperatorEventListener from './DataOperatorEventListener';
import { debug } from '../utils/DebugUtils';
import EventEmitter from '../services/EventEmitter';

type RowComparator = (dataRow1: Data, dataRow2: Data) => number;

export default class SortDataOperator extends DataOperatorEventListener<EventType.SortColumn> {
  readonly #comparator: RowComparator;
  #sortEvents: Map<ColumnKey, SortEventData> = new Map<
    ColumnKey,
    SortEventData
  >();

  constructor(eventEmitter: EventEmitter) {
    super(eventEmitter);
    this.#comparator = (dataRow1, dataRow2) => {
      return Array.from(this.#sortEvents.values()).reduce(
        (comparisonResults, sortEvent) => {
          const cellData1 = dataRow1[sortEvent.column.columnKey];
          const cellData2 = dataRow2[sortEvent.column.columnKey];
          const compareValues = sort(sortEvent);
          const number =
            comparisonResults ||
            compareValues(cellData1.value, cellData2.value);
          debug(
            `${cellData1.value} <=> ${cellData2.value} = ${ComparisonResult[number]}`,
          );
          return number;
        },
        0,
      );
    };
  }

  subscribeTo(): EventType.SortColumn {
    return EventType.SortColumn;
  }

  addEvent = (event: SortEventData): void => {
    if (
      this.#sortEvents.has(event.column.columnKey) &&
      event.sortDirection === SortDirection.None
    ) {
      this.#sortEvents.delete(event.column.columnKey);
    } else {
      this.#sortEvents.set(event.column.columnKey, event);
    }
  };

  apply = (data: Data[], indexedData: number[]): number[] => {
    const sortedIndexes = [...indexedData];
    sortedIndexes.sort((index1, index2) => {
      const rowData1 = data[index1];
      const rowData2 = data[index2];
      return this.#comparator(rowData1, rowData2);
    });
    return sortedIndexes;
  };
}
