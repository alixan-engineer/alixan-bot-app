<script setup lang="ts">
import type { PickupPointChannel } from '~/composables/useBotSettings';

type StoreChannels = {
	id: string;
	name: string;
	points: PickupPointChannel[];
};

const props = defineProps<{
	data: {
		store: StoreChannels;
		onSaved: (chatIds: Record<string, PointChatIds>) => void;
	};
	close: () => void;
}>();

const botSettings = useBotSettings();
const toast = useToast();
const loader = useGlobalLoader();
type PointChatIds = { express: string; regular: string };

const chatIds = reactive<Record<string, PointChatIds>>(
	Object.fromEntries(
		props.data.store.points.map(point => [
			point.pointId,
			{
				express: point.expressTelegramChatId,
				regular: point.regularTelegramChatId,
			},
		]),
	),
);
const filledPoints = computed(() =>
	props.data.store.points.filter(point => {
		const chats = chatIds[point.pointId];
		return chats?.express.trim() && chats.regular.trim();
	}),
);

const hasPartiallyFilledPoint = computed(() =>
	props.data.store.points.some(point => {
		const chats = chatIds[point.pointId];
		return Boolean(chats?.express.trim()) !== Boolean(chats?.regular.trim());
	}),
);

const save = async () => {
	if (hasPartiallyFilledPoint.value) {
		toast.open('telegram.pointChatsRequired', 'error');
		return;
	}
	if (!filledPoints.value.length) return;

	try {
		loader.show();
		const saved: Record<string, PointChatIds> = {};
		for (const point of filledPoints.value) {
			const express = chatIds[point.pointId].express.trim();
			const regular = chatIds[point.pointId].regular.trim();
			await botSettings.updatePickupPoint(point, express, regular);
			saved[point.pointId] = { express, regular };
		}
		props.data.onSaved(saved);
		toast.open('telegram.saved', 'success');
		props.close();
	} finally {
		loader.hide();
	}
};
</script>

<template>
	<div class="flex min-h-full flex-col gap-4 p-4 sm:p-6">
		<div
			v-for="point in data.store.points"
			:key="point.pointId"
			class="rounded-xl border border-border p-4"
		>
			<div class="flex items-center justify-between">
				<p class="mb-3 text-lg font-semibold">{{ point.pointId }}</p>
				<Switch v-model="point.enabled" label="Статус" disabled />
			</div>
			<p class="mb-4 text-base text-muted-foreground">{{ point.address }}</p>
			<div class="grid gap-4 sm:grid-cols-2">
				<Input
					v-model="chatIds[point.pointId].express"
					:id="`telegram-express-${point.storeId}-${point.pointId}`"
					autocomplete="off"
					label="telegram.pointExpressChatId"
				/>
				<Input
					v-model="chatIds[point.pointId].regular"
					:id="`telegram-regular-${point.storeId}-${point.pointId}`"
					autocomplete="off"
					label="telegram.pointRegularChatId"
				/>
			</div>
		</div>

		<div class="flex-1" />
		<Button
			class="w-full"
			color="primary"
			label="common.save"
			:disabled="!filledPoints.length || hasPartiallyFilledPoint"
			@click="save"
		/>
	</div>
</template>
