import { defineStore } from 'pinia';

export type BotSettings = {
	_id: string;
	tenantId: string;
	priceStep: number;
	stockQuantity: number;
	autoRaiseEnabled: boolean;
	telegramEnabled: boolean;
	pickupPointChannels: PickupPointChannel[];
	orderSendStartHour: number;
	autoDispatchExpressOrders: boolean;
	createdAt?: string;
	updatedAt?: string;
};

export type PickupPointChannel = {
	storeId: string;
	externalStoreId: string;
	storeName: string;
	pointId: string;
	name: string;
	address: string;
	enabled: boolean;
	expressTelegramChatId: string;
	regularTelegramChatId: string;
};

export const useBotSettings = defineStore('bot-settings', () => {
	const settings = ref<BotSettings | null>(null);
	const loading = ref(false);

	const getSettings = async () => {
		loading.value = true;
		try {
			settings.value = await useApiFetch<BotSettings>('bot-settings');
			return settings.value;
		} finally {
			loading.value = false;
		}
	};

	const updateSettings = async (
		payload: Partial<Pick<
			BotSettings,
			| 'priceStep'
			| 'stockQuantity'
			| 'autoRaiseEnabled'
			| 'telegramEnabled'
			| 'orderSendStartHour'
			| 'autoDispatchExpressOrders'
		>>,
	) => {
		settings.value = await useApiFetch<BotSettings>('bot-settings', {
			method: 'PATCH',
			body: payload,
		});
		return settings.value;
	};

	const getPickupPoints = async () => {
		const points = await useApiFetch<PickupPointChannel[]>('bot-settings/pickup-points');
		if (settings.value) settings.value.pickupPointChannels = points;
		return points;
	};

	const updatePickupPoint = async (
		point: PickupPointChannel,
		expressTelegramChatId: string,
		regularTelegramChatId: string,
	) => {
		return useApiFetch<PickupPointChannel>(
			`bot-settings/pickup-points/${point.storeId}/${point.pointId}`,
			{
				method: 'PATCH',
				body: { expressTelegramChatId, regularTelegramChatId },
			},
		);
	};

	const testTelegram = async (message?: string) => {
		return await useApiFetch<{ ok: boolean }>('bot-settings/telegram/test', {
			method: 'POST',
			body: { message },
		});
	};

	return {
		settings,
		loading,
		getSettings,
		updateSettings,
		testTelegram,
		getPickupPoints,
		updatePickupPoint,
	};
});
