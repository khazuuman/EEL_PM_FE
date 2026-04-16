import { changeTopic, getCurrentChangeTopicByGroupId, uploadLogo } from "$lib/server/topics";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { ChangeTopic, UpdateTopic } from "$lib/types/topics";
import { updateTopic } from "$lib/server/topics";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const currentTopicRes = await getCurrentChangeTopicByGroupId(event, user?.student?.group?.groupId);
    let topics = currentTopicRes?.data?.data ?? [];

    if (topics.length === 0) {
        redirect(302, "/app/student/topic/change/create");
    }

    topics.sort((a: any, b: any) => {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    topics = [topics[0]];

    console.log('Sorted topics: ', topics);
    return {
        currentTopic: topics[0],
        groupId: user.student.group?.groupId
    };
};