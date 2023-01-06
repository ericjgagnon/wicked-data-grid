/**
 * @format
 */
import { describe, test, expect } from 'vitest';
import * as Matchers from '../Matchers';
import {
  BooleanColumnDefinition,
  ColumnDataType,
  Data,
  NumberColumnDefinition,
  TextColumnDefinition,
} from '../../components/DataGrid';

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

const data: Data[] = [
  createRow('Bob', 24, false),
  createRow('Jimmy', 14, false),
  createRow('Sue', 40, true),
  createRow('Hannah', 8, false),
  createRow('Bobby', 65, true),
];

describe('Matchers', () => {
  test('exact matches requires an exact match', () => {
    let matched = Matchers.exactMatch(data, nameColumn, 'Bob')(0);
    expect(matched).toBe(1);

    matched = Matchers.exactMatch(data, nameColumn, 'Bo')(0);
    expect(matched).toBe(1);
  });

  test('starts with match matches the starting characters', () => {
    let matched = Matchers.startsWithMatch(data, nameColumn, 'Bob')(0);
    expect(matched).toBe(1);

    matched = Matchers.startsWithMatch(data, nameColumn, 'Bo')(0);
    expect(matched).toBe(0);
    expect(matched);
  });

  test('starts with match matches the starting characters', () => {
    expect(() => Matchers.startsWithMatch(data, ageColumn, 'Bo')(0)).toThrow();
    expect(() =>
      Matchers.startsWithMatch(data, isAdminColumn, 'Bo')(2),
    ).toThrow();
  });

  test('compose combines two weighted search criteria', () => {
    const exactOrStartsWith = Matchers.compose(
      Matchers.exactMatch(data, nameColumn, 'Bob'),
      Matchers.startsWithMatch(data, nameColumn, 'Bo'),
    );
    expect(exactOrStartsWith(0)).toBe(0);
  });
});
