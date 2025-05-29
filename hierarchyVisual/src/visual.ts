/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private columnWidths: number[] | null = null; // Persist column widths across renders

    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);
        this.target.innerHTML = ""; // Clear previous content
        const dataView = options.dataViews && options.dataViews[0];
        if (!dataView || !dataView.categorical) {
            return;
        }
        // Extract all categories
        const categories = dataView.categorical.categories;
        // Find roles
        const parentidCat = categories.find(cat => cat.source.roles && cat.source.roles.parentid);
        const childidCat = categories.find(cat => cat.source.roles && cat.source.roles.childid);
        const displayValueCat = categories.find(cat => cat.source.roles && cat.source.roles.displayvalue);
        // All other categories are data fields
        const dataFieldCats = categories.filter(cat => cat.source.roles && cat.source.roles.datafield);
        if (!parentidCat || !childidCat || !displayValueCat) {
            this.target.innerText = "Please provide Parent ID, Child ID, and Display Value fields.";
            return;
        }
        // Build flat data array
        const data = [];
        const rowCount = categories[0].values.length;
        for (let i = 0; i < rowCount; i++) {
            const row: any = {};
            categories.forEach(cat => {
                // Use the role name as the key for each value
                if (cat.source.roles.parentid) row.parentid = cat.values[i];
                else if (cat.source.roles.childid) row.childid = cat.values[i];
                else if (cat.source.roles.displayvalue) row.displayvalue = cat.values[i];
                // For data fields, use the displayName as the key
                else if (cat.source.roles.datafield) row[cat.source.displayName] = cat.values[i];
            });
            data.push(row);
        }
        // Group by parentid/childid
        const groupMap = new Map();
        data.forEach(row => {
            const key = `${row.parentid}|${row.childid}`;
            if (!groupMap.has(key)) groupMap.set(key, []);
            groupMap.get(key).push(row);
        });
        // Create group nodes
        const nodes = Array.from(groupMap.entries()).map(([key, groupRows]) => {
            const { parentid, childid } = groupRows[0];
            return {
                parentid,
                childid,
                groupRows,
                children: []
            };
        });
        // Map childid to node
        const nodeMap = new Map();
        nodes.forEach(n => nodeMap.set(n.childid, n));
        // Build tree
        let roots = [];
        nodes.forEach(n => {
            if (nodeMap.has(n.parentid)) {
                nodeMap.get(n.parentid).children.push(n);
            } else {
                roots.push(n);
            }
        });
        // Render tree as a table
        const container = document.createElement('div');
        container.style.overflow = 'auto';
        container.style.height = '100%';
        container.style.maxHeight = '100%';
        container.style.width = '100%';
        // Enable horizontal scroll for wide tables
        container.style.whiteSpace = 'nowrap';
        const table = document.createElement('table');
        // Remove table width so it doesn't stretch to fill the container
        table.style.width = 'auto';
        table.style.borderCollapse = 'collapse';
        table.style.tableLayout = 'fixed'; // Keep strict column sizing
        table.className = 'custom-hierarchy-table';
        const thead = document.createElement('thead');
        const header = document.createElement('tr');
        // Use all category display names except parentid/childid for columns
        const allHeaders = categories.filter(cat => !cat.source.roles.parentid && !cat.source.roles.childid).map(cat => cat.source.displayName);
        const displayHeader = document.createElement('th');
        displayHeader.textContent = displayValueCat.source.displayName;
        displayHeader.className = 'custom-table-header';
        displayHeader.style.width = '50px'; // Set default width
        displayHeader.style.overflow = 'hidden';
        displayHeader.style.whiteSpace = 'nowrap';
        displayHeader.style.textOverflow = 'ellipsis';
        header.appendChild(displayHeader);
        // For the last data field header, set a fixed width (e.g. 50px) instead of 1px or blank, so it doesn't stretch or collapse, and whitespace will appear to the right if the table is narrower than the component
        allHeaders.forEach((name, i) => {
            if (name !== displayValueCat.source.displayName) {
                const th = document.createElement('th');
                th.textContent = name;
                th.className = 'custom-table-header';
                th.style.overflow = 'hidden';
                th.style.whiteSpace = 'nowrap';
                th.style.textOverflow = 'ellipsis';
                th.style.width = '120px'; // Set a reasonable default width for all columns
                header.appendChild(th);
            }
        });
        thead.appendChild(header);
        table.appendChild(thead);
        // Helper to truncate text with ellipsis if too long for cell
        function truncateTextToWidth(cell: HTMLTableCellElement, text: string) {
            // Remove previous content
            cell.textContent = '';
            if (typeof text !== 'string') text = String(text ?? '');
            // Temporarily set full text
            cell.textContent = text;
            // If it fits, return
            if (cell.scrollWidth <= cell.clientWidth) {
                return;
            }
            // Otherwise, truncate
            let truncated = text;
            while (truncated.length > 0 && cell.scrollWidth > cell.clientWidth) {
                truncated = truncated.slice(0, -1);
                cell.textContent = truncated + '...';
            }
        }
        // Track expanded/collapsed state by childid
        const expandedState = {};
        // By default, expand all root nodes
        roots.forEach(root => expandedState[root.childid] = true);

        function applyColumnWidths(table, widths) {
            if (!widths) return;
            const ths = table.querySelectorAll('th');
            ths.forEach((th, i) => {
                if (widths[i] !== undefined) {
                    th.style.width = widths[i] + 'px';
                    th.style.minWidth = widths[i] + 'px';
                    th.style.maxWidth = widths[i] + 'px';
                }
            });
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                cells.forEach((cell, i) => {
                    if (widths[i] !== undefined) {
                        cell.style.width = widths[i] + 'px';
                        cell.style.minWidth = widths[i] + 'px';
                        cell.style.maxWidth = widths[i] + 'px';
                    }
                });
            });
        }

        const self = this;
        function renderTable() {
            // Clear table except header
            while (table.rows.length > 1) table.deleteRow(1);
            roots.forEach(root => renderNode(root));
            // Only measure widths after all rows are rendered
            let ths = table.querySelectorAll('th');
            if (!self.columnWidths) {
                self.columnWidths = Array.from(ths).map(th => (th as HTMLElement).offsetWidth);
            }
            // Always reapply stored column widths
            applyColumnWidths(table, self.columnWidths);
        }

        // Modified renderNode to support expand/collapse
        const renderNode = (node, level = 0) => {
            const isGroup = node.children && node.children.length > 0;
            // const isExpanded = expandedState[node.childid] !== false; // COMMENT OUT expand/collapse
            node.groupRows.forEach((row, rowIdx) => {
                const tr = document.createElement('tr');
                const tdDisplay = document.createElement('td');
                tdDisplay.style.paddingLeft = `${level * 24 + 8}px`;
                tdDisplay.style.overflow = 'hidden';
                tdDisplay.style.whiteSpace = 'nowrap';
                tdDisplay.style.textOverflow = 'ellipsis';
                tdDisplay.title = row.displayvalue;
                // --- Expand/collapse button or spacer (always rendered for alignment) ---
                /*
                if (isGroup && rowIdx === 0) {
                    const toggleBtn = document.createElement('span');
                    toggleBtn.style.display = 'inline-block';
                    toggleBtn.style.width = '16px';
                    toggleBtn.style.height = '16px';
                    toggleBtn.style.marginRight = '2px';
                    toggleBtn.style.cursor = 'pointer';
                    toggleBtn.style.userSelect = 'none';
                    toggleBtn.textContent = isExpanded ? '[-]' : '[+]';
                    toggleBtn.onclick = (e) => {
                        expandedState[node.childid] = !isExpanded;
                        renderTable();
                    };
                    tdDisplay.appendChild(toggleBtn);
                } else
                */
                if (isGroup) {
                    // Spacer for alignment if not first row in group
                    const btnSpacer = document.createElement('span');
                    btnSpacer.style.display = 'inline-block';
                    btnSpacer.style.width = '16px';
                    btnSpacer.style.height = '16px';
                    btnSpacer.style.marginRight = '2px';
                    tdDisplay.appendChild(btnSpacer);
                } else if (level > 0) {
                    // For non-group indented rows, add a spacer
                    const btnSpacer = document.createElement('span');
                    btnSpacer.style.display = 'inline-block';
                    btnSpacer.style.width = '16px';
                    btnSpacer.style.height = '16px';
                    btnSpacer.style.marginRight = '2px';
                    tdDisplay.appendChild(btnSpacer);
                }
                // --- L icon or spacer (always rendered for alignment) ---
                if (rowIdx === 0 && level > 0) {
                    const lIcon = document.createElement('span');
                    lIcon.style.display = 'inline-block';
                    lIcon.style.verticalAlign = 'middle';
                    lIcon.style.width = '16px';
                    lIcon.style.height = '16px';
                    lIcon.style.marginRight = '4px';
                    lIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" style="display:block"><path d="M4 0 v12 h8" stroke="#444" stroke-width="2" fill="none"/></svg>`;
                    tdDisplay.appendChild(lIcon);
                } else if (level > 0) {
                    // Spacer for alignment if not first row in group
                    const lSpacer = document.createElement('span');
                    lSpacer.style.display = 'inline-block';
                    lSpacer.style.width = '16px';
                    lSpacer.style.height = '16px';
                    lSpacer.style.marginRight = '4px';
                    tdDisplay.appendChild(lSpacer);
                }
                // --- Render display value as text (or hyperlink if you want, see previous requests) ---
                tdDisplay.appendChild(document.createTextNode(row.displayvalue));
                tr.appendChild(tdDisplay);
                allHeaders.forEach((name, i) => {
                    if (name !== displayValueCat.source.displayName) {
                        const td = document.createElement('td');
                        td.style.overflow = 'hidden';
                        td.style.whiteSpace = 'nowrap';
                        td.style.textOverflow = 'ellipsis';
                        td.style.width = '120px';
                        td.title = row[name];
                        // --- Render as image if value looks like a base64 image ---
                        if (typeof row[name] === 'string' && row[name].match(/^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,/)) {
                            const img = document.createElement('img');
                            img.src = row[name];
                            img.alt = name;
                            img.style.maxWidth = '100px';
                            img.style.maxHeight = '40px';
                            img.style.display = 'block';
                            img.style.margin = '0 auto';
                            td.appendChild(img);
                        } else {
                            td.textContent = row[name];
                        }
                        tr.appendChild(td);
                    }
                });
                table.appendChild(tr);
            });
            // Only render children if expanded
            /*
            if (isGroup && isExpanded) {
                node.children.forEach(child => renderNode(child, level + 1));
            }
            */
            // Instead, always render all children
            if (isGroup) {
                node.children.forEach(child => renderNode(child, level + 1));
            }
        };

        renderTable();
        // Add column resizing functionality
        // In makeResizable, update columnWidths and reapply to all cells after resize
        function makeResizable(table) {
            table.style.tableLayout = 'fixed';
            const ths = table.querySelectorAll('th');
            let startX, startWidth, th, colIdx;
            ths.forEach((header, idx) => {
                header.style.position = 'relative';
                header.style.overflow = 'hidden';
                header.style.whiteSpace = 'nowrap';
                header.style.textOverflow = 'ellipsis';
                header.style.minWidth = '1px';
                const resizer = document.createElement('div');
                resizer.style.position = 'absolute';
                resizer.style.right = '0';
                resizer.style.top = '0';
                resizer.style.width = '8px';
                resizer.style.height = '100%';
                resizer.style.cursor = 'col-resize';
                resizer.style.userSelect = 'none';
                resizer.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    th = header;
                    colIdx = idx;
                    startX = e.pageX;
                    startWidth = th.offsetWidth;
                    document.body.style.cursor = 'col-resize';
                    document.addEventListener('mousemove', mousemove);
                    document.addEventListener('mouseup', mouseup);
                });
                header.appendChild(resizer);
            });
            const self = this;
            function mousemove(e) {
                if (!th) return;
                const newWidth = Math.max(1, startWidth + (e.pageX - startX));
                if (!self.columnWidths) {
                    self.columnWidths = Array.from(table.querySelectorAll('th')).map(th => (th as HTMLElement).offsetWidth);
                }
                self.columnWidths[colIdx] = newWidth;
                applyColumnWidths(table, self.columnWidths);
            }
            function mouseup() {
                document.body.style.cursor = '';
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('mouseup', mouseup);
                th = null;
            }
        }
        makeResizable.call(this, table);
        container.appendChild(table);
        this.target.appendChild(container);
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        // Rollback: Remove any reference to conditionalFormattingCard, just return the formatting model for dataPointCard only
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}