import { createTopic, getCurrentTopicByGroupId, resubmitTopic, uploadLogo } from "$lib/server/topics";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { CreateTopic, UpdateTopic } from "$lib/types/topics";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const currentTopicRes = await getCurrentTopicByGroupId(event, user.student.group?.groupId);
    console.log("currentTopicRes: ", currentTopicRes.data?.data);
    return {
        currentTopic: currentTopicRes?.data?.data[0],
        groupId: user.student.group?.groupId
    };
};
