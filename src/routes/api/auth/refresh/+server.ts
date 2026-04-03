// src/routes/api/auth/refresh/+server.ts
import { refreshToken } from '$lib/tokens';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    const success = await refreshToken(event);
    if (success) {
        // Lấy accessToken mới từ cookie vừa được set
        const newToken = event.cookies.get('accessToken');
        return json({ accessToken: newToken });
    }
    return json({ error: 'Refresh failed' }, { status: 401 });
};