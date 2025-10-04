import type { RestaurantOpeningHours } from "../types/restaurants.types";

export const getOrderTotalPrice = (order: any) => {
	return order.total_price + order.delivery_fee + order.service_charge;
};

export const debounce = (func: (...args: any[]) => void, delay: number) => {
	let timeout: NodeJS.Timeout;
	return (...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), delay);
	};
}

export const getCurrentDayString = (): string => {
	return new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
}

export const isRestaurantOpen = (openingHours: RestaurantOpeningHours, currentTime: Date = new Date()): boolean => {
	const currentDay = getCurrentDayString();
	const currentHour = currentTime.getHours();
	const currentMinute = currentTime.getMinutes();

	const hours = openingHours[currentDay];
	if (!hours) return false;

	if (hours.open && hours.close)  {
		const [openHour, openMinute] = hours.open.split(':').map(Number);
		const [closeHour, closeMinute] = hours.close.split(':').map(Number);
	
		const isAfterOpening = currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute);
		const isBeforeClosing = currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute);
	
		return isAfterOpening && isBeforeClosing;
	} else {
		return false;
	}

};


export const getFormattedTime = (time: string): string => {
	const [hour, minute] = time.split(':').map(Number);
	const date = new Date();
	date.setHours(hour);
	date.setMinutes(minute);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};