import { defineStore } from 'pinia';
import type { Order } from './useOrders';
import type { PriceChangeLog } from './useProducts';
import type { Store } from './useStores';

export type DashboardSummary = {
	cards: {
		stores: number;
		activeStores: number;
		activeDumpingProducts: number;
	};
	priceBot: {
		mode: 'start' | 'stop';
	};
	orderPollStatuses: Array<{
		storeId: string;
		orderBotConnected: boolean;
		lastCheckedAt?: string | null;
		lastSuccessAt?: string | null;
		lastErrorAt?: string | null;
		lastError?: string | null;
		activeOrderCount: number;
		store?: Store | null;
	}>;
	recentPriceLogs: Array<PriceChangeLog & { store?: Store | null }>;
	recentOrders: Array<Order & { store?: Store | null }>;
};

export const useDashboard = defineStore('dashboard', () => {
	const summary = ref<DashboardSummary | null>(null);
	const loading = ref(false);

	let pendingSummary: Promise<DashboardSummary> | null = null;

	const getSummary = (): Promise<DashboardSummary> => {
		if (pendingSummary) return pendingSummary;
		loading.value = true;
		pendingSummary = useApiFetch<DashboardSummary>('dashboard/summary')
			.then(data => {
				summary.value = data;
				return data;
			})
			.finally(() => {
				loading.value = false;
				pendingSummary = null;
			});
		return pendingSummary;
	};

	return {
		summary,
		loading,
		getSummary,
	};
});
