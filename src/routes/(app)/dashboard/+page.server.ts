// src/routes/dashboard/+page.server.ts
import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies }) => {
  const token = cookies.get("access_token");

  if (!token) {
    redirect(302, "/"); // Chưa login → đá về trang chủ
  }

  return { token };
};
