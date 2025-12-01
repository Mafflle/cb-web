import { invalidate } from "$app/navigation";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import userStore from "./user.svelte";

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

			await userStore.load(currentUser, supabase);

			if (authStateSubscription) {
				authStateSubscription.unsubscribe();
			}
	
			const {data} = supabase.auth.onAuthStateChange(async (_event: string, _session: Session | null) => {
				if (_session?.expires_at !== session?.expires_at) {
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
			await userStore.load(currentUser, supabase!);
		}

	};

	const cleanup = () => {
		if (authStateSubscription) {
			authStateSubscription.unsubscribe();
			authStateSubscription = null;
		}
	}

	const waitForAuth = async (timeout: number) => {
		if (!loaded) {
			const start = Date.now();
			while (!loaded) {
				if (Date.now() - start > timeout) {
					return false;
				}
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			return true;
		} 

		return true;
	};

	return {
		get currentUser() {
			return currentUser;
		},
		get loaded() {
			return loaded;
		},
		get supabase() {
			return supabase;
		},
		load,
		refresh,
		logout,
		cleanup,
		waitForAuth
	};
};

const auth = createStore();

export default auth;
