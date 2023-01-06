import { createStyles } from '../utils/DomUtil';

const rowHeightVarName = '--wicked-row-height';

const cssVariables = createStyles(`
    :host {
        ${rowHeightVarName}: 45px;
        --wicked-row-border: 1px solid #d9dcde;
        --wicked-header-cell-background: #f8f8f8;
        --wicked-data-cell-padding: 0 18px;
        --wicked-data-cell-text-overflow: ellipsis;
        --wicked-data-cell-active-border: 1px solid #0091ea;
    }
`);

const headerCellStyle = createStyles(
  `
    :host {
        position: relative;
        font-weight: bold;
        background: var(--wicked-header-cell-background);
        cursor: default;
        border: 1px solid transparent;
        user-select: none;
        text-align: left;
        will-change: width;
        box-sizing: border-box;
        padding: var(--wicked-data-cell-padding);
        height: var(${rowHeightVarName});
        line-height: var(${rowHeightVarName});
    }
    
    .header-cell-resize-handle::after {
        content: '';
        position: absolute;
        z-index: 1;
        display: block;
        width: 2px;
        height: 50%;
        top: 25%;
        right: 0;
        background-color: rgba(189, 195, 199, 0.5);
        cursor: col-resize;
    }
`,
  cssVariables,
);
const cellDataStyle = createStyles(
  `
    :host {
        display: block;
        border: 1px solid transparent;
        user-select: none;
        text-align: left;
        cursor: cell;
        will-change: width;
        box-sizing: border-box;
        padding: var(--wicked-data-cell-padding);
        height: var(${rowHeightVarName});
        line-height: var(${rowHeightVarName});
    }
    
    :host([wrap="false"]) {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: var(--wicked-data-cell-text-overflow);
    }
    
    :host([active="true"]) {
        border: var(--wicked-data-cell-active-border);
    }
    
    :host(.cell-edit-mode) {
        text-overflow: clip;
    }
`,
  cssVariables,
);

const rowStyle = createStyles(
  `
    :host {
        display: flex;
        height: var(${rowHeightVarName});
        border-top: var(--wicked-row-border);
        box-sizing: border-box;
        position: relative;
    }
    
    :host-context(wicked-grid-header) {
        background-color: var(--wicked-header-cell-background);
    }
    
    :host-context(wicked-grid-body):hover {
        background-color: rgba(33, 150, 243, 0.1);
    }
    
    .no-data-row {
        flex-grow: 1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
`,
  cssVariables,
);

export {
  cellDataStyle,
  cssVariables,
  headerCellStyle,
  rowHeightVarName,
  rowStyle,
};
