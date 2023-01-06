/**
 * @format
 */
import { EventType, FilterEventData } from '../constants/Event';
import { WeightedSearch, weightedSearch } from '../utils/FuncUtils';
import { compose, exactMatch, startsWithMatch } from '../utils/Matchers';
import { ColumnDataType, Data } from '../components/DataGrid';
import DataOperatorEventListener from './DataOperatorEventListener';

export default class FilterDataOperator extends DataOperatorEventListener<EventType.FilterColumn> {
  #filterEvents: FilterEventData[] = [];

  subscribeTo(): EventType.FilterColumn {
    return EventType.FilterColumn;
  }

  addEvent = (filterEvent: FilterEventData) => {
    if (filterEvent.value === '') {
      this.#filterEvents = this.#filterEvents.filter((currentFilterEvent) => {
        return currentFilterEvent.column !== filterEvent.column;
      });
    } else {
      this.#filterEvents.push(filterEvent);
    }
  };

  apply = (data: Data[], indexedData: number[]) => {
    if (this.#filterEvents.length === 0) {
      return [];
    }

    const matchers = this.#filterEvents.reduce((matchers, filterEvent) => {
      const exact = exactMatch(data, filterEvent.column, filterEvent.value);
      matchers.exact = matchers.exact ? compose(matchers.exact, exact) : exact;

      if (filterEvent.column.dataType === ColumnDataType.text) {
        const startsWith = startsWithMatch(
          data,
          filterEvent.column,
          filterEvent.value,
        );
        matchers.startsWith = matchers.startsWith
          ? compose(matchers.startsWith, startsWith)
          : startsWith;
      }
      return matchers;
    }, {} as { exact: WeightedSearch<number>; startsWith: WeightedSearch<number> });

    return weightedSearch(indexedData, matchers.exact, matchers.startsWith);
  };
}
