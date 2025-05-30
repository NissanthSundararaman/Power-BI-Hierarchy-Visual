// ...existing code...
export class Visual implements IVisual {
    // ...existing code...
    public update(options: VisualUpdateOptions) {
        // --- CONDITIONAL FORMATTING: Highlight row if it matches ---
        const cfCard = this.formattingSettings?.conditionalFormattingCard;
        // Extract all categories
        const dataView = options.dataViews && options.dataViews[0];
        if (!dataView || !dataView.categorical) {
            this.target.innerText = "No data available.";
            return;
        }
        const categories = dataView.categorical.categories;
        // Find roles
        const parentidCat = categories.find(cat => cat.source.roles && cat.source.roles.parentid);
        const childidCat = categories.find(cat => cat.source.roles && cat.source.roles.childid);
        const displayValueCat = categories.find(cat => cat.source.roles && cat.source.roles.displayvalue);
        // All other categories are data fields
        const dataFieldCats = categories.filter(cat => cat.source.roles && cat.source.roles.datafield);
        // --- CONDITIONAL FORMATTING: Get all headers (excluding parentid/childid) ---
        const allHeaders = categories.filter(cat => !cat.source.roles.parentid && !cat.source.roles.childid).map(cat => cat.source.displayName);
        function isNumberLike(x: any) {
            return x !== null && x !== undefined && !isNaN(Number(x));
        }
        function isBooleanLike(x: any): boolean {
            if (typeof x === 'boolean') return true;
            if (typeof x === 'number') return x === 1 || x === 0;
            if (typeof x === 'string') {
                const v = x.trim().toLowerCase();
                return v === 'true' || v === 'false' || v === 'yes' || v === 'no' || v === '1' || v === '0';
            }
            return false;
        }
        function parseBoolean(x: any): boolean | undefined {
            if (typeof x === 'boolean') return x;
            if (typeof x === 'number') return x === 1;
            if (typeof x === 'string') {
                const v = x.trim().toLowerCase();
                if (v === 'true' || v === 'yes' || v === '1') return true;
                if (v === 'false' || v === 'no' || v === '0') return false;
            }
            return undefined;
        }
        function rowMatchesCondition(row: any): boolean {
            if (!cfCard || cfCard.enable.value !== true || !cfCard.column.value || !cfCard.operator.value || !cfCard.value.value) return false;
            // Use normalized column name for matching
            let col = cfCard.column.value ? String(cfCard.column.value) : "";
            let actualCol = allHeaders.find(h => h.trim().toLowerCase() === col.trim().toLowerCase());
            if (!actualCol) return false;
            // Accept operator as a string (case-insensitive, supports symbols and words)
            const opRaw = cfCard.operator.value ? String(cfCard.operator.value.value).trim().toLowerCase() : "";
            const val = cfCard.value.value;
            const cell = row[actualCol];
            if (cell === undefined || cell === null) return false;
            // Try boolean comparison first
            if (isBooleanLike(cell) && isBooleanLike(val)) {
                const cellBool = parseBoolean(cell);
                const valBool = parseBoolean(val);
                if (cellBool === undefined || valBool === undefined) return false;
                switch (opRaw) {
                    case "equals":
                        return cellBool === valBool;
                    case "notequals":
                        return cellBool !== valBool;
                    default:
                        return false;
                }
            }
            // Then try number comparison
            if (isNumberLike(cell) && isNumberLike(val)) {
                const cellNum = Number(cell);
                const valNum = Number(val);
                switch (opRaw) {
                    case "equals":
                        return cellNum === valNum;
                    case "notequals":
                        return cellNum !== valNum;
                    case "greaterthan":
                        return cellNum > valNum;
                    case "lessthan":
                        return cellNum < valNum;
                    case "greaterthanorequal":
                        return cellNum >= valNum;
                    case "lessthanorequal":
                        return cellNum <= valNum;
                    default:
                        return false;
                }
            }
            // Fallback to string comparison
            const cellStr = String(cell);
            const valStr = String(val);
            switch (opRaw) {
                case "equals":
                    return cellStr === valStr;
                case "notequals":
                    return cellStr !== valStr;
                case "contains":
                    return cellStr.toLowerCase().includes(valStr.toLowerCase());
                case "notcontains":
                    return !cellStr.toLowerCase().includes(valStr.toLowerCase());
                default:
                    return false;
            }
        }
        // ...existing code...
    }
    // ...existing code...
}