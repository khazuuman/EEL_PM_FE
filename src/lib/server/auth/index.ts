import type { RequestEvent } from '@sveltejs/kit';
import { fetcher } from '../fetcher';
import { setCookies } from '$lib/tokens/index'
import { safeJsonParse } from '$lib/utils';
import type { LoginFEIDRequest, LoginGoogleRequest } from '$lib/types/request/loginRequest';
import type { LoginResponse } from '$lib/types/response/authResponse';

export const loginByGoogle = async (event: RequestEvent, body: LoginGoogleRequest) => {
	const response = await fetcher({
		event,
		url: '/auth/login-google',
		method: 'POST',
		data: body
	});
	const data = await safeJsonParse(response);
	if (response.status === 200) {
		const loginRes = data.data as LoginResponse;
		setCookies(event, loginRes);
	}
	return {
		status: response.status,
		data: data
	};
};

export const loginByFEID = async (event: RequestEvent, body: LoginFEIDRequest) => {
	const response = await fetcher({
		event,
		url: '/auth/login',
		method: 'POST',
		data: body
	});
	const data = await safeJsonParse(response);
	if (response.status === 200) {
		const loginRes = data.data as LoginResponse;
		setCookies(event, loginRes);
	}
	return {
		status: response.status,
		data: data
	};
};

export const logout = async (event: RequestEvent) => {
	const response = await fetcher({
		event,
		url: '/auth/logout',
		method: 'POST'
	});
	return {
		status: response.status
	};
};

export const getMe = async (event: RequestEvent) => {
	const response = await fetcher({
		event,
		url: '/profile/me'
	});
	const data = await safeJsonParse(response);
	return {
		status: response.status,
		data: data
	};
};

export const getInvitations = async (event: RequestEvent) => {
	const response = await fetcher({
		event,
		url: '/users/me/invitations'
	});
	const data = await safeJsonParse(response);
	return {
		status: response.status,
		data: data
	};
};
