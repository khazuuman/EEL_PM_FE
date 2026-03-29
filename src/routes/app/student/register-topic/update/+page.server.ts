import { updateTopic, uploadLogo } from "$lib/server/topics";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { UpdateTopic } from "$lib/types/topics";
import { getTopicByGroupId } from "$lib/server/topics";

export const load: PageServerLoad = async (event) => {
    const { parent, url } = event;
    const { user } = await parent();
    if (!url.searchParams.has("isCurrentVersion")) url.searchParams.set("isCurrentVersion", "true");
    const currentTopicRes = await getTopicByGroupId(event, user.student.group?.groupId);
    console.log("currentTopicRes update: ", currentTopicRes.data?.data);
    return {
        currentTopic: currentTopicRes?.data?.data,
        groupId: user.student.group?.groupId
    };
};

export const actions: Actions = {
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
};