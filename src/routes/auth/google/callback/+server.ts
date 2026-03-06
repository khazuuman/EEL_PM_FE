// src/routes/auth/callback/google/+server.ts
import { redirect, error, fail } from "@sveltejs/kit";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";
import { getMe, login } from "$lib/server/auth/index.js";
import { ROLE } from "$lib/enums/role.js";

export const GET = async (event) => {
  const { url, cookies, fetch } = event;
  const redirectTo = url.searchParams.get('redirectTo');

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = cookies.get("oauth_state");
  const codeVerifier = cookies.get("code_verifier");

  console.log("code verifier callback: ", codeVerifier);
  console.log("isStateValid: ", state === savedState);

  // Validate state chống CSRF
  if (!code || !state || state !== savedState || !codeVerifier) {
    throw error(400, "Invalid OAuth state");
  }

  // Đổi code lấy token từ Google
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${PUBLIC_APP_URL}/auth/google/callback`,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.log("Google token error:", errText); // Log lỗi chi tiết nếu fail
    throw error(400, "Failed to get token from Google");
  }

  const { id_token } = await tokenRes.json();
  console.log("id token google: ", id_token);

  const campus = cookies.get("selectedCampus") ?? "";
  console.log("selected campus: ", campus);

  //Gọi api login
  const loginResult = await login(event, {
    idToken: id_token,
    // campus: campus
  });

  // Dọn cookie tạm
  cookies.delete("oauth_state", { path: "/" });
  cookies.delete("code_verifier", { path: "/" });
  cookies.delete("selectedCampus", { path: "/" });

  if (loginResult?.status === 200) {
    throw redirect(303, redirectTo ? decodeURIComponent(redirectTo) : '/');
    // const msg = encodeURIComponent(loginResult.data.message ?? 'Login successfully!');
    // const getMeResult = await getMe(event);
    // console.log("getMeResult: ", getMeResult);
    // if (getMeResult.status !== 200) {
    //   redirect(302, '/auth/login?toast=error&message=Session expired');
    // }
    // let url = "/";
    // switch (getMeResult.data.data.roleName) {
    //   case ROLE.STUDENT:
    //     url = "/student/dashboard";
    //     break;
    //   case ROLE.LECTURER:
    //     url = "/lecturer/class";
    //     break;
    //   case ROLE.MENTOR:
    //     url = "/mentor/dashboard";
    //     break;
    //   case ROLE.ACADEMICSTAFF:
    //     url = "/academic-staff/dashboard";
    //     break;
    //   case ROLE.ADMIN:
    //     url = "/admin/dashboard";
    //     break;
    //   default:
    //     url = "/";
    // }
    // console.log("role Name:", getMeResult.data.data.roleName)
    // console.log("role url: ", url);
    // redirect(302, `/app${url}?toast=success&message=${msg}`);
  }
  throw error(400, loginResult?.data?.detail || 'Internal Server Error');
};
