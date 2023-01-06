/**
 * @format
 */
import { describe, test, expect } from 'vitest';
import { ComparisonResult, sort } from '../ArrayUtil';
import { SortDirection } from '../../constants/Event';
import { ColumnDataType, ColumnDefinition } from '../../components/DataGrid';
const sortConfig = (dataType: ColumnDataType, sortDirection: SortDirection) => {
  const columnDef = {
    label: 'Test',
    dataType: dataType,
    columnKey: 'test',
    columnIndex: '0',
  } as ColumnDefinition;
  return {
    column: columnDef,
    sortDirection,
    previousSortDirection: SortDirection.None,
  };
};

describe('ArrayUtils', () => {
  describe.each([
    {
      sortDirection: SortDirection.Asc,
      expectation1: ComparisonResult.AFTER,
      expectation2: ComparisonResult.BEFORE,
    },
    {
      sortDirection: SortDirection.Desc,
      expectation1: ComparisonResult.BEFORE,
      expectation2: ComparisonResult.AFTER,
    },
  ])('sort', ({ sortDirection, expectation1, expectation2 }) => {
    describe(`sort ${sortDirection}`, () => {
      test(`it returns ${ComparisonResult[expectation1]} when the first value is null or undefined`, () => {
        const order = sort(sortConfig(ColumnDataType.text, sortDirection))(
          null,
          '1',
        );
        expect(order).toBe(expectation1);
      });

      test(`it returns ${ComparisonResult[expectation2]} when the second value is null or undefined`, () => {
        const order = sort(sortConfig(ColumnDataType.text, sortDirection))(
          '1',
          null,
        );
        expect(order).toBe(expectation2);
      });

      test(`it returns ${ComparisonResult[expectation1]} when comparing text types as strings`, () => {
        const order = sort(sortConfig(ColumnDataType.text, sortDirection))(
          'b',
          'a',
        );
        expect(order).toBe(expectation1);
      });

      test(`it returns ${ComparisonResult[expectation2]} when comparing number types as numbers`, () => {
        const order = sort(sortConfig(ColumnDataType.number, sortDirection))(
          1,
          2,
        );
        expect(order).toBe(expectation2);
      });

      test(`it returns ${ComparisonResult[expectation1]} when comparing select types with strings`, () => {
        const order = sort(sortConfig(ColumnDataType.select, sortDirection))(
          'z',
          'd',
        );
        expect(order).toBe(expectation1);
      });

      test(`it returns ${ComparisonResult[expectation2]} when comparing select types with numbers`, () => {
        const order = sort(sortConfig(ColumnDataType.select, sortDirection))(
          19,
          20,
        );
        expect(order).toBe(expectation2);
      });

      test(`it returns ${ComparisonResult[expectation2]} select types with number strings`, () => {
        const order = sort(sortConfig(ColumnDataType.select, sortDirection))(
          '19',
          '20',
        );
        expect(order).toBe(expectation2);
      });

      test(`it returns ${ComparisonResult[expectation1]} when comparing select types with booleans`, () => {
        const order = sort(sortConfig(ColumnDataType.select, sortDirection))(
          false,
          true,
        );
        expect(order).toBe(expectation1);
      });

      test(`it returns ${ComparisonResult[expectation2]} when comparing select types with boolean strings`, () => {
        const order = sort(sortConfig(ColumnDataType.select, sortDirection))(
          'true',
          'false',
        );
        expect(order).toBe(expectation2);
      });
    });
  });
});
