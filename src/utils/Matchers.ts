/**
 * @format
 */
import { ColumnDataType, ColumnDefinition, Data } from '../components/DataGrid';
import { compare } from './ArrayUtil';
import { Matched, WeightedSearch } from './FuncUtils';

export type WeightedMatcher<T> = {
  (
    data: Data[],
    column: ColumnDefinition,
    searchTerm: string,
  ): WeightedSearch<T>;
};

function createWeightedMatcher(
  compare: (
    column: ColumnDefinition,
    searchTerm: string,
    value: string,
  ) => Matched,
  weight: number,
): WeightedMatcher<number> {
  return (data: Data[], column: ColumnDefinition, searchTerm: string) => {
    const weightedSearch = function (rowIndex: number) {
      const cellValue =
        data[rowIndex][column.columnKey]?.value ??
        column.generator?.call(
          column.generator,
          rowIndex,
          Number(column.columnIndex),
        );
      if (cellValue) {
        return compare(column, searchTerm, cellValue);
      }
      return 0;
    };
    weightedSearch.weight = weight;
    return weightedSearch as WeightedSearch<number>;
  };
}

const startsWithMatch = createWeightedMatcher((column, searchTerm, value) => {
  if (column.dataType !== ColumnDataType.text) {
    throw new Error(
      `Starts with comparison doesn't apply to data type ${column.dataType}`,
    );
  }
  return value.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase())
    ? 1
    : 0;
}, 1);

const exactMatch = createWeightedMatcher((column, searchTerm, value) => {
  const delta = compare(column.dataType)(searchTerm, value);
  return delta === 0 ? 1 : 0;
}, 2);

const compose = <T>(
  matcher1: WeightedSearch<T>,
  matcher2: WeightedSearch<T>,
): WeightedSearch<T> => {
  const composed = (item: T) => matcher1(item) || matcher2(item);
  composed.weight = matcher1.weight + matcher2.weight;
  return composed;
};

export { compose, exactMatch, startsWithMatch };
