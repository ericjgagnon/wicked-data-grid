/**
 * @format
 */
import * as CSS from 'csstype';
import { CellDataValue } from '../DataGrid';
import { setStyleAttribute } from '../../utils/DomUtil';
import EventEmitter from '../../services/EventEmitter';
import { ModeChangePayload } from './SelectControl';
import { CellEvent, EventType, internalId } from '../../constants/Event';

type CellControlElement = Pick<
  HTMLElementTagNameMap,
  'div' | 'input' | 'select' | 'dropdown-menu'
>;

type CellControlTagName = keyof CellControlElement;

type CellControl<T extends CellControlTagName> = {
  element: CellControlElement[T];
  get value(): CellDataValue | null;
};

type SetupControl<T extends CellControlTagName> = (
  control: CellControlElement[T],
) => CellControl<T>;

type ViewMode = (value?: CellDataValue | null) => void;

function prepareHandleKeyboardEvents<T extends CellControlTagName>(
  control: CellControl<T>,
  viewMode: ViewMode,
) {
  return (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter': {
        return viewMode(control.value);
      }
      case 'Esc':
      case 'Escape': {
        return viewMode();
      }
      default:
        return;
    }
  };
}

function prepareHandleClickEvents<T extends CellControlTagName>(
  control: CellControl<T>,
  viewMode: ViewMode,
) {
  return (pointerEvent: MouseEvent) => {
    if (
      pointerEvent.target instanceof Node &&
      pointerEvent.target !== control.element
    ) {
      return viewMode(control.value);
    }
    return;
  };
}

export default function createControl<T extends CellControlTagName>(
  tagName: T,
  onModeChange: (event: CellEvent<ModeChangePayload>) => void,
  eventEmitter: EventEmitter,
  setUpControl: SetupControl<T>,
  additionalStyles: CSS.Properties = {},
): CellControlElement[T] {
  const element = document.createElement(tagName);
  setStyleAttribute(element, {
    height: '100%',
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    ...additionalStyles,
  });
  const control = setUpControl(element);

  const event = internalId(EventType.CellViewMode);
  const viewMode = (value?: CellDataValue | null) => {
    onModeChange({
      type: EventType.CellViewMode,
      data: {
        value,
      },
    });
    eventEmitter.emit(event, undefined);
  };
  const handleClickEvents = prepareHandleClickEvents(control, viewMode);
  document.addEventListener('click', handleClickEvents);

  const handleKeyboardEvents = prepareHandleKeyboardEvents(control, viewMode);
  document.addEventListener('keydown', handleKeyboardEvents);

  eventEmitter.once(event, () => {
    document.removeEventListener('click', handleClickEvents);
    document.removeEventListener('keydown', handleKeyboardEvents);
  });

  element.focus();

  return element;
}
