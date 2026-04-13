// src/routes/auth/callback/google/+server.ts
import { redirect, error, fail } from "@sveltejs/kit";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";
import { loginByGoogle } from "$lib/server/auth/index.js";

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
  const loginResult = await loginByGoogle(event, {
    idToken: id_token,
    // campus: campus
  });

  // Dọn cookie tạm
  cookies.delete("oauth_state", { path: "/" });
  cookies.delete("code_verifier", { path: "/" });
  cookies.delete("selectedCampus", { path: "/" });

  if (loginResult?.status === 200) {
    throw redirect(303, redirectTo ? decodeURIComponent(redirectTo) : '/');
  }
  const message = encodeURIComponent(loginResult?.data?.message || 'Internal Server Error');
  redirect(303, `/auth/login?toast=error&message=${message}`);
};
