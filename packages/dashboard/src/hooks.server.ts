import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { type Database } from '@chowbenin/shared/types';
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			return { session: null, user: null };
		}
		return { session, user };
	};
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const routeId = event.route.id;
	const isAuthRoute = routeId?.startsWith('/auth');
	const isUnauthorizedRoute = routeId === '/auth/unauthorized';

	// All routes except auth routes are protected
	if (!isAuthRoute && !event.locals.session) {
		let redirectTo = event.url.pathname;
		if (event.url.search) {
			redirectTo += event.url.search;
		}
		redirect(303, '/auth/login?redirectTo=' + encodeURIComponent(redirectTo));
	}

	if (!isAuthRoute && event.locals.session && event.locals.user) {
		const { data: restaurantUser, error } = await event.locals.supabase
			.from('restaurant_users')
			.select('*, restaurant(*)')
			.eq('user_id', event.locals.user.id)
			.eq('is_active', true)
			.single();

		if (error || !restaurantUser) {
			redirect(303, '/auth/unauthorized');
		}

		event.locals.restaurantUser = restaurantUser;
		event.locals.restaurant = restaurantUser.restaurant;
	}

	if (isAuthRoute && !isUnauthorizedRoute && event.locals.session) {
		const url = new URL(event.request.url);
		let redirectTo = url.searchParams.get('redirectTo') || '/';

		if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
			redirectTo = '/';
		}

		redirect(303, redirectTo);
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
