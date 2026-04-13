import { changeTopic, getCurrentChangeTopicByGroupId, getCurrentTopicByGroupId, updateTopic, uploadLogo } from "$lib/server/topics";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { ChangeTopic, UpdateTopic } from "$lib/types/topics";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const currentTopicRes = await getCurrentChangeTopicByGroupId(event, user?.student?.group?.groupId);
    let topics = currentTopicRes?.data?.data ?? [];

    if (topics.length > 0) {
        topics.sort((a: any, b: any) => {
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        });

        topics = [topics[0]];
    }

    console.log('Sorted topics: ', topics);
    return {
        currentTopic: topics,
        groupId: user.student.group?.groupId
    };
};

export const actions: Actions = {
    ChangeTopic: async (event) => {
        const formData = await event.request.formData();
        const groupId = Number(formData.get("groupId"));
        const newTitle = formData.get("title") as string;
        const newDescription = formData.get("description") as string;
        const newObjectives = formData.get("objectives") as string;
        const newLogoUrl = formData.get("logoUrl") as string;

        const changeTopicRes = await changeTopic(event, groupId, {
            groupId,
            newTitle,
            newDescription,
            newObjectives,
            newLogoUrl
        } as ChangeTopic);
        console.log("change topic Res:", changeTopicRes);

        if (!changeTopicRes || changeTopicRes.status !== 200) {
            return fail(400, {
                message: changeTopicRes?.data?.message ?? "Failed to register topic",
            });
        }


        return {
            success: true,
            result: changeTopicRes?.data?.data ?? null,
        };
    },

    UploadLogo: async (event) => {
        const formData = await event.request.formData();
        const file = formData.get("file");

        const fd = new FormData();
        fd.append("file", file as Blob);


        const uploadImgRes = await uploadLogo(event, fd);
        console.log("uploadImgRes:", uploadImgRes);

        if (!uploadImgRes || uploadImgRes.status !== 200) {
            return fail(400, {
                message: uploadImgRes?.data?.message ?? "Failed to upload logo",
            });
        }

        console.log("upload res: ", uploadImgRes?.data);

        return {
            success: true,
            result: uploadImgRes?.data ?? null,
        };
    },
    UpdateTopic: async (event) => {
        const formData = await event.request.formData();
        const topicId = Number(formData.get("topicId"));
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const objectives = formData.get("objectives") as string;
        const logoUrl = formData.get("logoUrl") as string;

        const updateTopicRes = await updateTopic(event, topicId, {
            title,
            description,
            objectives,
            logoUrl
        } as UpdateTopic);
        console.log("updateTopic Res:", updateTopicRes);

        if (!updateTopicRes || updateTopicRes.status !== 200) {
            return fail(400, {
                message: updateTopicRes?.data?.message ?? "Failed to update topic",
            });
        }

        return {
            success: true,
            result: updateTopicRes?.data?.data ?? null,
        };
    },
};