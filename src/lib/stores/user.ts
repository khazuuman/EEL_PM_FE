import { writable } from 'svelte/store';

export const user = writable<any>(null);

export function setUser(value: any) {
	user.set(value);
}

export function updateUser(updater: (current: any) => any) {
	user.update(updater);
}
