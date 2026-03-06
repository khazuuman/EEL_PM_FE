import { writable } from 'svelte/store';
type RedirectData = {
	isRedirecting: boolean;
	location: string | null;
};
export const redirectData = writable<RedirectData>({
	isRedirecting: false,
	location: null
});

export function setRedirectData(d: RedirectData) {
	redirectData.set(d);
}
export function updateRedirectData(updater: (current: RedirectData) => RedirectData) {
	redirectData.update(updater);
}
