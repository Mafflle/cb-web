import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const supabase: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => event.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              event.cookies.set(name, value, { ...options, path: "/" });
            });
          },
        },
      },
    );
  


  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    if (!session) {
      return { session: null, user: null }
    }
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser()
    if (error) {
      return { session: null, user: null }
    }
    return { session, user }
  }
  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

  const routeId = event.route.id;

  const isAuthedRoute = routeId && routeId.includes('(authed)');

  if (isAuthedRoute && !event.locals.session) {
    let redirectTo = event.url.pathname;
    if (event.url.search) {
      redirectTo += event.url.search;
    }
    redirect(303, '/auth/login?redirectTo=' + encodeURIComponent(redirectTo));
  }

  if (routeId?.startsWith('/auth') && event.locals.session) {
    const url = new URL(event.request.url);
    const redirectTo = url.searchParams.get('redirectTo') || '/';
    redirect(303, redirectTo);
  }

  return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard);