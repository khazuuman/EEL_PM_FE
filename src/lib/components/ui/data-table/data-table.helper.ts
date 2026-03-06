import { getLocalStorageItem, setLocalStorageItem } from '$lib/utils.js';
import { EyeIcon, RefreshCcwIcon, Trash2Icon } from '@lucide/svelte';

export const ACTIONS = {
	VIEW_DETAILS: {},
	UPDATE: {},
	DELETE: {}
};

export const getAction = (action: string) => {
	switch (action) {
		case 'view': {
			return {
				label: 'View details',
				icon: EyeIcon
			};
		}
		case 'update': {
			return {
				label: 'Update',
				icon: RefreshCcwIcon
			};
		}

		case 'delete': {
			return {
				label: 'Delete',
				icon: Trash2Icon
			};
		}
	}
};
// Function để lấy dữ liệu từ nested keys (ví dụ: "teacher.name")
function getNestedValue(obj: any, path: string): any {
	return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

export function trackFocus(node: HTMLElement, setIsFocused: (focused: boolean) => void) {
	const handleFocus = () => setIsFocused(true);
	const handleBlur = () => setIsFocused(false);

	node.addEventListener('focus', handleFocus);
	node.addEventListener('blur', handleBlur);

	return {
		destroy() {
			node.removeEventListener('focus', handleFocus);
			node.removeEventListener('blur', handleBlur);
		}
	};
}
export function getInitialHeaders(cacheKeyName: string, defaultHeaders: string[]): string[] {
	const cached = getLocalStorageItem(`data-table-${cacheKeyName}-headers`);
	if (cached) {
		try {
			return JSON.parse(cached);
		} catch (e) {
			console.error('Error parsing cached headers:', e);
			return defaultHeaders;
		}
	}
	// Nếu không có cache, lưu default vào localStorage
	setLocalStorageItem(`data-table-${cacheKeyName}-headers`, JSON.stringify(defaultHeaders));
	return defaultHeaders;
}

// Function để render cell data với formatting
export function renderCell(item: any, header: string): any {
	const value = getNestedValue(item, header);
	if (value === null || value === undefined) return '-';
	// if (typeof value === 'boolean') return value ? '✓' : '✗';
	// if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

// Function để sắp xếp dữ liệu theo thứ tự headers (giữ nguyên dữ liệu raw)
export function reorderDataByHeaders(items: any[], headers: string[]): any[] {
	return items.map((item) => {
		const reordered: Record<string, any> = {};
		headers.forEach((header) => {
			const value = getNestedValue(item, header);
			reordered[header] = value;
		});
		return reordered;
	});
}

export function handleDragOver(e: DragEvent) {
	e.preventDefault();
	if (e.dataTransfer) {
		e.dataTransfer.dropEffect = 'move';
	}
}

export function handleDragStart(header: string) {
	return header;
}

// Handle drop - TRẢ VỀ mảng mới thay vì thay đổi trực tiếp
export function handleDropHeader(
	draggedColumn: string,
	targetHeader: string,
	activeHeaders: string[]
): string[] | null {
	if (!draggedColumn || draggedColumn === targetHeader) {
		return null;
	}

	const newHeaders = [...activeHeaders]; // Tạo bản sao mới
	const draggedIndex = newHeaders.indexOf(draggedColumn);
	const targetIndex = newHeaders.indexOf(targetHeader);

	if (draggedIndex !== -1 && targetIndex !== -1) {
		// Swap columns
		[newHeaders[draggedIndex], newHeaders[targetIndex]] = [
			newHeaders[targetIndex],
			newHeaders[draggedIndex]
		];
		return newHeaders;
	}

	return null;
}

// Cell selection types
export type CellPosition = {
	rowIndex: number;
	colIndex: number;
};

export type CellRange = {
	start: CellPosition;
	end: CellPosition;
};

// Check if a cell is in the selected range
export function isCellSelected(
	rowIndex: number,
	colIndex: number,
	range: CellRange | null
): boolean {
	if (!range) return false;

	const minRow = Math.min(range.start.rowIndex, range.end.rowIndex);
	const maxRow = Math.max(range.start.rowIndex, range.end.rowIndex);
	const minCol = Math.min(range.start.colIndex, range.end.colIndex);
	const maxCol = Math.max(range.start.colIndex, range.end.colIndex);

	return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
}

export function handleRowSelect(
	sortedData: any[],
	selectedRows: Set<string>,
	lastCheckedIndex: number | null,
	rowId: string,
	rowIndex: number,
	e: MouseEvent
): { selectedRows: Set<string>; lastCheckedIndex: number | null } {
	const newSelected = new Set(selectedRows);

	// Shift + Click: Chọn/bỏ chọn range dựa trên trạng thái của ô được click
	if (e.shiftKey && lastCheckedIndex !== null) {
		const start = Math.min(lastCheckedIndex, rowIndex);
		const end = Math.max(lastCheckedIndex, rowIndex);

		// Xác định hành động: nếu ô hiện tại đang được chọn thì bỏ chọn range, ngược lại thì chọn range
		const shouldSelect = !newSelected.has(rowId);

		for (let i = start; i <= end; i++) {
			if (shouldSelect) {
				newSelected.add(sortedData[i].id);
			} else {
				newSelected.delete(sortedData[i].id);
			}
		}

		// Cập nhật lastCheckedIndex sau khi Shift+Click
		return { selectedRows: newSelected, lastCheckedIndex: rowIndex };
	} else {
		// Click thông thường: toggle checkbox
		if (newSelected.has(rowId)) {
			newSelected.delete(rowId);
		} else {
			newSelected.add(rowId);
		}

		return { selectedRows: newSelected, lastCheckedIndex: rowIndex };
	}
}
// Get selected cells data for copying
export function getSelectedCellsData(
	sortedData: any[],
	activeHeaders: string[],
	range: CellRange
): string {
	const minRow = Math.min(range.start.rowIndex, range.end.rowIndex);
	const maxRow = Math.max(range.start.rowIndex, range.end.rowIndex);
	const minCol = Math.min(range.start.colIndex, range.end.colIndex);
	const maxCol = Math.max(range.start.colIndex, range.end.colIndex);

	const rows: string[] = [];

	for (let i = minRow; i <= maxRow; i++) {
		const row: string[] = [];
		for (let j = minCol; j <= maxCol; j++) {
			const header = activeHeaders[j];
			const cellValue = sortedData[i]?.[header] || '';
			// Remove HTML tags if any
			const cleanValue = String(cellValue).replace(/<[^>]*>/g, '');
			row.push(cleanValue);
		}
		rows.push(row.join('\t'));
	}

	return rows.join('\n');
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error('Failed to copy:', err);
		return false;
	}
}
