/**
 * @format
 */
import FilterDataOperator from './FilterDataOperator';
import SortDataOperator from './SortDataOperator';
import { DataOperator } from './DataOperator';
import { DataOperatorEvent } from '../constants/Event';
import EventEmitter from '../services/EventEmitter';

export default class DataOperatorService {
  readonly #filterDataOperator: FilterDataOperator;
  readonly #sortDataOperator: SortDataOperator;

  constructor(eventEmitter: EventEmitter) {
    this.#filterDataOperator = new FilterDataOperator(eventEmitter);
    this.#sortDataOperator = new SortDataOperator(eventEmitter);
  }

  getDataOperators(): DataOperator<DataOperatorEvent>[] {
    return [this.#filterDataOperator, this.#sortDataOperator];
  }
}
