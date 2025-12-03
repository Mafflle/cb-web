import type { RestaurantOpeningHours } from "../types/restaurants.types";

/**
 * Gets the total price for an order including delivery fee and service charge.
 * If the order already has a 'total' field, it returns that.
 * Otherwise, it calculates from total_price + delivery_fee + service_charge.
 */
export const getOrderTotalPrice = (order: {
	total?: number;
	total_price?: number;
	delivery_fee?: number;
	service_charge?: number;
}): number => {
	// If order has a pre-calculated total, use that
	if (order.total !== undefined) {
		return order.total;
	}
	// Otherwise calculate from components
	const totalPrice = order.total_price ?? 0;
	const deliveryFee = order.delivery_fee ?? 0;
	const serviceCharge = order.service_charge ?? 0;
	return totalPrice + deliveryFee + serviceCharge;
};

export const convertAmount = (amount: number, exchangeRate: number): number => {
	return Math.ceil(amount / exchangeRate);
}

export const debounce = (func: (...args: any[]) => void, delay: number) => {
	let timeout: ReturnType<typeof setTimeout>;
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