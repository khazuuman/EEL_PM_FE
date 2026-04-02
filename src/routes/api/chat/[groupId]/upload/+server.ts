//routes/api/chat/[groupId]/upload/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadChatFile } from '$lib/server/chat';

export const POST: RequestHandler = async (event) => {
    const formData = await event.request.formData();
    const file = formData.get('file') as File;
    const fd = new FormData();
    fd.append("file", file as Blob);

    if (!file) {
        return json({ error: 'File is required' }, { status: 400 });
    }

    const result = await uploadChatFile(event, event.params.groupId, fd);
    console.log("upload file result: ", result?.data?.data);

    if (!result || result.status === 401) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    return json(result?.data?.data, { status: result.status });
};