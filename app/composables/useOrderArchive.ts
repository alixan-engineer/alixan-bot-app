import { defineStore } from 'pinia';
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
	summary: {
		completedCount: number;
		completedAmount: number;
	};
};

export const useOrderArchive = defineStore('order-archive', () => {
	const orders = ref<ArchivedOrder[]>([]);
	const summary = ref<ArchiveResponse['summary']>({
		completedCount: 0,
		completedAmount: 0,
	});
	const loading = ref(false);

	const load = async (params: {
		from: string;
		to: string;
		status: ArchiveStatusFilter;
	}) => {
		loading.value = true;
		try {
			const query = new URLSearchParams(params);
			const response = await useApiFetch<ArchiveResponse>(
				`orders/archive?${query.toString()}`,
			);
			orders.value = response.orders;
			summary.value = response.summary;
			return response;
		} finally {
			loading.value = false;
		}
	};

	return { orders, summary, loading, load };
});
