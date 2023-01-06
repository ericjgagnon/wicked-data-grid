/**
 * @format
 */
import { Data } from '../components/DataGrid';
import { DataOperatorEvent, EventTypeData } from '../constants/Event';

export interface DataOperator<T extends DataOperatorEvent> {
  addEvent(event: EventTypeData[T]): void;

  apply(data: Data[], indexedData: number[]): number[];
}
