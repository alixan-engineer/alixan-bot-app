import { defineStore } from 'pinia';

export type StoreStatus = 'pending' | 'enable' | 'disable' | 'auth_error' | 'deleting';
export type StoreAuthStatus = 'pending' | 'success' | 'failed';

export type Store = {
	_id: string;
	storeId?: string | null;
	name: string;
	email: string;
	cityId: string;
	cities: Array<{ id: string; name: string }>; 
	isMain?: boolean;
	priceBotEnabled?: boolean;
	pickupPointSuffixes?: string[];
	status: StoreStatus;
	authStatus?: StoreAuthStatus;
	authError?: string | null;
	lastAuthAt?: string | null;
	createdAt: string;
	updatedAt: string;
};

type UpdateStorePayload = {
	name?: string;
	email?: string;
	password?: string;
};

export const useStores = defineStore('stores', () => {
	const stores = ref<Store[]>([]);
	const loading = ref(false);

	const getStores = async () => {
		if (loading.value) return;

		try {
			loading.value = true;
			stores.value = await useApiFetch<Store[]>('stores');
		} catch {
			stores.value = [];
		} finally {
			loading.value = false;
		}
	};


	const updateStore = async (id: string, payload: UpdateStorePayload) => {
		const store = await useApiFetch<Store>(`stores/${id}`, {
			method: 'PATCH',
			body: payload,
		});
		stores.value = stores.value.map(item => item._id === store._id ? store : item);
		return store;
	};

	const retryAuth = async (id: string) => {
		const store = await useApiFetch<Store>(`stores/${id}/retry-auth`, {
			method: 'PATCH',
		});
		stores.value = stores.value.map(item => item._id === store._id ? store : item);
		return store;
	};

	const updateStatus = async (id: string, status: 'enable' | 'disable') => {
		const store = await useApiFetch<Store>(`stores/${id}/status`, {
			method: 'PATCH',
			body: { status },
		});
		stores.value = stores.value.map(item => item._id === store._id ? store : item);
		return store;
	};

	const updatePriceBotStatus = async (id: string, enabled: boolean) => {
		const store = await useApiFetch<Store>(`stores/${id}/price-bot`, {
			method: 'PATCH',
			body: { enabled },
		});
		stores.value = stores.value.map(item => item._id === store._id ? store : item);
		return store;
	};

	const setMainStore = async (id: string) => {
		const store = await useApiFetch<Store>('stores/main', {
			method: 'PATCH',
			body: { id },
		});
		stores.value = stores.value.map(item => ({
			...item,
			isMain: item._id === store._id,
		}));
		return store;
	};

	const removeStore = async (id: string) => {
		await useApiFetch<Store>(`stores/${id}`, {
			method: 'DELETE',
		});
		stores.value = stores.value.filter(item => item._id !== id);
	};

	const statusView = (store: Store) => {
		if (store.status === 'disable') {
			return {
				text: 'store.status.disable',
				status: 'warning' as const,
			};
		}

		if (store.status === 'enable') {
			return {
				text: 'store.status.enable',
				status: 'success' as const,
			};
		}

		if (store.status === 'pending' || store.authStatus === 'pending') {
			return {
				text: 'store.status.pending',
				status: 'warning' as const,
			};
		}

		return {
			text: 'store.status.authError',
			status: 'error' as const,
		};
	};

	return {
		stores,
		loading,
		getStores,
		updateStore,
		retryAuth,
		updateStatus,
		updatePriceBotStatus,
		setMainStore,
		removeStore,
		statusView,
	};
});
