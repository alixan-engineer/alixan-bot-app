import { defineStore } from 'pinia';

export type GraphPoint = { date: string; count: number };
export type WeekdayPoint = { weekday: number; count: number };
export type HourPoint = { hour: number; count: number };
export type PopularProduct = {
	sku: string;
	title: string;
	quantity: number;
	ordersCount: number;
	imageUrl?: string;
};

export const useAnalytics = defineStore('analytics', () => {
	const graph = ref<GraphPoint[]>([]);
	const weekdayPoints = ref<WeekdayPoint[]>([]);
	const hourPoints = ref<HourPoint[]>([]);
	const total = ref(0);
	const popularProducts = ref<PopularProduct[]>([]);
	const loading = ref(false);

	const loadGraph = async (from: string, to: string) => {
		loading.value = true;
		try {
			const query = new URLSearchParams({ from, to });
			const response = await useApiFetch<{
				points: GraphPoint[];
				weekdayPoints: WeekdayPoint[];
				hourPoints: HourPoint[];
				total: number;
			}>(`orders/analytics/graph?${query}`);
			graph.value = response.points;
			weekdayPoints.value = response.weekdayPoints ?? [];
			hourPoints.value = response.hourPoints ?? [];
			total.value = response.total;
		} finally {
			loading.value = false;
		}
	};

	const loadPopularProducts = async (from: string, to: string) => {
		loading.value = true;
		try {
			const query = new URLSearchParams({ from, to });
			const response = await useApiFetch<{ products: PopularProduct[] }>(
				`orders/analytics/popular-products?${query}`,
			);
			popularProducts.value = response.products;
		} finally {
			loading.value = false;
		}
	};

	return {
		graph,
		weekdayPoints,
		hourPoints,
		total,
		popularProducts,
		loading,
		loadGraph,
		loadPopularProducts,
	};
});
