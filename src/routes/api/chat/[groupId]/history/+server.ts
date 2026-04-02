//routes/api/chat/[groupId]/history/+server.ts
import { json } from '@sveltejs/kit';
import { getChatHistory } from '$lib/server/chat'; // file của bạn
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
    const result = await getChatHistory(event, event.params.groupId);

    if (!result || result.status === 401) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    return json(result.data, { status: result.status });
};