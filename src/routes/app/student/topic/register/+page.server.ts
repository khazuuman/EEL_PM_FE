import type { CreateTopic } from "$lib/types/topics";
import { createTopic, getCurrentTopicByGroupId, resubmitTopic, uploadLogo } from "$lib/server/topics";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    return {
        groupId: user.student.group?.groupId
    };
};

export const actions: Actions = {
    RegisterTopic: async (event) => {
        const formData = await event.request.formData();
        const groupId = Number(formData.get("groupId"));
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const objectives = formData.get("objectives") as string;
        const logoUrl = formData.get("logoUrl") as string;

        const createTopicRes = await createTopic(event, {
            groupId,
            title,
            description,
            objectives,
            logoUrl
        } as CreateTopic);
        console.log("createTopic Res:", createTopicRes);

        if (!createTopicRes || createTopicRes.status !== 200) {
            return fail(400, {
                message: createTopicRes?.data?.message ?? "Failed to register topic",
            });
        }


        return {
            success: true,
            result: createTopicRes?.data?.data ?? null,
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