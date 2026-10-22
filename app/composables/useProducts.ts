import { defineStore } from 'pinia';

export type ProductStatus = 'draft' | 'enable' | 'disable';

export type ProductStore = {
	storeId: string;
	merchantUid: string;
	storeName: string;
	isMain: boolean;
	currentPrice?: number | null;
	available: boolean;
	sku: string;
};

export type KaspiOffer = {
	sellerId: string;
	sellerName?: string;
	price: number;
	isOwn?: boolean;
};

export type PriceChangeLog = {
	_id: string;
	storeId: string;
	merchantUid: string;
	sku: string;
	masterSku: string;
	masterTitle?: string | null;
	cityId: string;
	oldPrice?: number | null;
	newPrice?: number | null;
	minPrice?: number | null;
	maxPrice?: number | null;
	priceStep: number;
	competitorPrice?: number | null;
	competitorId?: string | null;
	competitorName?: string | null;
	reason: string;
	status: 'success' | 'failed' | 'skipped' | 'pending';
	error?: string | null;
	createdAt?: string;
	updatedAt?: string;
};

export type CityConfig = {
	cityId: string;
	minPrice?: number | null;
	maxPrice?: number | null;
	status: ProductStatus;
};

export type Product = {
	cityId: string;
	cities: Array<{ id: string; name: string }>;
	cityConfigs: CityConfig[];
	key: string;
	configId?: string | null;
	sku: string;
	masterSku: string;
	masterTitle: string;
	shopLink?: string | null;
	images: string[];
	stores: ProductStore[];
	minPrice?: number | null;
	maxPrice?: number | null;
	status: ProductStatus;
	lowestCompetitorPrice?: number | null;
	competitorBelowMin?: boolean;
};

export type IgnoredCompetitor = {
	_id: string;
	storeId: string;
	merchantUid: string;
	competitorId: string;
	status: 'disable';
};

export type CatalogSyncState = {
	groupId: string;
	status: 'idle' | 'queued' | 'running' | 'completed' | 'failed';
	totalProducts: number;
	processedProducts: number;
	addedProducts: number;
	failedProducts: number;
	failedOperations: number;
	skippedProducts: number;
	currentMasterSku?: string | null;
	currentTitle?: string | null;
	error?: string | null;
	startedAt?: string | null;
	completedAt?: string | null;
};

