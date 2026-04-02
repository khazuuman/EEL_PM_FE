//routes/api/chat/[groupId]/members/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChatMember } from '$lib/server/chat';

export const GET: RequestHandler = async (event) => {
    const result = await getChatMember(event, event.params.groupId);

    if (!result || result.status === 401) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    return json(result.data, { status: result.status });
};