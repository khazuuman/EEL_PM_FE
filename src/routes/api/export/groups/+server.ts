// src/routes/api/export/top-tier-groups/+server.ts
import type { RequestHandler } from "./$types";
import { fetcher } from "$lib/server/fetcher";

export const GET: RequestHandler = async (event) => {
    const { url } = event;
    const sp = url.searchParams;

    const body: Record<string, number> = {};
    if (sp.get("minScore")) body.minScore = Number(sp.get("minScore"));
    if (sp.get("topPercentage")) body.topPercentage = Number(sp.get("topPercentage"));
    if (sp.get("semesterId")) body.semesterId = Number(sp.get("semesterId"));

    const response = await fetcher({
        event,
        url: `/export/top30-groups`,
        method: "POST",
        data: body,
    });

    if (!response.ok) {
        return new Response(JSON.stringify({ message: "Failed to export groups" }), {
            status: response.status,
        });
    }

    const blob = await response.arrayBuffer();
    const contentDisposition =
        response.headers.get("content-disposition") ??
        `attachment; filename*=UTF-8''top_tier_groups.xlsx`;
    const contentType =
        response.headers.get("content-type") ??
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new Response(blob, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": contentDisposition,
        },
    });
};