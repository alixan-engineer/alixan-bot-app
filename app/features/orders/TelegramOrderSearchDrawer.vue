<script setup lang="ts">
import type { Order } from '~/composables/useOrders';
import ArchiveVirtualScroller from '~/features/archive/ArchiveVirtualScroller.vue';

defineProps<{ close: () => void }>();
const search = ref('');
const orders = ref<Order[]>([]);
const loading = ref(false);
const failed = ref(false);
let requestId = 0;
let active = true;
const load = async () => {
	const id = ++requestId;
	failed.value = false;
	if (!search.value.trim()) {
		orders.value = [];
		loading.value = false;
		return;
	}
	loading.value = true;
	try {
		const response = await useApiFetch<Order[]>(
			`orders?search=${encodeURIComponent(search.value.trim())}`,
		);
		if (active && id === requestId) orders.value = response;
	} catch {
		if (active && id === requestId) failed.value = true;
	} finally {
		if (active && id === requestId) loading.value = false;
	}
};
onBeforeUnmount(() => {
	active = false;
});
</script>

<template>
	<div class="flex h-full flex-col">
		<div class="shrink-0 space-y-4 border-b p-4 sm:p-6">
			<Search
				v-model="search"
				:placeholder="$t('order.search')"
				autofocus
				@search="load"
			/>
			<p class="text-sm text-muted-foreground">
				{{ $t('ordersUi.telegramSearchHint') }}
			</p>
		</div>
		<div
			data-order-scroll
			class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
		>
			<Spinner v-if="loading" />
			<Empty
				v-else-if="failed"
				title="ordersUi.loadError"
				description="ordersUi.tryAgain"
				button="ordersUi.retry"
				@action="load"
			/>
			<template v-else>
				<p v-if="search.trim()" class="text-sm text-muted-foreground">
					{{ $t('ordersUi.results', { count: orders.length }) }}
				</p>
				<ArchiveVirtualScroller
					v-if="search.trim() && orders.length"
					:orders="orders"
				/>
				<Empty
					v-else
					:title="search.trim() ? 'order.empty.title' : 'ordersUi.enterSearch'"
					description="ordersUi.searchHint"
				/>
			</template>
		</div>
	</div>
</template>
