import { browser } from "$app/environment";
import { invalidate } from "$app/navigation";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

const createStore = () => {
	let loaded = $state(false);
	let loadLocked = $state(false);
	let supabase = $state<SupabaseClient | null>(null);
	let session = $state<Session | null>(null);
	let authStateSubscription: any = null; 
	const currentUser = $derived.by(() => session?.user ?? null);


	const logout = async () => {
		if (supabase && session) {
			await supabase.auth.signOut();
			session = null;
		}
	}

	const load = async (supabaseClient: any, initialSession?: Session | null) => {
		if (loadLocked) return;
		loadLocked = true;

		supabase = supabaseClient;
		if (supabase) {
			if (initialSession !== undefined && initialSession !== null) {
				session = initialSession;
			} else{
				const { data } = await supabase.auth.getSession();
				session = data.session;
			}

			if (authStateSubscription) {
				authStateSubscription.unsubscribe();
			}
	
			const {data} = supabase.auth.onAuthStateChange(async (_event: string, newSession: Session | null) => {
				console.log("Auth state changed:", _event, newSession);
				session = newSession;

				if (browser) {
					await invalidate('supabase:auth');
				}
			});
			authStateSubscription = data.subscription;
		}

		

		loaded = true;
		loadLocked = false;
	};

	const refresh = async () => {
		if (supabase) {
			const { data } = await supabase.auth.getSession();
			session = data.session;
		}
	};

	const cleanup = () => {
		if (authStateSubscription) {
			authStateSubscription.unsubscribe();
			authStateSubscription = null;
		}
	}

	return {
		get currentUser() {
			return currentUser;
		},
		get loaded() {
			return loaded;
		},
		load,
		refresh,
		logout,
		cleanup
	};
};

const auth = createStore();

export default auth;