export const useProducts = defineStore('products', () => {
	const products = ref<Product[]>([]);
	const cities = ref<Array<{ id: string; name: string }>>([]);
	const cityId = ref('');
	const currentProduct = ref<Product | null>(null);
	const logs = ref<PriceChangeLog[]>([]);
	const ignoredCompetitors = ref<IgnoredCompetitor[]>([]);
	const loading = ref(false);
	const catalogUpdatedAt = ref<string | null>(null);
	let catalogRequestId = 0;

	const getProducts = async (refresh = false) => {
		const requestId = ++catalogRequestId;
		loading.value = true;
		try {
			cities.value = await useApiFetch<Array<{ id: string; name: string }>>(
				'stores/cities',
			);
			if (!cities.value.some((city) => city.id === cityId.value))
				cityId.value = cities.value[0]?.id ?? '';
			const response = await useApiFetch<{
				products: Product[];
				updatedAt: string;
			}>(
				`products/catalog${
					refresh ? '/refresh' : ''
				}?cityId=${encodeURIComponent(cityId.value)}`,
				refresh ? { method: 'POST' } : undefined,
			);
			if (requestId !== catalogRequestId) return;
			products.value = response.products;
			catalogUpdatedAt.value = response.updatedAt;
		} finally {
			if (requestId === catalogRequestId) loading.value = false;
		}
	};

	const disableRemovedProducts = async (selectedCity: string) =>
		await useApiFetch<{ disabledCount: number }>(
			`products/disable-removed?cityId=${encodeURIComponent(selectedCity)}`,
			{
				method: 'POST',
			},
		);

	const disableBelowMinProducts = async (selectedCity: string) =>
		await useApiFetch<{ disabledCount: number }>(
			`products/disable-below-min?cityId=${encodeURIComponent(selectedCity)}`,
			{ method: 'POST' },
		);

	const synchronizeProducts = async () =>
		await useApiFetch<CatalogSyncState>('products/synchronize', {
			method: 'POST',
		});

	const getSynchronizationStatus = async () =>
		await useApiFetch<CatalogSyncState>('products/synchronize/status');

	const productPath = (masterSku: string) =>
		`products/${encodeURIComponent(masterSku)}`;

	const getProduct = async (masterSku: string, selectedCity = cityId.value) => {
		const product = await useApiFetch<Product>(
			`${productPath(masterSku)}?cityId=${encodeURIComponent(selectedCity)}`,
		);
		currentProduct.value = product;
		return product;
	};

	const getOffers = async (masterSku: string, selectedCity = cityId.value) =>
		await useApiFetch<KaspiOffer[]>(
			`products/offers/${encodeURIComponent(
				masterSku,
			)}?cityId=${encodeURIComponent(selectedCity)}`,
		);

	const updateProduct = async (
		masterSku: string,
		payload: Partial<
			Pick<Product, 'minPrice' | 'maxPrice' | 'status' | 'cityId'>
		>,
	) => {
		const product = await useApiFetch<Product>(productPath(masterSku), {
			method: 'PATCH',
			body: { ...payload, cityId: payload.cityId ?? cityId.value },
		});
		products.value = products.value.map((item) =>
			item.key === product.key && item.cityId === product.cityId
				? product
				: item,
		);
		if (
			currentProduct.value?.key === product.key &&
			currentProduct.value?.cityId === product.cityId
		)
			currentProduct.value = product;
		return product;
	};

	const getLogs = async (
		params: {
			storeId?: string;
			cityId?: string;
			masterSku?: string;
			sku?: string;
			status?: string;
		} = {},
	) => {
		const query = new URLSearchParams();
		const selectedCity = params.cityId ?? cityId.value;
		if (selectedCity) query.set('cityId', selectedCity);
		if (params.storeId) query.set('storeId', params.storeId);
		if (params.masterSku) query.set('masterSku', params.masterSku);
		if (params.sku) query.set('sku', params.sku);
		if (params.status) query.set('status', params.status);
		const suffix = query.toString() ? `?${query.toString()}` : '';
		const response = await useApiFetch<PriceChangeLog[]>(
			`price-change-logs${suffix}`,
		);
		logs.value = response;
		return response;
	};

	const getIgnoredCompetitors = async () => {
		ignoredCompetitors.value = await useApiFetch<IgnoredCompetitor[]>(
			'products/ignored-competitors',
		);
		return ignoredCompetitors.value;
	};

	const addIgnoredCompetitor = async (competitorId: string) => {
		const competitor = await useApiFetch<IgnoredCompetitor>(
			'products/ignored-competitors',
			{ method: 'POST', body: { competitorId } },
		);
		ignoredCompetitors.value = [
			competitor,
			...ignoredCompetitors.value.filter(
				(item) => item.competitorId !== competitor.competitorId,
			),
		];
		return competitor;
	};

	const removeIgnoredCompetitor = async (competitorId: string) => {
		await useApiFetch(
			`products/ignored-competitors/${encodeURIComponent(competitorId)}`,
			{
				method: 'DELETE',
			},
		);
		ignoredCompetitors.value = ignoredCompetitors.value.filter(
			(item) => item.competitorId !== competitorId,
		);
	};

	return {
		cities,
		cityId,
		catalogUpdatedAt,
		products,
		currentProduct,
		logs,
		ignoredCompetitors,
		loading,
		getProducts,
		synchronizeProducts,
		disableRemovedProducts,
		disableBelowMinProducts,
		getSynchronizationStatus,
		getProduct,
		getOffers,
		updateProduct,
		getLogs,
		getIgnoredCompetitors,
		addIgnoredCompetitor,
		removeIgnoredCompetitor,
	};
});
