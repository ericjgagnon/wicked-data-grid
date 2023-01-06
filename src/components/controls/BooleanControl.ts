/**
 * @format
 */
import { CellDataValue, Option } from '../DataGrid';
import { ModeChangePayload } from './SelectControl';
import EventEmitter from '../../services/EventEmitter';
import createControl from './ControlFactory';
import { setStyleAttribute } from '../../utils/DomUtil';
import { CellEvent } from '../../constants/Event';

function createRadioControl(cellId: string, cellValue: CellDataValue | null) {
  return ([label, value]: Option) => {
    const checked = cellValue === value ? ' checked' : '';
    return `
            <div>
                <label for='${cellId}_${label}'>${label}</label>
                <input type='radio' value='${value}' id='${cellId}_${label}' name='${cellId}' ${checked}>
            </div>
    `;
  };
}

export default function BooleanControl(
  cellId: string,
  cellValue: CellDataValue,
  onModeChange: (cellEvent: CellEvent<ModeChangePayload>) => void,
  options: [Option, Option],
  defaultValue: CellDataValue | null,
  eventEmitter: EventEmitter,
): HTMLDivElement {
  return createControl('div', onModeChange, eventEmitter, (element) => {
    element.insertAdjacentHTML(
      'afterbegin',
      `${options
        .map(createRadioControl(cellId, cellValue || defaultValue))
        .join('')}`,
    );
    setStyleAttribute(element, {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'space-evenly',
    });
    return {
      element,
      get value() {
        const selectedRadio = element.querySelector<HTMLInputElement>(
          'input[type="radio"]:checked',
        );
        if (selectedRadio) {
          return selectedRadio.value;
        }
        return null;
      },
    };
  });
}
