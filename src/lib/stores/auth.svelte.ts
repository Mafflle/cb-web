import supabase from '../supabase';

const createStore = () => {
	let currentUser = $state<any>(null);
	let loaded = $state(false);
	let loadLocked = $state(false);

	const getOtp = async (phone: string) => {
		return await supabase.auth.signInWithOtp({
			phone: phone,
			options: {
				channel: 'whatsapp'
			}
		});
	};

	const login = async (otp: string, phone: string) => {
		const { data, error } = await supabase.auth.verifyOtp({
			phone: phone,
			token: otp,
			type: 'sms'
		});

		if (error) {
			return {
				error: error.message
			};
		}

		currentUser = data.user;
	};

	const logout = async () => {
		await supabase.auth.signOut();
		currentUser = null;
	};

	const load = async () => {
		if (loadLocked) return;
		loadLocked = true;

		const { data, error } = await supabase.auth.getSession();

		if (!error) {
			currentUser = data.session?.user || null;

			await supabase.auth.onAuthStateChange(async (event, session) => {
				currentUser = session?.user || null;
			});
		}

		loaded = true;
		loadLocked = false;
	};

	return {
		get currentUser() {
			return currentUser;
		},
		get loaded() {
			return loaded;
		},
		getOtp,
		login,
		load,
		logout
	};
};

const store = createStore();

export default store;
