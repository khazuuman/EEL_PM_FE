import { deleteGroup, getGroupDetail } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const { id } = params;
    console.log("id: ", id);
    const groupResult = await getGroupDetail(event, id);
    console.log("group detail: ", groupResult.data);
    if (groupResult.status !== 200) {
        throw error(404, {
            message: 'Not found group!'
        });
    }
    return {
        groupDetails: groupResult.data.data,
    };
};

export const actions: Actions = {
    delete: async (event) => {
        const id = event.params.id;

        const deleteGroupRes = await deleteGroup(event, id);
        if (!deleteGroupRes || deleteGroupRes.status !== 200) {
            return fail(400, {
                message: deleteGroupRes?.data?.message ?? "Failed to delete group",
            });
        }
        console.log("url: ", event.url.pathname.replace(`/${id}`, ""));

        redirect(303, event.url.pathname.replace(`/${id}`, ""));
    },
};
