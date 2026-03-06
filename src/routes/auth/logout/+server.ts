import { logout } from "$lib/server/auth";
import { redirect, type RequestEvent } from "@sveltejs/kit";

export const GET = async (event: RequestEvent) => {
    const { cookies } = event;
    let msg = '';
    let toastType = '';
    try {
        const logoutResult = await logout(event);
        if (logoutResult.status === 200) {
            msg = 'Logout successfully!';
            toastType = 'success'
        } else {
            msg = "Internal Server Error";
            toastType = 'error'
        }
    } catch (e) {
        console.error('[logout] API error:', e);
        msg = "Internal Server Error";
        toastType = 'error'
    } finally {
        cookies.delete("accessToken", { path: "/" });
        cookies.delete("refreshToken", { path: "/" });
    }

    redirect(302, `/auth/login?toast=${toastType}&message=${msg}`);
};
