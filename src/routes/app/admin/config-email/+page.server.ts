import { getSystemMailSetting, updateSystemMailSetting } from "$lib/server/config";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { UpdateMailSetting } from "$lib/types/config";

export const load: PageServerLoad = async (event) => {

    const emailSettingRes = await getSystemMailSetting(event);
    console.log('emailSettingRes: ', emailSettingRes?.data?.data);

    return {
        emailSetting: emailSettingRes?.data?.data ?? null,
    };
};

export const actions: Actions = {
    updateEmailSetting: async (event) => {
        const formData = await event.request.formData();

        const updateSystemMailSettingRes = await updateSystemMailSetting(event, {
            smtpHost: formData.get("smtpHost") as string,
            smtpPort: Number(formData.get("smtpPort")),
            senderEmail: formData.get("senderEmail") as string,
            senderPassword: formData.get("senderPassword") as string,
            senderName: formData.get("senderName") as string
        } as UpdateMailSetting);
        console.log("updateSystemMailSettingRes:", updateSystemMailSettingRes);

        if (!updateSystemMailSettingRes || updateSystemMailSettingRes.status !== 200) {
            return fail(400, {
                message: updateSystemMailSettingRes?.data?.message ?? "Failed to update setting",
            });
        }

        return {
            success: true,
            group: updateSystemMailSettingRes?.data?.message ?? null,
        };
    },
};