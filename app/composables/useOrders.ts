import { defineStore } from 'pinia';
import type { Store } from './useStores';

export type OrderItem = {
	sku?: string;
	title: string;
	quantity: number;
	unitPrice?: number;
	totalPrice?: number;
	imageUrl?: string;
};

export type Order = {
	_id: string;
	dedupeKey: string;
	sourceOrderId: string;
	externalStoreId: string;
	createdAt: number;
	status: string;
	customerName: string;
	customerPhone?: string;
	deliveryType: string;
	deliveryAddress?: string;
	deliveryPlannedAt?: number;
	assemblyDeadlineAt?: number;
	items: OrderItem[];
	totalAmount: number;
	currency: string;
	telegramStatus?: string;
	telegramAssignedTo?: string;
	store?: Store | null;
};

export type OrderPollStatus = {
	_id: string;
	storeId: string;
	lastCheckedAt: string;
	lastSuccessAt?: string | null;
	lastErrorAt?: string | null;
	lastError?: string | null;
	activeOrderCount: number;
	createdAt?: string;
	updatedAt?: string;
};

export type StoreOrderStatus = {
	store: Store;
	status: OrderPollStatus | null;
};

export const useOrders = defineStore('orders', () => {
	const orders = ref<Order[]>([]);
	const statuses = ref<StoreOrderStatus[]>([]);
	const loading = ref(false);

	const getOrders = async () => {
		orders.value = await useApiFetch<Order[]>('orders');
		return orders.value;
	};

	const getStatuses = async () => {
		statuses.value = await useApiFetch<StoreOrderStatus[]>('orders/statuses');
		return statuses.value;
	};

	const load = async () => {
		loading.value = true;
		try {
			await Promise.all([getOrders(), getStatuses()]);
		} finally {
			loading.value = false;
		}
	};

	return {
		orders,
		statuses,
		loading,
		getOrders,
		getStatuses,
		load,
	};
});
