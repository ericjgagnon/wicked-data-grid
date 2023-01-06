/**
 * @format
 */
import createControl from './ControlFactory';
import { CellDataValue, Option } from '../DataGrid';
import EventEmitter from '../../services/EventEmitter';
import { CellEvent } from '../../constants/Event';
import { DropdownMenuItem } from '../DropdownMenu';

export type ModeChangePayload = {
  value?: CellDataValue | null;
};

export type CellSummary = {
  cellId: string;
  cellValue: CellDataValue;
  rect: DOMRect;
};

export default function SelectControl(
  cellSummary: CellSummary,
  onModeChange: (event: CellEvent<ModeChangePayload>) => void,
  eventEmitter: EventEmitter,
  options?: Option[],
  multiple = false,
) {
  return createControl(
    'dropdown-menu',
    onModeChange,
    eventEmitter,
    (element) => {
      if (options === null || options === undefined) {
        throw new Error(
          `No options supplied for all rows at the column level or at the individual cell level`,
        );
      }
      const selections = cellSummary.cellValue
        ? cellSummary.cellValue.split(',')
        : [];
      element.multiple = multiple;
      element.value = selections;
      options?.forEach(([label, value]) => {
        const dropdownMenuItem = new DropdownMenuItem();
        dropdownMenuItem.label = label;
        dropdownMenuItem.value = value;
        dropdownMenuItem.selected = selections.includes(value);
        element.appendChild(dropdownMenuItem);
      });
      return {
        element,
        get value() {
          const option = element.value;
          if (option) {
            return Array.isArray(option) ? option.join(',') : option;
          }
          return null;
        },
      };
    },
  );
}
