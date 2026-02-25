import { PUBLIC_API_BASE_URL_LOCAL, PUBLIC_API_BASE_URL_PROD } from '$env/static/public';
import { type RequestEvent } from '@sveltejs/kit';
import { refreshToken } from '$lib/tokens';

const endpoint = PUBLIC_API_BASE_URL_LOCAL || PUBLIC_API_BASE_URL_PROD;

type Fetcher<T> = {
	event: RequestEvent;
	url: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	data?: T;
	formData?: FormData; // Thêm option cho FormData
};

type QueuedRequest = {
	resolve: (value: Response) => void;
	reject: (reason?: any) => void;
	request: () => Promise<Response>;
};

let isRefreshing = false;
let requestQueue: QueuedRequest[] = [];

// Helper to create error Response objects without throwing
const createErrorResponse = (status: number, message: string): Response => {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
};

const processQueue = async (success: boolean) => {
	const queue = [...requestQueue];
	requestQueue = [];

	if (success) {
		// Retry all requests in queue
		for (const item of queue) {
			try {
				const response = await item.request();
				item.resolve(response);
			} catch (error) {
				// On retry failure, resolve with error response instead of reject
				item.resolve(createErrorResponse(500, 'Retry failed after token refresh'));
			}
		}
	} else {
		// Resolve all with error response on refresh failure
		for (const item of queue) {
			item.resolve(createErrorResponse(401, 'Token refresh failed'));
		}
	}
};

export const fetcher = async <T>({
	event,
	url,
	method = 'GET',
	data,
	formData
}: Fetcher<T>): Promise<Response> => {
	const { request } = event;

	const cookieHeader = request.headers.get('cookie');

	const makeRequest = async (): Promise<Response> => {
		const fullUrl = endpoint + url;

		// Xây dựng options
		const options: RequestInit = {
			method,
			headers: {
				...(cookieHeader ? { cookie: cookieHeader } : {})
			},
			credentials: 'include'
		};

		// Xử lý body dựa trên loại data
		if (formData) {
			// Với FormData, không set Content-Type (browser tự set với boundary)
			options.body = formData;
		} else if (data) {
			// Với JSON data
			(options.headers as Record<string, string>)['Content-Type'] = 'application/json';
			options.body = JSON.stringify(data);
		} else {
			// Không có body, vẫn set Content-Type cho consistency
			(options.headers as Record<string, string>)['Content-Type'] = 'application/json';
		}

		try {
			const res = await event.fetch(fullUrl, options);
			console.log(`[fetcher] Requested URL: ${fullUrl} | Status: ${res.status} ${res.statusText}`);
			return res;
		} catch (err: any) {
			console.error('[fetcher]', err);
			if (err?.cause?.code === 'EAI_AGAIN') {
				return createErrorResponse(503, 'DNS lookup failed');
			}
			return createErrorResponse(500, 'Unexpected server error');
		}
	};

	let res = await makeRequest();
	console.log(`[fetcher] Response for ${url}:`, res);

	// Skip retry logic if this is the refresh endpoint itself
	const isRefreshRequest = url.includes('/refresh-token');

	// If 401 and not a refresh request
	if (res.status === 401 && !isRefreshRequest) {
		if (!isRefreshing) {
			isRefreshing = true;

			try {
				const refreshed = await refreshToken(event);
				await processQueue(refreshed);

				if (refreshed) {
					res = await makeRequest();
				} else {
					res = createErrorResponse(401, 'Token refresh failed');
				}
			} catch (err) {
				await processQueue(false);
				res = createErrorResponse(500, 'Error during token refresh');
			} finally {
				isRefreshing = false;
			}
		} else {
			// Already refreshing, add to queue
			res = await new Promise<Response>((resolve, reject) => {
				requestQueue.push({
					resolve,
					reject,
					request: makeRequest
				});
			});
		}
	}

	return res;
};
