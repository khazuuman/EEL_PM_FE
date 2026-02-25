import type { RequestEvent } from '@sveltejs/kit';
import { fetcher } from '$lib/server/fetcher'; 
import { NODE_ENV } from '$env/static/private';
// import type { Tokens } from '$lib/types/tokens';
import setCookieParser from 'set-cookie-parser';
// export const setTokens = async (event: RequestEvent, tokens: Tokens) => {
// 	const { cookies } = event;
// 	cookies.set('accessToken', tokens.accessToken?.value, {
// 		path: '/',
// 		httpOnly: NODE_ENV === 'production',
// 		secure: NODE_ENV === 'production',
// 		sameSite: 'lax',
// 		maxAge: new Date(tokens.accessToken?.expiryDate).getTime()
// 	});
// 	cookies.set('refreshToken', tokens.refreshToken?.value, {
// 		path: '/',
// 		httpOnly: NODE_ENV === 'production',
// 		secure: NODE_ENV === 'production',
// 		sameSite: 'lax',
// 		maxAge: new Date(tokens.refreshToken?.expiryDate).getTime()
// 	});
// 	// if (tokens.remember?.value) {
// 	// 	cookies.set('remember', tokens.remember.value, {
// 	// 		path: '/',
// 	// 		httpOnly: NODE_ENV === 'production',
// 	// 		secure: false,
// 	// 		sameSite: 'lax',
// 	// 		maxAge: Number(tokens.remember?.expiryDate)
// 	// 	});
// 	// }
// };

export const setCookies = (event: RequestEvent, rawCookies: string[]) => {
	const { cookies } = event;
	const parsedCookies = setCookieParser.parse(rawCookies);
	parsedCookies.forEach((c) => {
		cookies.set(c.name, c.value, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60 * 24 * 7
		});
	});
};
export const refreshToken = async (event: RequestEvent) => {
	const response = await fetcher({
		event,
		url: '/auth/refresh-token',
		method: 'POST'
	});
	if (response.status === 200 || response.status === 201) {
		// const data = await response.json();
		// const tokens = {
		// 	accessToken: {
		// 		value: data?.data?.accessToken,
		// 		expiryDate: data?.data?.accessTokenExpiresIn
		// 	},
		// 	refreshToken: {
		// 		value: data?.data?.refreshToken,
		// 		expiryDate: data?.data?.refreshTokenExpiresIn
		// 	}
		// };
		// if (tokens.accessToken && tokens.refreshToken) {
		// 	await setTokens(event, tokens);
		// 	return true;
		// }
		const rawCookies = response.headers.getSetCookie();
		setCookies(event, rawCookies);
		return true;
	}
	return false;
};
