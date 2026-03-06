import { writable } from 'svelte/store';

export type BreadcrumbItem = {
	icon?: any;
	label: string;
	href?: string;
};

export const breadcrumbs = writable<BreadcrumbItem[]>([]);

export function setBreadcrumbs(value: BreadcrumbItem[]) {
	breadcrumbs.set(value);
}
export function updateBreadcrumbs(updater: (current: BreadcrumbItem[]) => BreadcrumbItem[]) {
	breadcrumbs.update(updater);
}
