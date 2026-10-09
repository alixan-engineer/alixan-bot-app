<script setup lang="ts">
import StoreCard from '~/features/store/StoreCard.vue';

usePageMeta({
	title: 'seo.pages.stores.title',
	description: 'seo.pages.stores.description',
});

const stores = useStores();
let pollingTimer: ReturnType<typeof setInterval> | undefined;

const hasPendingStores = computed(() =>
	stores.stores.some(
		store => store.status === 'pending' || store.authStatus === 'pending',
	),
);
const hasEnabledStores = computed(() =>
	stores.stores.some(store => store.status === 'enable' && store.storeId),
);

onMounted(async () => {
	await stores.getStores();
	pollingTimer = setInterval(() => {
		if (hasPendingStores.value) {
			stores.getStores().catch(() => undefined);
		}
	}, 3_000);
});

onBeforeUnmount(() => {
	if (pollingTimer) {
		clearInterval(pollingTimer);
	}
});
</script>

<template>
	<div class="flex gap-3">
		<AddStoreButton />
		<MainStoreAction v-if="hasEnabledStores" />
	</div>

	<Spinner v-if="stores.loading && !stores.stores.length" />

	<div v-else-if="stores.stores.length" class="space-y-6">
		<StoreCard v-for="store in stores.stores" :key="store._id" :store="store" />
	</div>

	<Empty
		v-else
		title="store.empty.title"
		description="store.empty.description"
	/>
</template>
