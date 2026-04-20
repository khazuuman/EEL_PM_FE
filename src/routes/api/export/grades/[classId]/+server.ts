import type { RequestHandler } from "./$types";
import { fetcher } from '$lib/server/fetcher';

export const GET: RequestHandler = async (event) => {
    const { classId } = event.params;

    const response = await fetcher({
        event,
        url: `/export/grades/${classId}`,
    });

    if (!response.ok) {
        return new Response(JSON.stringify({ message: 'Failed to export grade' }), {
            status: response.status,
        });
    }

    // Forward nguyên binary stream + headers về client
    const blob = await response.arrayBuffer();
    const contentDisposition = response.headers.get('content-disposition') ??
        `attachment; filename*=UTF-8''grades_${classId}.xlsx`;
    const contentType = response.headers.get('content-type') ??
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return new Response(blob, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition,
        },
    });
};