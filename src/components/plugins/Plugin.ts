import BaseElement from '../../BaseElement';

export default interface Plugin<T extends BaseElement> {
  (instance: T): T;
}
