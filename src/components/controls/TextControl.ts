/**
 * @format
 */
import createControl from './ControlFactory';
import { CellDataValue } from '../DataGrid';
import EventEmitter from '../../services/EventEmitter';
import { ModeChangePayload } from './SelectControl';
import { CellEvent } from '../../constants/Event';

export default function TextControl(
  cellId: string,
  cellValue: CellDataValue,
  onModeChange: (cellEvent: CellEvent<ModeChangePayload>) => void,
  eventEmitter: EventEmitter,
): HTMLInputElement {
  return createControl('input', onModeChange, eventEmitter, (element) => {
    element.name = cellId;
    if (cellValue) {
      element.value = cellValue;
    }
    return {
      element,
      get value(): CellDataValue {
        return element.value;
      },
    };
  });
}
