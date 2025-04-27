export const getOrderTotalPrice = (order: any) => {
	return order.total_price + order.delivery_fee + order.service_charge;
};
