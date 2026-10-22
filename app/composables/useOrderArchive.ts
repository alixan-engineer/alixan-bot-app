import { defineStore } from 'pinia';
import { toAlmatyDay } from '~/utils/order-graph';
import type { Store } from './useStores';

export type ArchiveStatusFilter =
	| 'all'
	| 'completed'
	| 'cancelled'
	| 'returned';

export type ArchivedOrderItem = {
	sku?: string;
	title: string;
	quantity: number;
	unitPrice?: number;
	totalPrice?: number;
	imageUrl?: string;
};

export type ArchivedOrder = {
	_id: string;
	dedupeKey: string;
	externalStoreId: string;
	orderCode: string;
	status: string;
	customerName?: string;
	totalAmount: number;
	createdAt: number;
	modifiedAt: number;
	deliveredAt?: number;
	deliveryAddress?: string;
	cancellationReasonCode?: string;
	items: ArchivedOrderItem[];
	store?: Store | null;
};

type ArchiveResponse = {
	orders: ArchivedOrder[];
	errors?: Array<{ storeId: string; message: string }>;
	summary: {
		completedCount: number;
		completedAmount: number;
	};
};

type ArchiveRange = { from: string; to: string };
type ArchiveParams = ArchiveRange & { status: ArchiveStatusFilter };

export const useOrderArchive = defineStore('order-archive', () => {
	const range = useState<ArchiveRange | null>('kaspi-archive-range', () => ({
		from: toAlmatyDay(Date.now() - 6 * 86_400_000),
		to: toAlmatyDay(Date.now()),
	}));
	const selectedTab = useState('kaspi-archive-tab', () => 0);
	const loadedRange = useState<ArchiveRange | null>(
		'kaspi-archive-loaded-range',
		() => null,
	);
	const orders = useState<ArchivedOrder[]>('kaspi-archive-orders', () => []);
	const errors = useState<Array<{ storeId: string; message: string }>>(
		'kaspi-archive-errors',
		() => [],
	);
	const summary = useState<ArchiveResponse['summary']>(
		'kaspi-archive-summary',
		() => ({ completedCount: 0, completedAmount: 0 }),
	);
	const loadedQuery = useState<string | null>(
		'kaspi-archive-loaded-query',
		() => null,
	);
	const failed = useState('kaspi-archive-failed', () => false);
	const loading = ref(false);
	let requestId = 0;
	let pending: { key: string; task: Promise<ArchiveResponse> } | null = null;

	const load = (
		params: ArchiveParams,
		force = false,
	): Promise<ArchiveResponse> => {
		const query = new URLSearchParams(params).toString();
		if (pending?.key === query) return pending.task;
		if (!force && loadedQuery.value === query && !failed.value) {
			if (pending) {
				// Returning to the cached period supersedes another in-flight period.
				requestId += 1;
				pending = null;
				loading.value = false;
			}
			return Promise.resolve({
				orders: orders.value,
				summary: summary.value,
				errors: errors.value,
			});
		}
		const id = ++requestId;
		loading.value = true;
		failed.value = false;
		const task = (async () => {
			try {
				const response = await useApiFetch<ArchiveResponse>(
					`orders/archive?${query}`,
				);
				if (id !== requestId) return response;
				errors.value = response.errors ?? [];
				orders.value = response.orders;
				summary.value = response.summary;
				loadedRange.value = { from: params.from, to: params.to };
				loadedQuery.value = query;
				return response;
			} catch (error) {
				if (id === requestId) failed.value = true;
				throw error;
			} finally {
				if (id === requestId) {
					loading.value = false;
					pending = null;
				}
			}
		})();
		pending = { key: query, task };
		return task;
	};

	return {
		range,
		selectedTab,
		loadedRange,
		orders,
		summary,
		errors,
		failed,
		loading,
		load,
	};
});
