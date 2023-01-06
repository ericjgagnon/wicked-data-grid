/**
 * @format
 */
import { describe, test, expect } from 'vitest';
import Cell, { InteractionMode } from '../Cell';
import { ColumnDataType } from '../DataGrid';

describe('Cell', () => {
  test('clicking the cell marks it as active', () => {
    const cell = new Cell(
      {
        value: 'Test',
        columnKey: 'testColumn',
        rowIndex: '0',
      },
      {
        label: 'Test Column',
        columnKey: 'testColumn',
        columnIndex: '0',
        dataType: ColumnDataType.text,
        filterable: true,
        editable: true,
      },
    );
    document.body.appendChild(cell);
    cell.click();
    expect(cell.active).toBe(true);
  });

  test('double clicking the cell makes it editable', () => {
    const cell = new Cell(
      {
        value: 'Test',
        columnKey: 'testColumn',
        rowIndex: '0',
      },
      {
        label: 'Test Column',
        columnKey: 'testColumn',
        columnIndex: '0',
        dataType: ColumnDataType.text,
        filterable: true,
        editable: true,
      },
    );
    document.body.appendChild(cell);
    const doubleClickEvent = new MouseEvent('dblclick', {
      cancelable: true,
      bubbles: true,
    });
    cell.dispatchEvent(doubleClickEvent);
    expect(cell.mode).toBe(InteractionMode.EDIT);
  });
});
