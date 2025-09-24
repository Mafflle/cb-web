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