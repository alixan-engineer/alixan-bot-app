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
const saving = ref(false);
const error = ref(false);
type PointChatIds = { express: string; regular: string };

const chatIds = reactive<Record<string, PointChatIds>>(
	Object.fromEntries(
		props.data.store.points.map((point) => [
			point.pointId,
			{
				express: point.expressTelegramChatId ?? '',
				regular: point.regularTelegramChatId ?? '',
			},
		]),
	),
);
const filledPoints = computed(() =>
	props.data.store.points.filter((point) => {
		const chats = chatIds[point.pointId];
		return chats?.express.trim() && chats.regular.trim();
	}),
);

const hasPartiallyFilledPoint = computed(() =>
	props.data.store.points.some((point) => {
		const chats = chatIds[point.pointId];
		return Boolean(chats?.express.trim()) !== Boolean(chats?.regular.trim());
	}),
);

const save = async () => {
	if (saving.value) return;
	error.value = false;
	if (hasPartiallyFilledPoint.value) {
		toast.open('telegram.pointChatsRequired', 'error');
		return;
	}
	if (!filledPoints.value.length) return;

	try {
		saving.value = true;
		const saved: Record<string, PointChatIds> = {};
		for (const point of filledPoints.value) {
			const express = chatIds[point.pointId].express.trim();
			const regular = chatIds[point.pointId].regular.trim();
			await botSettings.updatePickupPoint(point, express, regular);
			saved[point.pointId] = { express, regular };
			props.data.onSaved({ [point.pointId]: saved[point.pointId] });
		}
		toast.open('telegram.saved', 'success');
		props.close();
	} catch {
		error.value = true;
	} finally {
		saving.value = false;
	}
};
</script>

<template>
	<div class="flex max-h-[70dvh] flex-col">
		<div class="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-6">
			<div
				v-for="point in data.store.points"
				:key="point.pointId"
				class="rounded-xl border border-border p-4"
			>
				<div class="flex items-center justify-between">
					<p class="mb-3 text-lg font-semibold">{{ point.pointId }}</p>
					<span class="text-sm text-muted-foreground">{{
						$t(
							point.enabled
								? 'settings.pointEnabled'
								: 'settings.pointDisabled',
						)
					}}</span>
				</div>
				<p class="mb-4 text-base text-muted-foreground">{{ point.address }}</p>
				<div class="grid gap-4 sm:grid-cols-2">
					<Input
						v-model="chatIds[point.pointId].express"
						:id="`telegram-express-${point.storeId}-${point.pointId}`"
						autocomplete="off"
						:disabled="saving"
						label="telegram.pointExpressChatId"
					/>
					<Input
						v-model="chatIds[point.pointId].regular"
						:id="`telegram-regular-${point.storeId}-${point.pointId}`"
						autocomplete="off"
						:disabled="saving"
						label="telegram.pointRegularChatId"
					/>
				</div>
			</div>

			<p v-if="error" role="alert" class="text-sm text-destructive">
				{{ $t('settings.saveError') }}
			</p>
		</div>
		<div class="shrink-0 border-t p-4">
			<Button
				class="w-full"
				color="primary"
				label="common.save"
				:disabled="saving || !filledPoints.length || hasPartiallyFilledPoint"
				@click="save"
			/>
		</div>
	</div>
</template>
