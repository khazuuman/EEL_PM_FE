import { getMyGroup, editMyGroup } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const groupRes = await getMyGroup(event, user.student.studentId);
    console.log("groupRes: ", groupRes.data?.data);
    return { group: groupRes.data?.data };
};

export const actions: Actions = {
    EditMyGroup: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId") as string;
        const name = formData.get("groupName") as string;
        const description = formData.get("groupDescription") as string;

        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }

        if (!name?.trim()) {
            return fail(400, { message: "Group name is required" });
        }

        const groupDetailRes = await editMyGroup(event, {
            name,
            description,
        }, groupId);
        console.log("group Detail Res:", groupDetailRes);

        if (!groupDetailRes || groupDetailRes.status !== 200) {
            return fail(400, {
                message: groupDetailRes?.data?.detail ?? "Failed to edit group",
            });
        }

        return {
            success: true,
            group: groupDetailRes?.data?.data ?? null,
        };
    },
};