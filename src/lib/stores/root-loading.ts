import { writable } from 'svelte/store';

export const isRootLoading = writable(false);

export function setIsRootLoading(value: boolean) {
	isRootLoading.set(value);
}
export function updateIsRootLoading(updater: (current: boolean) => boolean) {
	isRootLoading.update(updater);
}
