import type { RequestEvent } from '@sveltejs/kit';
import { fetcher } from '$lib/server/fetcher';
import type { LoginResponse } from '$lib/types/response/authResponse';
import { safeJsonParse } from '$lib/utils';
import { dev } from '$app/environment';

export const setCookies = (event: RequestEvent, loginResponse: LoginResponse) => {
	const accessExpiry = new Date(loginResponse.accessTokenExpiresAt);
	const refreshExpiry = new Date(loginResponse.refreshTokenExpiresAt);
	event.cookies.set('accessToken', loginResponse.accessToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		expires: accessExpiry
	});
	event.cookies.set('refreshToken', loginResponse.refreshToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		expires: refreshExpiry
	});
};
export const refreshToken = async (event: RequestEvent) => {
	const response = await fetcher({
		event,
		url: '/auth/refresh-token',
		method: 'POST'
	});
	const data = await safeJsonParse(response);
	if (response.status === 200 || response.status === 201) {
		const loginRes = data.data as LoginResponse;
		setCookies(event, loginRes);
		return true;
	}
	return false;
};
