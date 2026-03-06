import { createContext } from 'svelte';
type Status = {
	label: string;
	value: string | number;
	variant: string;
};
type SingleDataFilter = {
	value: string;
	label: string;
};
type Filer = {
	title: string;
	key: string;
	data: SingleDataFilter[];
};
export type DataTableCtx = {
	cacheKeyName: string;
	headerValues: Record<string, string>;
	defaultHeaders: string[];
	allowSortHeaders: string[];
	matchSearchColumns?: string[];
	tableName: string;
	filters?: Filer[];
	statuses: Status[];
};
export const [getDataTableCTX, setDataTableCtx] = createContext<() => DataTableCtx>();
