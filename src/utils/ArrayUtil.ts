/**
 * @format
 */
import { ColumnDataType } from '../components/DataGrid';
import { SortDirection, SortEventData } from '../constants/Event';
import {
  isBool,
  isNumber,
  isString,
  stringContainsBool,
  stringContainsNumber,
} from './TypeUtils';

// Exporting for more expressive testing

export enum ComparisonResult {
  AFTER = 1,
  EQUAL = 0,
  BEFORE = -1,
}

const booleanMapping: Record<string, boolean> = {
  false: false,
  no: false,
  true: true,
  yes: true,
};

function compareBool<T>(value1: T, value2: T) {
  const boolCellValue1 = Boolean(
    isString(value1) ? booleanMapping[value1.toLocaleLowerCase()] : value1,
  );
  const boolCellValue2 = Boolean(
    isString(value2) ? booleanMapping[value2.toLocaleLowerCase()] : value2,
  );
  return boolCellValue1 === boolCellValue2
    ? ComparisonResult.EQUAL
    : boolCellValue1 && !boolCellValue2
    ? ComparisonResult.BEFORE
    : ComparisonResult.AFTER;
}

function compareString<T>(value1: T & string, value2: T & string) {
  return value1.localeCompare(value2);
}

function compareNumber<T>(value1: T, value2: T) {
  const numCellValue1 = Number(value1);
  const numCellValue2 = Number(value2);
  return numCellValue1 - numCellValue2;
}

type Comparator<T> = (value1: T, value2: T) => number;

function sort<T>(
  sortEvent: SortEventData,
  customTypeCompare?: (
    value1: T,
    value2: T,
    dataType: ColumnDataType,
  ) => number,
) {
  const {
    column: { dataType },
    sortDirection,
  } = sortEvent;
  return (value1: T, value2: T) => {
    const sortModifier = sortDirection === SortDirection.Asc ? 1 : -1;
    return (
      compare(dataType, customTypeCompare).call(null, value1, value2) *
      sortModifier
    );
  };
}

function compare<T>(
  dataType: ColumnDataType,
  compare?: (value1: T, value2: T, dataType: ColumnDataType) => number,
): Comparator<T> {
  return (value1: T, value2: T) => {
    if (value1 === null || value1 === undefined) {
      return ComparisonResult.AFTER;
    }
    if (value2 === null || value2 === undefined) {
      return ComparisonResult.BEFORE;
    }

    if (
      ColumnDataType.text.includes(dataType) &&
      isString(value1) &&
      isString(value2)
    ) {
      return compareString(value1, value2);
    } else if (ColumnDataType.boolean === dataType) {
      return compareBool(value1, value2);
    } else if (ColumnDataType.number === dataType) {
      return compareNumber(value1, value2);
    } else if (ColumnDataType.select === dataType) {
      const areStrings = isString(value1) && isString(value2);
      const areNumbers =
        (stringContainsNumber(value1) && stringContainsNumber(value2)) ||
        (isNumber(value1) && isNumber(value2));
      const areBools =
        (isBool(value1) && isBool(value2)) ||
        (stringContainsBool(value1) && stringContainsBool(value2));

      if (areNumbers) {
        return compareNumber(value1, value2);
      }

      if (areBools) {
        return compareBool(value1, value2);
      }

      if (areStrings) {
        return compareString(value1, value2);
      }
      throw new Error(
        `Unable to compare ${value1} with ${value2} using data type ${dataType}`,
      );
    } else if (ColumnDataType.custom === dataType && compare) {
      return compare(value1, value2, dataType);
    }
    throw new Error(
      `Unable to compare ${value1} with ${value2} using data type ${dataType}`,
    );
  };
}

export { compare, sort };
