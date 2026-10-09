<script setup lang="ts">
import { ChevronDown, Store } from '@lucide/vue';
import type { PickupPointChannel } from '~/composables/useBotSettings';
import TelegramStoreDrawer from './TelegramStoreDrawer.vue';

const botSettings = useBotSettings();
const drawer = useDrawer();
const loading = ref(true);
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
	try {
		points.value = await botSettings.getPickupPoints();
	} finally {
		loading.value = false;
	}
};

const configuredCount = (store: (typeof stores.value)[number]) =>
	store.points.filter(
		point =>
			point.expressTelegramChatId.trim() &&
			point.regularTelegramChatId.trim(),
	).length;

const openStore = (store: (typeof stores.value)[number]) => {
	drawer.open(TelegramStoreDrawer, {
		width: '600px',
		height: '760px',
		position: 'bottom',
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
	<Island content-class="flex flex-col gap-4 p-3.5 sm:gap-6 sm:p-6">
		<div>
			<p class="text-xl font-semibold">{{ $t('telegram.title') }}</p>
			<p class="mt-1 text-base text-muted-foreground">
				{{ $t('telegram.description') }}
			</p>
		</div>

		<Spinner v-if="loading" />
		<p v-else-if="!points.length" class="text-sm text-muted-foreground">
			{{ $t('telegram.noPickupPoints') }}
		</p>

		<div v-else class="space-y-6">
			<Island
				v-for="store in stores"
				:key="store.id"
				content-class="flex flex-row items-center p-4 gap-5 cursor-pointer hover:bg-secondary"
				variant="outlined"
				@click="openStore(store)"
			>
				<Store />
				<p class="flex-1">
					<span class="block truncate">{{ store.name }}</span>
					<span class="block text-sm font-normal text-muted-foreground">
						{{
							$t('telegram.chatsConfigured', {
								configured: configuredCount(store),
								total: store.points.length,
							})
						}}
					</span>
				</p>
				<ChevronDown />
			</Island>
		</div>
	</Island>
</template>
