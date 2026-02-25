// src/routes/auth/callback/google/+server.ts
import { redirect, error } from "@sveltejs/kit";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";

export const GET = async ({ url, cookies, fetch }) => {
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

  if (!tokenRes.ok) throw error(400, "Failed to get token from Google");

  const { id_token } = await tokenRes.json();
  console.log("id token google: ", id_token);

  // Gửi id_token lên backend C# để xác thực
  // const backendRes = await fetch("https://your-csharp-api.com/api/auth/google", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ idToken: id_token }),
  // });

  // if (!backendRes.ok) throw error(401, "Xác thực thất bại");

  // const { accessToken } = await backendRes.json();

  // 4️⃣ Lưu JWT của hệ thống vào httpOnly cookie
  // cookies.set("access_token", accessToken, {
  //   path: "/",
  //   httpOnly: true,      // ✅ JS không đọc được
  //   sameSite: "lax",
  //   maxAge: 60 * 60 * 24,
  //   secure: process.env.NODE_ENV === "production",
  // });

  // Dọn cookie tạm
  cookies.delete("oauth_state", { path: "/" });
  cookies.delete("code_verifier", { path: "/" });

  // 5️⃣ Redirect vào dashboard SAU KHI đã xác thực xong
  redirect(302, "/dashboard");
};
