
// this is just experimental, not used anywhere
export function getCellValue(cell) {
    const value = cell.value;

    // Empty cell
    if (value === null || value === undefined) {
        return "";
    }

    // Formula cell
    if (typeof value === "object" && value.formula !== undefined) {
        // ExcelJS stores the calculated/cached value here
        return value.result ?? "";
    }

    // Rich text
    if (typeof value === "object" && value.richText) {
        return value.richText
            .map((item) => item.text)
            .join("");
    }

    // Hyperlink
    if (typeof value === "object" && value.text !== undefined) {
        return value.text;
    }

    // Date
    if (value instanceof Date) {
        return value;
    }

    console.log(value);

    // Normal string / number / boolean
    return value;
}