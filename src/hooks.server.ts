// src/hooks.server.ts
import { getMe } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const handle: Handle = async ({ event, resolve }) => {
  const { locals } = event;
  const userResult = await getMe(event);
  locals.user = userResult?.data?.data;

  const publicRoutes = ['/auth'];
  const isPublicRoute = publicRoutes.some((r) => event.url.pathname.startsWith(r));

  if (!isPublicRoute) {
    const userResult = await getMe(event);
    locals.user = userResult?.data?.data;

    if (!locals.user) {
      throw redirect(303, `/auth/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
    }

    if (event.url.pathname === '/') {
      let target = "/auth/login";
      switch (locals.user?.roleName) {
        case 'Student': target = '/app/student'; break;
        case 'Lecturer': target = '/app/lecturer/class'; break;
        case 'AcademicStaff': target = '/app/academic-staff/dashboard'; break;
        case 'Admin': target = '/app/admin/dashboard'; break;
        case 'Mentor': target = '/app/mentor/dashboard'; break;
        default: target = '/auth/login'; break;
      }
      throw redirect(302, target);
    }
  }
  return resolve(event);
};
