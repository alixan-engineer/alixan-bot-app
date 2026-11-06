<script setup lang="ts">
import { ChevronRight, Store } from '@lucide/vue';
import type { PickupPointChannel } from '~/composables/useBotSettings';
import TelegramStoreDrawer from './TelegramStoreDrawer.vue';

const botSettings = useBotSettings();
const dialog = useDialog();
const loading = ref(true);
const failed = ref(false);
const points = ref<PickupPointChannel[]>([]);

const stores = computed(() => {
	const grouped = new Map<
		string,
		{ id: string; name: string; points: PickupPointChannel[] }
	>();
	for (const point of points.value) {
		const store = grouped.get(point.storeId) ?? {
			id: point.storeId,
			name: point.storeName,
			points: [],
		};
		store.points.push(point);
		grouped.set(point.storeId, store);
	}
	return [...grouped.values()];
});

const load = async () => {
	loading.value = true;
	failed.value = false;
	try {
		points.value = await botSettings.getPickupPoints();
	} catch {
		failed.value = true;
	} finally {
		loading.value = false;
	}
};

const configuredCount = (store: (typeof stores.value)[number]) =>
	store.points.filter(
		(point) =>
			point.expressTelegramChatId.trim() && point.regularTelegramChatId.trim(),
	).length;

const openStore = (store: (typeof stores.value)[number]) => {
	dialog.open(TelegramStoreDrawer, {
		width: '600px',
		height: 'auto',
		title: store.name,
		data: {
			store,
			onSaved: (
				saved: Record<string, { express: string; regular: string }>,
			) => {
				for (const point of store.points) {
					const pointChats = saved[point.pointId];
					if (!pointChats) continue;
					point.expressTelegramChatId = pointChats.express;
					point.regularTelegramChatId = pointChats.regular;
				}
			},
		},
	});
};

onMounted(load);
</script>

<template>
	<Island title="telegram.storeChannels" content-class="p-0">
		<div v-if="loading" class="p-4"><Spinner /></div>
		<div v-else-if="failed" class="space-y-3 p-4">
			<p role="alert" class="text-sm text-destructive">
				{{ $t('settings.loadError') }}
			</p>
			<Button label="settings.retry" @click="load" />
		</div>
		<p v-else-if="!points.length" class="p-4 text-sm text-muted-foreground">
			{{ $t('telegram.noPickupPoints') }}
		</p>
		<List v-else>
			<ListTile
				v-for="store in stores"
				:key="store.id"
				@click="openStore(store)"
			>
				<template #leading
					><Store class="size-5 text-muted-foreground" aria-hidden="true"
				/></template>
				<template #title
					><span class="block wrap-anywhere">{{ store.name }}</span></template
				>
				<template #description>
					<p>
						{{
							$t('telegram.chatsConfigured', {
								configured: configuredCount(store),
								total: store.points.length,
							})
						}}
					</p>
					<p
						v-for="point in store.points.filter(
							(point) =>
								point.expressTelegramChatId || point.regularTelegramChatId,
						)"
						:key="point.pointId"
						class="mt-1 wrap-anywhere"
					>
						{{ point.pointId }} · {{ $t('telegram.pointExpressChatId') }}:
						{{ point.expressTelegramChatId || '—' }} ·
						{{ $t('telegram.pointRegularChatId') }}:
						{{ point.regularTelegramChatId || '—' }}
					</p>
				</template>
				<template #trailing
					><ChevronRight
						class="size-5 text-muted-foreground"
						aria-hidden="true"
				/></template>
			</ListTile>
		</List>
	</Island>
</template>
