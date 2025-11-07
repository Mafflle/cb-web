import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals }) => {
  const redirectTo = url.searchParams.get('redirectTo') || '/';
  if (locals.session) {
    throw redirect(303, redirectTo);
  }

  const code = url.searchParams.get('code');
  if (!code) {
    throw redirect(303, '/auth/login');
  }

  const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    throw redirect(303, '/auth/login');
  }

  if (redirectTo) {
    throw redirect(303, redirectTo);
  }

  throw redirect(303, '/');
};