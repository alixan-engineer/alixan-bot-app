import { defineStore } from 'pinia';

export type PriceBotMode = 'start' | 'stop';

export type PriceBotState = {
	_id: string;
	singletonKey: string;
	mode: PriceBotMode;
	createdAt?: string;
	updatedAt?: string;
};

export const usePriceBot = defineStore('price-bot', () => {
	const state = ref<PriceBotState | null>(null);
	const loading = ref(false);

	const getState = async () => {
		loading.value = true;
		try {
			state.value = await useApiFetch<PriceBotState>('price-bot/state');
			return state.value;
		} finally {
			loading.value = false;
		}
	};

	const setMode = async (mode: PriceBotMode) => {
		state.value = await useApiFetch<PriceBotState>('price-bot/state', {
			method: 'PATCH',
			body: { mode },
		});
		return state.value;
	};

	return {
		state,
		loading,
		getState,
		setMode,
	};
});
