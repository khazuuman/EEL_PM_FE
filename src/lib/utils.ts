import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null;
};

export const setLocalStorageItem = (key: string, value: string) => {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(key, value);
	}
};

export const getLocalStorageItem = (key: string): string | null => {
	if (typeof window !== 'undefined') {
		return window.localStorage.getItem(key);
	}
	return null;
};

export const safeJsonParse = async (response: Response) => {
	try {
		const text = await response.text();
		return text ? JSON.parse(text) : null;
	} catch (error) {
		console.error('Failed to parse JSON response:', error);
		return null;
	}
};

export const normalizeHtmlForValidation = (html: string): string => {
	return (
		html
			// Replace <br> variants with newline
			.replace(/<br\s*\/?>/gi, '\n')
			// Replace closing/opening p tags with double newline (paragraph break)
			.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
			// Replace opening p tag
			.replace(/<p[^>]*>/gi, '')
			// Replace closing p tag
			.replace(/<\/p>/gi, '\n')
			// Remove all other HTML tags
			.replace(/<[^>]*>/g, '')
			// Decode HTML entities
			.replace(/&nbsp;/g, ' ')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')
			.replace(/&quot;/g, '"')
			// Normalize whitespace
			.trim()
	);
};
