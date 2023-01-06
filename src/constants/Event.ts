/**
 * @format
 */
import { ColumnDefinition } from '../components/DataGrid';

export enum EventType {
  ApplyOperations = 'ApplyOperations',
  CellActiveStateChange = 'CellActiveStateChange',
  CellEditMode = 'CellEditMode',
  CellValueChange = 'CellValueChange',
  CellValueChangeCommitted = 'CellValueChangeCommitted',
  CellViewMode = 'CellViewMode',
  FilterColumn = 'FilterColumn',
  ResizeColumn = 'ResizeColumn',
  ResizeColumnHandleClick = 'ResizeColumnHandleClick',
  Scrolling = 'Scrolling',
  SortColumn = 'SortColumn',
}

export type InternalEvent = `${EventType}_${number}`;

let counter = 0;
export function internalId(event: EventType): InternalEvent {
  return `${event}_${++counter}`;
}

export type EventTypeData = {
  [EventType.ApplyOperations]: undefined;
  [EventType.CellActiveStateChange]: CellActiveStateChangeEventData;
  [EventType.CellEditMode]: undefined;
  [EventType.CellValueChange]: undefined;
  [EventType.CellValueChangeCommitted]: undefined;
  [EventType.CellViewMode]: undefined;
  [EventType.FilterColumn]: FilterEventData;
  [EventType.ResizeColumn]: ResizeColumnEventData;
  [EventType.ResizeColumnHandleClick]: ResizeColumnClickEventData;
  [EventType.Scrolling]: ScrollingEventData;
  [EventType.SortColumn]: SortEventData;

  [key: InternalEvent]: unknown;
};

export type CellEvent<P> = {
  type: InternalEvent | EventType;
  data?: P;
};

export enum SortDirection {
  Asc = 'Asc',
  Desc = 'Desc',
  None = 'None',
}

export type CellActiveStateChangeEventData = {
  target: HTMLElement;
  deactivated: boolean;
};

export type ColumnEventData = {
  column: ColumnDefinition;
};

export type DataOperatorEvent = EventType.FilterColumn | EventType.SortColumn;

export type FilterEventData = {
  value: string;
  previousValue: string;
} & ColumnEventData;

export type ResizeColumnEventData = {
  width: string;
} & ColumnEventData;

export type ResizeColumnClickEventData = {
  active: boolean;
} & ColumnEventData;

export type ScrollingEventData = {
  stopped: boolean;
};

export type SortEventData = {
  sortDirection: SortDirection;
  previousSortDirection: SortDirection;
} & ColumnEventData;
