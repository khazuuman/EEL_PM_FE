import { updateGroup } from "$lib/server/groups";
import type { UpdateGroup } from "$lib/types/group";
import type { Actions } from "@sveltejs/kit";
import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getGroupDetail } from "$lib/server/groups";
import { getMentors } from "$lib/server/mentor";
import { getCurrentTopicByGroupId } from "$lib/server/topics";
import { getMentorDetails } from "$lib/server/mentor";
import { assignMentor } from "$lib/server/mentor";

export const load: PageServerLoad = async (event) => {
    const { params, url } = event;

    // groupId
    const groupId = params.groupId;

    // const page = url.searchParams.get("page") ?? "1";
    const limit = url.searchParams.get("limit") ?? "10";

    // url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);
    const [mentorRes, groupRes, topicRes] = await Promise.all([
        getMentors(event),
        getGroupDetail(event, groupId),
        getCurrentTopicByGroupId(event, groupId)
    ]);

    if (groupRes.status !== 200) {
        throw error(404, {
            message: 'Not found group!'
        });
    }
    console.log("group res: ", groupRes?.data?.data);
    console.log("mentorRes res: ", mentorRes.data?.data);
    console.log("topic res: ", topicRes.data?.data);
    return {
        mentors: mentorRes?.data?.data || [],
        topic: topicRes?.data?.data,
        group: groupRes?.data?.data,
        classId: params.classId
    };
};

export const actions: Actions = {
    getMentorDetail: async (event) => {
        const formData = await event.request.formData();
        const mentorId = formData.get("mentorId");
        const getMentorDetailsRes = await getMentorDetails(event, mentorId);
        if (!getMentorDetailsRes || getMentorDetailsRes.status !== 200) {
            return fail(400, {
                message: getMentorDetailsRes?.data?.message ?? "Failed to get mentor",
            });
        }

        return {
            mentorDetails: getMentorDetailsRes?.data?.data,
        };
    },
    assignMentor: async (event) => {
        const formData = await event.request.formData();
        const groupId = Number(formData.get("groupId"));
        const mentorId = Number(formData.get("mentorId"));
        const assignMentorRes = await assignMentor(event, groupId, { mentorId });
        if (!assignMentorRes || assignMentorRes.status !== 200) {
            return fail(400, {
                message: assignMentorRes?.data?.message ?? "Failed to assign mentor",
            });
        }

        return {
            mentorDetails: assignMentorRes?.data?.data,
        };
    },
};
