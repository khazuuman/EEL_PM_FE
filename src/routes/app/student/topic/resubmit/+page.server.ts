import { resubmitTopic, uploadLogo } from "$lib/server/topics";
import { fail, type Actions } from "@sveltejs/kit";
import type { UpdateTopic } from "$lib/types/topics";
import { getCurrentTopicByGroupId } from "$lib/server/topics";
import type { PageServerLoad } from "../[topicId]/$types";

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

export const actions: Actions = {
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
    resubmitTopic: async (event) => {
        const formData = await event.request.formData();
        const groupId = Number(formData.get("groupId"));
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const objectives = formData.get("objectives") as string;
        const logoUrl = formData.get("logoUrl") as string;

        const resubmitTopicRes = await resubmitTopic(event, groupId,
            {
                title, description, objectives, logoUrl
            } as UpdateTopic);
        console.log("resubmitTopicRes res: ", resubmitTopicRes);
        if (!resubmitTopicRes || resubmitTopicRes.status !== 200) {
            return fail(400, {
                message: resubmitTopicRes?.data?.message ?? "Failed to resubmit topic",
            });
        }

        return {
            success: true,
            message: resubmitTopicRes?.data?.message ?? null,
        };
    },
};