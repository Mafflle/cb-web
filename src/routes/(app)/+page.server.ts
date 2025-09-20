import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
  logout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    return { success: true };
  }
}