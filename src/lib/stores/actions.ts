import { writable } from 'svelte/store';
type Actions = {
	active: boolean;
	description: string;
	cb: () => Promise<void> | void;
};
export const actions = writable<Actions>({
	active: false,
	description: '',
	cb: () => {}
});

export function setActions(d: Actions) {
	actions.set(d);
}
export function updateActions(updater: (current: Actions) => Actions) {
	actions.update(updater);
}
