/**
 * @format
 */
import EventEmitter from '../services/EventEmitter';
import {
  DataOperatorEvent,
  EventType,
  EventTypeData,
} from '../constants/Event';
import { DataOperator } from './DataOperator';
import { Data } from '../components/DataGrid';

export default abstract class DataOperatorEventListener<
  T extends DataOperatorEvent,
> implements DataOperator<T>
{
  readonly eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.eventEmitter.on(this.subscribeTo(), (eventData) => {
      this.addEvent(eventData);
      this.eventEmitter.emit(EventType.ApplyOperations, undefined);
    });
  }

  abstract subscribeTo(): DataOperatorEvent;

  abstract addEvent(eventData: EventTypeData[DataOperatorEvent]): void;

  abstract apply(data: Data[], indexedData: number[]): number[];
}
