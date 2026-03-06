import { goto } from '$app/navigation';
import { page } from '$app/state';

export const createQuery = (
	query: { keys: string | string[]; values: string | string[] },
	hasPage: boolean = true
) => {
	const { keys, values } = query;
	const searchParams = new URLSearchParams(window.location.search);

	if (Array.isArray(keys) && Array.isArray(values)) {
		const hasPageNumberKey = keys.some((k) => k === 'pageNumber');

		// ✅ Chỉ reset page khi KHÔNG phải đang set pageNumber
		if (!hasPageNumberKey && hasPage) {
			searchParams.set('pageNumber', '1');
		}

		keys.forEach((k, index) => {
			const value = values[index];
			if (value && value.trim() !== '') {
				searchParams.set(k, value);
			} else {
				if (!hasPageNumberKey && hasPage) {
					searchParams.set('pageNumber', '1');
				}
				searchParams.delete(k);
			}
		});
	} else if (typeof keys === 'string' && typeof values === 'string') {
		if (values && values.trim() !== '') {
			// ✅ Chỉ reset page khi KHÔNG phải đang set pageNumber
			if (keys !== 'pageNumber' && hasPage) {
				searchParams.set('pageNumber', '1');
			}
			searchParams.set(keys, values);
		} else {
			if (hasPage) {
				searchParams.set('pageNumber', '1');
			}
			searchParams.delete(keys);
		}
	}

	const queryString = searchParams.toString();
	const newUrl = queryString ? `?${queryString}` : '';

	// ✅ Thêm invalidateAll để force reload data
	goto(newUrl, {
		noScroll: true,
		keepFocus: true,
		invalidateAll: true // ← QUAN TRỌNG!
	});
};

export const deleteQuery = (keys: string | string[]) => {
	const searchParams = new URLSearchParams(window.location.search);
	if (Array.isArray(keys)) {
		keys.forEach((k) => searchParams.delete(k));
	} else {
		searchParams.delete(keys);
	}
	const queryString = searchParams.toString();
	const newUrl = queryString ? `?${queryString}` : '';

	goto(newUrl, {
		noScroll: true,
		keepFocus: true,
		invalidateAll: true // ← Thêm này
	});
};

export const resetQuery = () => {
	goto(page.url.pathname, {
		replaceState: true,
		keepFocus: true,
		invalidateAll: true // ← Thêm này
	});
};
