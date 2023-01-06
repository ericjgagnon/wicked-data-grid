/**
 * @format
 */
import { describe, expect, test } from 'vitest';
import SortDataOperator from '../SortDataOperator';
import EventEmitter from '../../services/EventEmitter';
import {
  BooleanColumnDefinition,
  ColumnDataType,
  Data,
  NumberColumnDefinition,
  TextColumnDefinition,
} from '../../components/DataGrid';
import { SortDirection, SortEventData } from '../../constants/Event';

const eventEmitter = new EventEmitter();
const sortDataOperator = new SortDataOperator(eventEmitter);

let rowIndex = 0;
function createRow(name: string, age: number, isAdmin: boolean): Data {
  return {
    name: {
      columnKey: 'name',
      value: name,
      rowIndex: `${rowIndex}`,
    },
    age: {
      columnKey: 'age',
      value: `${age}`,
      rowIndex: `${rowIndex}`,
    },
    isAdmin: {
      columnKey: 'isAdmin',
      value: `${isAdmin}`,
      rowIndex: `${rowIndex++}`,
    },
  };
}

const nameColumn: TextColumnDefinition = {
  columnKey: 'name',
  dataType: ColumnDataType.text,
  label: 'Name',
  columnIndex: '0',
  editable: false,
  filterable: true,
};

const ageColumn: NumberColumnDefinition = {
  columnKey: 'age',
  dataType: ColumnDataType.number,
  label: 'Age',
  columnIndex: '1',
  editable: false,
  filterable: true,
};

const isAdminColumn: BooleanColumnDefinition = {
  columnKey: 'isAdmin',
  dataType: ColumnDataType.boolean,
  label: 'Is Admin?',
  columnIndex: '2',
  editable: false,
  filterable: true,
  options: [
    ['Yes', 'Yes'],
    ['No', 'No'],
  ],
};

describe('SortDataOperator', () => {
  const data = [
    createRow('Sam Adams', 20, false),
    createRow('Sam Adamas', 18, true),
    createRow('Sam Adames', 17, false),
  ];
  describe('single column sort', () => {
    test('it sorts a single column ascending', () => {
      const sortEvent: SortEventData = {
        column: nameColumn,
        sortDirection: SortDirection.Asc,
        previousSortDirection: SortDirection.None,
      };

      sortDataOperator.addEvent(sortEvent);

      const sortedIndexes = sortDataOperator.apply(data, [...data.keys()]);
      expect(sortedIndexes).toEqual([1, 2, 0]);
    });

    test('it sorts a single column descending', () => {
      const sortEvent: SortEventData = {
        column: nameColumn,
        sortDirection: SortDirection.Desc,
        previousSortDirection: SortDirection.None,
      };

      sortDataOperator.addEvent(sortEvent);

      const sortedIndexes = sortDataOperator.apply(data, [...data.keys()]);
      expect(sortedIndexes).toEqual([0, 2, 1]);
    });
  });

  describe('two column sort', () => {
    test('it sorts a two columns ascending', () => {
      const sortEvent1: SortEventData = {
        column: isAdminColumn,
        sortDirection: SortDirection.Asc,
        previousSortDirection: SortDirection.None,
      };

      const sortEvent2: SortEventData = {
        column: ageColumn,
        sortDirection: SortDirection.Asc,
        previousSortDirection: SortDirection.None,
      };

      sortDataOperator.addEvent(sortEvent1);
      sortDataOperator.addEvent(sortEvent2);

      const sortedIndexes = sortDataOperator.apply(data, [...data.keys()]);
      expect(sortedIndexes).toEqual([2, 0, 1]);
    });
  });
});
