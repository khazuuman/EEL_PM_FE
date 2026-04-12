import { APP_LECTURER_MANAGE_GROUP } from "$lib/constants/depend";
import type { PageServerLoad } from "./$types";
import { getGroupsByClass } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { allocateGroup, publicGroup } from "$lib/server/classes";
import type { AllocateGroup } from "$lib/types/group";
import { getStudentsAvailableByClassWithoutFilter } from "$lib/server/students";
import { createGroup, deleteGroup } from "$lib/server/groups";
import type { CreateGroup } from "$lib/types/group";
import { redirect } from "@sveltejs/kit";
import { getDeadlines, updateGroupFormationDeadline, updateTopicRegistrationDeadline } from "$lib/server/deadline";
import type { SetGroupFormationDeadline, SetTopicRegistrationDeadline } from "$lib/types/deadline";

export const load: PageServerLoad = async (event) => {
    const { depends, url, parent } = event;
    depends(APP_LECTURER_MANAGE_GROUP);
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");

    const { classDetails } = await parent();

    const [deadlineRes, groupRes] = await Promise.all([getDeadlines(event, classDetails.classId), getGroupsByClass(event, classDetails.classId)])

    console.log('groupsRes: ', groupRes?.data?.data);
    console.log('deadlineRes: ', deadlineRes);
    return {
        groups: groupRes?.data?.data?.data ?? [],
        deadlines: deadlineRes.data?.data ?? null,
        limit: groupRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: groupRes?.data?.data?.pagination?.totalItems ?? 0,
        totalStudent: groupRes?.data?.data?.totalStudent,
        classId: classDetails.classId
    };
};

export const actions: Actions = {
    autoAllocate: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");
        const groupCount = Number(formData.get("groupCount"));

        const allocateGroupRes = await allocateGroup(event,
            {
                groupCount
            } as AllocateGroup, classId);
        console.log("allocateGroupRes res: ", allocateGroupRes);
        if (!allocateGroupRes || allocateGroupRes.status !== 200) {
            return fail(400, {
                message: allocateGroupRes?.data?.message ?? "Failed to allocate group",
            });
        }

        return {
            success: true,
            message: allocateGroupRes?.data?.message ?? null,
        };
    },
    publicGroup: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");

        const publicGroupRes = await publicGroup(event, classId);
        console.log("publicGroupRes: ", publicGroupRes);
        if (!publicGroupRes || publicGroupRes.status !== 200) {
            return fail(400, {
                message: publicGroupRes?.data?.message ?? "Failed to public group"
            });
        }

        return {
            success: true,
            message: publicGroupRes?.data?.message ?? null,
        };
    },
    getStudentAvailable: async (event) => {
        const { params } = event;
        const classId = params.classId;
        const res = await getStudentsAvailableByClassWithoutFilter(event, classId);
        console.log("student res: ", res.data?.data);

        return {
            students: (res.data?.data?.data ?? []).map((s: any) => ({
                id: s.studentId,
                name: s.fullName,
                studentCode: s.studentCode,
            })),
        };
    },
    createGroup: async (event) => {
        const formData = await event.request.formData();
        const classId = Number(formData.get("classId"));
        const studentIds = formData.getAll("studentIds").map(Number);

        const res = await createGroup(event, {
            classId,
            studentIds,
        } as CreateGroup);

        if (!res || res.status !== 201) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to create group",
            });
        }

        return { success: true };
    },
    deleteGroup: async (event) => {
        const formData = await event.request.formData();
        const groupId = Number(formData.get("groupId"));

        const deleteGroupRes = await deleteGroup(event, groupId);
        if (!deleteGroupRes || deleteGroupRes.status !== 200) {
            return fail(400, {
                message: deleteGroupRes?.data?.message ?? "Failed to delete group",
            });
        }
    },
    setGroupDeadline: async (event) => {
        const formData = await event.request.formData();
        const classId = Number(formData.get("classId"));
        const groupFormationEndDate = formData.get("groupDeadline");
        console.log("groupFormationEndDate from body: ", groupFormationEndDate);

        const updateGroupFormationDeadlineRes = await updateGroupFormationDeadline(event, { groupFormationEndDate } as SetGroupFormationDeadline, classId);
        if (!updateGroupFormationDeadlineRes || updateGroupFormationDeadlineRes.status !== 200) {
            return fail(400, {
                message: updateGroupFormationDeadlineRes?.data?.message ?? "Failed to set group formation deadline",
            });
        }
    },
    setTopicDeadline: async (event) => {
        const formData = await event.request.formData();
        const classId = Number(formData.get("classId"));
        const topicRegistrationEndDate = formData.get("topicDeadline");

        const updateTopicRegistrationDeadlineRes = await updateTopicRegistrationDeadline(event, { topicRegistrationEndDate } as SetTopicRegistrationDeadline, classId);
        if (!updateTopicRegistrationDeadlineRes || updateTopicRegistrationDeadlineRes.status !== 200) {
            return fail(400, {
                message: updateTopicRegistrationDeadlineRes?.data?.message ?? "Failed to set topic registration deadline",
            });
        }
    },
};
