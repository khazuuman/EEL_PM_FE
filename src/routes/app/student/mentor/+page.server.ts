import { getMentorByGroupId } from "$lib/server/mentor";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const mentorRes = await getMentorByGroupId(event, user.student?.group?.groupId) ?? null;
    console.log("mentorRes: ", mentorRes.data?.data);
    return {
        group: mentorRes.data?.data,
        currentUser: user
    };
};