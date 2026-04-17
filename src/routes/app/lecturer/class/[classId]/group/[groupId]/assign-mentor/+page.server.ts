import { getGroupDetail } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getMentors } from "$lib/server/mentor";
import { getMentorDetails } from "$lib/server/mentor";
import { assignMentor } from "$lib/server/mentor";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const { groupId } = params;

    const [groupResult, mentorsRes] = await Promise.all([getGroupDetail(event, groupId), getMentors(event)]);

    console.log("group detail: ", groupResult.data?.data);
    console.log("mentorsRes: ", mentorsRes.data?.data);

    if (groupResult.status !== 200) {
        throw error(404, {
            message: 'Not found group!'
        });
    }
    return {
        mentors: mentorsRes.data?.data?.data || [],
        pagination: mentorsRes.data?.data?.data.pagination,
        groupDetails: groupResult.data.data,
    };
};

export const actions: Actions = {
    // getMentorDetail: async (event) => {
    //     const formData = await event.request.formData();
    //     const mentorId = formData.get("mentorId");
    //     const getMentorDetailsRes = await getMentorDetails(event, mentorId);
    //     if (!getMentorDetailsRes || getMentorDetailsRes.status !== 200) {
    //         return fail(400, {
    //             message: getMentorDetailsRes?.data?.message ?? "Failed to get mentor",
    //         });
    //     }

    //     return {
    //         mentorDetails: getMentorDetailsRes?.data?.data,
    //     };
    // },
    assignMentor: async (event) => {
        const formData = await event.request.formData();
        const groupId = Number(formData.get("groupId"));
        const mentorId = Number(formData.get("mentorId")) ?? null;
        const mentorEmail = formData.get("mentorEmail") as string ?? null;
        const mentorFullName = formData.get("mentorFullName") as string ?? null;

        const assignMentorRes = await assignMentor(event, groupId, { mentorId, mentorEmail, mentorFullName });
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
