// src/hooks.server.ts
import { redirect, type Handle } from '@sveltejs/kit';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const handle: Handle = async ({ event, resolve }) => {
  // const accessToken = event.cookies.get('accessToken');
  // const isAuthRoute = event.url.pathname.startsWith('/auth');

  // if (!accessToken && !isAuthRoute) {
  //   redirect(302, '/auth/login');
  // }

  return resolve(event);
};
