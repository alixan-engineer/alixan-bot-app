<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ArchiveVirtualScroller from '~/features/archive/ArchiveVirtualScroller.vue';
import OrdersGraph from '~/features/orders/OrdersGraph.vue';
import { buildOrderGraph } from '~/utils/order-graph';

usePageMeta({
	title: 'seo.pages.archive.title',
	description: 'seo.pages.archive.description',
});
const archive = useOrderArchive();
const toast = useToast();
const route = useRoute();
const { locale } = useI18n();
const { range, selectedTab, loadedRange, failed } = storeToRefs(archive);
if (route.query.tab === 'graph') selectedTab.value = 4;
const tabs = [
	'archive.filters.all',
	'archive.filters.completed',
	'archive.filters.cancelled',
	'archive.filters.returned',
	'ordersUi.graph',
];
const statuses = ['', 'COMPLETED', 'CANCELLED', 'RETURNED'];
const tabCounts = computed(() =>
	statuses.map(
		(status) =>
			archive.orders.filter((order) => !status || order.status === status)
				.length,
	),
);
const filteredOrders = computed(() =>
	archive.orders.filter(
		(order) =>
			!statuses[selectedTab.value] ||
			order.status === statuses[selectedTab.value],
	),
);
const graph = computed(() =>
	buildOrderGraph(
		archive.orders,
		loadedRange.value?.from ?? '',
		loadedRange.value?.to ?? '',
	),
);
const load = async (force = false) => {
	if (!range.value?.from || !range.value.to) return;
	const days =
		(Date.parse(range.value.to) - Date.parse(range.value.from)) / 86_400_000;
	if (days < 0 || days > 89) {
		toast.open('archive.rangeError', 'error');
		return;
	}
	try {
		await archive.load({ ...range.value, status: 'all' }, force);
	} catch {
		/* useApiFetch displays the error; the store retains the failure state. */
	}
};
watch(
	range,
	() => {
		void load();
	},
	{ deep: true },
);
onMounted(load);
</script>

<template>
	<div class="flex min-w-0 shrink-0 flex-col gap-6">
		<Calendar
			v-model="range"
			:label="$t('calendarLabels.period')"
			mode="range"
			:locale="locale"
			date-format="dd.mm.yyyy"
			class="max-w-xl"
		/>
		<div class="grid grid-cols-2 gap-3 sm:gap-4" :aria-busy="archive.loading">
			<Island
				class="h-full"
				content-class="flex h-full flex-col justify-between gap-2 p-4 sm:p-5"
			>
				<p class="text-sm text-muted-foreground">
					{{ $t('archive.completedCount') }}
				</p>
				<p class="text-xl font-semibold sm:text-2xl">
					{{ archive.loading || failed ? '—' : archive.summary.completedCount }}
				</p>
			</Island>
			<Island
				class="h-full"
				content-class="flex h-full flex-col justify-between gap-2 p-4 sm:p-5"
			>
				<p class="text-sm text-muted-foreground">
					{{ $t('archive.completedAmount') }}
				</p>
				<p class="text-xl font-semibold sm:text-2xl">
					<span v-if="archive.loading || failed">—</span
					><Price v-else :value="archive.summary.completedAmount" />
				</p>
			</Island>
		</div>
		<SwipeTabs
			v-model="selectedTab"
			:tabs="tabs"
			:counts="tabCounts"
			design="material"
			full
		/>
		<Spinner v-if="archive.loading" />
		<Empty
			v-else-if="failed"
			title="ordersUi.loadError"
			description="ordersUi.tryAgain"
			button="ordersUi.retry"
			@action="load(true)"
		/>
		<template v-else>
			<InfoBox v-if="archive.errors.length">{{
				$t('ordersUi.partialError')
			}}</InfoBox>
			<OrdersGraph v-if="selectedTab === 4" :data="graph" />
			<ArchiveVirtualScroller
				v-else-if="filteredOrders.length"
				:orders="filteredOrders"
			/>
			<Empty
				v-else
				title="archive.empty.title"
				description="archive.empty.description"
			/>
		</template>
	</div>
</template>
