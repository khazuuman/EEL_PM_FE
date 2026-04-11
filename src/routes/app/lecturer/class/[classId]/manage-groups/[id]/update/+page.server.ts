import { updateGroup } from "$lib/server/groups";
import type { UpdateGroup } from "$lib/types/group";
import type { Actions } from "@sveltejs/kit";
import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getStudentsAvailableByClassWithoutFilter } from "$lib/server/students";
import { getGroupDetail } from "$lib/server/groups";

export const load: PageServerLoad = async (event) => {
    const { params, url } = event;
    // Parse classId trực tiếp từ URL path
    const segments = url.pathname.split("/");
    const classIndex = segments.indexOf("class");
    const classId = segments[classIndex + 1];

    const groupId = params.id;
    const [studentRes, groupRes] = await Promise.all([
        getStudentsAvailableByClassWithoutFilter(event, classId),
        getGroupDetail(event, groupId)
    ]);

    if (groupRes.status !== 200) {
        throw error(404, {
            message: 'Not found group!'
        });
    }
    return {
        students: (studentRes.data?.data?.data ?? []).map((s: any) => ({
            id: s.studentId,
            name: s.fullName,
            studentCode: s.studentCode,
        })),
        group: groupRes?.data?.data,
        classId: classId
    };
};

export const actions: Actions = {
    update: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId");
        // const minMembers = Number(formData.get("minMembers"));
        // const maxMembers = Number(formData.get("maxMembers"));
        const studentIds = formData.getAll("studentIds").map(Number);

        const updateGroupRes = await updateGroup(event, groupId, { studentIds } as UpdateGroup);
        if (!updateGroupRes || updateGroupRes.status !== 200) {
            return fail(400, {
                message: updateGroupRes?.data?.message ?? "Failed to update group",
            });
        }

        redirect(303, event.url.pathname.replace(`/${groupId}/update`, ""));
    },
};