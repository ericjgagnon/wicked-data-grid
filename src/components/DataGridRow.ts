import BaseElement from '../BaseElement';
import { rowStyle } from '../styles/styles';
import { ColumnDefinition } from './DataGrid';
import Context from '../context/Context2';

type CellBuilder = (column: ColumnDefinition, index: number) => HTMLElement;

class DataGridRow extends Context.consumer(BaseElement) {
  static template = `
    ${rowStyle.outerHTML}
    <slot/>
  `;
  #cellBuilder: CellBuilder;

  constructor(cellBuilder: CellBuilder) {
    super(DataGridRow.template);
    this.#cellBuilder = cellBuilder;
  }

  connectedCallback() {
    super.connectedCallback();
    const columns = this.request<ColumnDefinition[]>('columns');
    columns.forEach((column, index) => {
      this.appendChild(this.#cellBuilder(column, index));
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

customElements.define('wicked-grid-row', DataGridRow);

export default DataGridRow;
