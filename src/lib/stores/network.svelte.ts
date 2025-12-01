import { browser } from '$app/environment';

const createStore = () => {
	let online = $state(true);
	let wasOffline = $state(false);
	let connectivityCheckInterval: ReturnType<typeof setInterval> | null = null;

	const checkConnectivity = async () => {
		if (!browser) return;

		try {
			// Use a connectivity check parameter that service worker will bypass
			const response = await fetch('/manifest.webmanifest?_connectivity_check=' + Date.now(), {
				method: 'HEAD',
				cache: 'no-store',
				signal: AbortSignal.timeout(3000) // 3 second timeout
			});
			const wasOnline = online;
			online = response.ok && response.status !== 503;
			
			if (!online && wasOnline) {
				wasOffline = true;
			}
		} catch {
			const wasOnline = online;
			online = false;
			
			if (wasOnline) {
				wasOffline = true;
			}
		}
	};

	const updateOnlineStatus = () => {
		const newOnline = navigator.onLine;
		const wasOnline = online;
		online = newOnline;
		
		if (!online) {
			wasOffline = true;
			// Immediately check connectivity to confirm
			checkConnectivity();
		} else if (wasOnline !== newOnline) {
			// When coming back online, verify with connectivity check
			checkConnectivity();
		}
		
		// Restart interval with new interval based on current status
		if (connectivityCheckInterval) {
			clearInterval(connectivityCheckInterval);
		}
		connectivityCheckInterval = setInterval(() => {
			checkConnectivity();
		}, online ? 10000 : 3000);
	};

	if (browser) {
		// Initial check - use navigator.onLine (should be immediate, but can be unreliable)
		online = navigator.onLine;
		
		// If navigator says offline, mark it immediately
		if (!online) {
			wasOffline = true;
		}
		
		// Listen to browser online/offline events (these fire immediately when network status changes)
		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);
		
		// Do immediate connectivity check to verify actual network status
		// Use setTimeout to ensure it runs after page is fully loaded
		setTimeout(() => {
			checkConnectivity();
		}, 100);
		
		// Set up periodic connectivity checks (interval will be updated by updateOnlineStatus)
		connectivityCheckInterval = setInterval(() => {
			checkConnectivity();
		}, online ? 10000 : 3000);
	}

	const refresh = () => {
		if (browser) {
			window.location.reload();
		}
	};

	const cleanup = () => {
		if (connectivityCheckInterval) {
			clearInterval(connectivityCheckInterval);
			connectivityCheckInterval = null;
		}
		if (browser) {
			window.removeEventListener('online', updateOnlineStatus);
			window.removeEventListener('offline', updateOnlineStatus);
		}
	};

	return {
		get online() {
			return online;
		},
		get wasOffline() {
			return wasOffline;
		},
		refresh,
		checkConnectivity,
		cleanup
	};
};

const network = createStore();
export default network;

