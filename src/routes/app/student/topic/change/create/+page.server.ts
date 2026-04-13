import { changeTopic, uploadLogo } from "$lib/server/topics";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { ChangeTopic } from "$lib/types/topics";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    return {
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
};