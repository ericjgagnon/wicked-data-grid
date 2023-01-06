import type * as CSS from 'csstype';
import { setStyleAttribute } from '../utils/DomUtil';
import DataGridBody from './DataGridBody';
import DataGridHeader from './DataGridHeader';
import { SortEventData } from '../constants/Event';
import BaseElement from '../BaseElement';
import { cssVariables, rowHeightVarName } from '../styles/styles';
import Context from '../context/Context2';

export type ColumnKey = string;

export type Option = [string, string];

export type BaseColumnDefinition = {
  columnKey: ColumnKey;
  editable: boolean;
  filterable: boolean;
  generator?: (rowId: number, cellId: number) => string;
  label: string;
  sortable: boolean;
  width?: CSS.PropertyValue<CSS.Property.Width>;
  wrap?: boolean;
};

export type BooleanColumnDefinition = {
  dataType: ColumnDataType.boolean;
  options: [Option, Option];
  defaultValue?: CellDataValue;
} & BaseColumnDefinition;

export type CustomColumnDefinition = {
  dataType: ColumnDataType.custom;
} & BaseColumnDefinition;

export type NumberColumnDefinition = {
  dataType: ColumnDataType.number;
  defaultValue?: CellDataValue;
} & BaseColumnDefinition;

export type TextColumnDefinition = {
  dataType: ColumnDataType.text;
} & BaseColumnDefinition;

export type SelectColumnDefinition = {
  dataType: ColumnDataType.select;
  options?: Option[];
  multiple?: boolean;
} & BaseColumnDefinition;

export type ViewOnlyColumnDefinition = {
  dataType: ColumnDataType.none;
} & BaseColumnDefinition;

export type ColumnDefinition =
  | BooleanColumnDefinition
  | CustomColumnDefinition
  | NumberColumnDefinition
  | TextColumnDefinition
  | SelectColumnDefinition
  | ViewOnlyColumnDefinition;

export enum ColumnDataType {
  boolean = 'boolean',
  select = 'select',
  text = 'text',
  number = 'number',
  none = 'none',
  custom = 'custom',
}

export type CellDataValue = string | null;

export type CellData = {
  columnKey: string;
  value: CellDataValue;
  options?: Option[];
  multiple?: boolean;
  rowIndex: string;
};

export type Data = Record<string, CellData>;

export type Theme = {
  gridHeight: CSS.PropertyValue<CSS.Property.Height>;
  gridWidth?: CSS.PropertyValue<CSS.Property.Width>;
  gridBorder?: CSS.Property.Border;
};

export const defaultTheme: Theme = {
  gridHeight: '100%',
  gridWidth: 'auto',
  gridBorder: '1px solid #babfc7',
};

export type DataGridOptions = {
  columns: ColumnDefinition[];
  data?: Data[] | null;
  theme: Theme;
  compare?: (
    value1: CellDataValue,
    value2: CellDataValue,
    sortConfig: SortEventData,
  ) => number;
};

class DataGrid extends Context.provider(BaseElement) {
  static localName = 'wicked-data-grid';

  static template = `
      ${cssVariables.outerHTML}
      <slot/>
  `;
  #columns: ColumnDefinition[] = [];
  #columnMap = new Map<string, ColumnDefinition>();
  #data?: Data[] | null;
  #gridHeight: CSS.PropertyValue<CSS.Property.Height> | null = null;
  #rowHeight: CSS.PropertyValue<CSS.Property.Height> | null = null;
  #theme: Theme;

  constructor({
    columns: providedColumns,
    data,
    theme: overriddenTheme = defaultTheme,
  }: DataGridOptions) {
    super(DataGrid.template);
    const includeRowNumberColumn = false;
    this.#data = data;
    this.#theme = { ...defaultTheme, ...overriddenTheme };
    setStyleAttribute(this, {
      border: this.#theme.gridBorder,
      display: 'flex',
      flexDirection: 'column',
      height: this.#theme.gridHeight,
      width: this.#theme.gridWidth,
    });

    if (includeRowNumberColumn) {
      this.#columns.push({
        dataType: ColumnDataType.number,
        columnKey: 'rowId',
        width: '100px',
        label: '#',
        editable: false,
        filterable: true,
        sortable: false,
        generator: (rowId) => String(rowId + 1),
      });
    }
    this.#columns.push(...providedColumns);
  }

  connectedCallback() {
    super.connectedCallback();
    const computedStyle = getComputedStyle(this);

    this.appendChild(new DataGridHeader());
    this.#gridHeight = this.#theme.gridHeight;
    this.#rowHeight = computedStyle.getPropertyValue(rowHeightVarName);
    const dataGridBody = new DataGridBody({
      data: this.#data,
    });
    this.appendChild(dataGridBody);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  resolveDependency(name: string): unknown {
    if (name.startsWith('column-')) {
      const columnKey = name.replace('column-', '');
      if (this.#columnMap.has(columnKey)) {
        return this.#columnMap.get(columnKey);
      }
      this.#columns.forEach((column) => {
        this.#columnMap.set(column.columnKey, column);
      });
      return this.#columnMap.get(columnKey);
    } else if (name === 'columns') {
      return this.#columns;
    } else if (name === 'gridHeight') {
      return this.#gridHeight;
    } else if (name === 'rowHeight') {
      return this.#rowHeight;
    }
    return super.resolveDependency(name);
  }
}

customElements.define(DataGrid.localName, DataGrid);
export default DataGrid;
