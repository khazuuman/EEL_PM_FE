// src/routes/auth/google/+server.ts
import { redirect } from "@sveltejs/kit";
import { GOOGLE_CLIENT_ID } from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";
import crypto from "crypto";

export const GET = async ({ cookies }) => {
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("hex");

  // Lưu tạm vào cookie để verify sau
  cookies.set("oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  cookies.set("code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  console.log("code verifier: ", codeVerifier);

  // Tạo code_challenge cho PKCE
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${PUBLIC_APP_URL}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  console.log("google url params: ", params);
  
  redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};
