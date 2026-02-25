import type { RequestEvent } from '@sveltejs/kit';
import { fetcher } from '../fetcher';
import { refreshToken, setCookies } from '$lib/tokens/index'
import type { User } from '$lib/types/user'
import { safeJsonParse } from '$lib/utils';

export const login = async (event: RequestEvent, body: Pick<User, 'username' | 'password'>) => {
	const response = await fetcher({
		event,
		url: '/auth/login',
		method: 'POST',
		data: body
	});
	const data = await safeJsonParse(response);
	if (response.status === 200) {
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
		const rawCookies = response.headers.getSetCookie();
		setCookies(event, rawCookies);
	}
	return {
		status: response.status,
		data: data
	};
};