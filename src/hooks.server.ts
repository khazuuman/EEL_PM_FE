// src/hooks.server.ts
import { ROLE } from '$lib/enums/role';
import { getMe } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const handle: Handle = async ({ event, resolve }) => {
  const { locals } = event;

  const publicRoutes = ['/auth', '/api', '/sso', '/feid-callback'];
  const isPublicRoute = publicRoutes.some((r) => event.url.pathname.startsWith(r));

  if (!isPublicRoute) {
    const userResult = await getMe(event);
    locals.user = userResult?.data?.data;
    locals.accessToken = event.cookies.get('accessToken');

    if (!locals.user) {
      throw redirect(303, `/auth/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
    }

    if (event.url.pathname === '/' || event.url.pathname === '/app') {
      if (locals.user.roles.includes(ROLE.LECTURER)) {
        throw redirect(302, "/app/lecturer/class");
      }
      if (locals.user.roles.includes(ROLE.MENTOR)) {
        throw redirect(302, "/app/mentor/groups");
      }
      if (locals.user.roles.includes(ROLE.STUDENT)) {
        throw redirect(302, "/app/student");
      }
      if (locals.user.roles.includes(ROLE.ACADEMICSTAFF)) {
        throw redirect(302, "/app/academic-staff");
      }
      throw redirect(302, "/app");
    }
  }
  return resolve(event);
};
