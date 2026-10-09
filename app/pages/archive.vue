<script setup lang="ts">
import type { ArchiveStatusFilter } from '~/composables/useOrderArchive';
import ArchiveVirtualScroller from '~/features/archive/ArchiveVirtualScroller.vue';

usePageMeta({
	title: 'seo.pages.archive.title',
	description: 'seo.pages.archive.description',
});

const archive = useOrderArchive();
const toast = useToast();
const { locale } = useI18n();
const search = ref('');
const swiperContainer = ref<
	| (HTMLElement & {
			swiper?: { slideTo: (index: number, speed?: number) => void };
	  })
	| null
>(null);

const toDayKey = (value: Date): string => {
	const formatter = new Intl.DateTimeFormat('en-CA', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: 'Asia/Almaty',
	});
	const parts = formatter.formatToParts(value);
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find(item => item.type === type)?.value ?? '';

	return `${part('year')}-${part('month')}-${part('day')}`;
};

const today = toDayKey(new Date());
const range = ref<{ from: string; to: string } | null>({
	from: today,
	to: today,
});
const status = ref<ArchiveStatusFilter>('all');
const filters: Array<{ label: string; value: ArchiveStatusFilter }> = [
	{ label: 'archive.filters.all', value: 'all' },
	{ label: 'archive.filters.completed', value: 'completed' },
	{ label: 'archive.filters.cancelled', value: 'cancelled' },
	{ label: 'archive.filters.returned', value: 'returned' },
];

const selectStatus = (value: ArchiveStatusFilter, index: number) => {
	status.value = value;
	swiperContainer.value?.swiper?.slideTo(index, 300);
};

const load = async (): Promise<void> => {
	if (!range.value?.from || !range.value.to) {
		return;
	}

	const rangeDays =
		(Date.parse(range.value.to) - Date.parse(range.value.from)) /
		(24 * 60 * 60 * 1000);
	if (rangeDays > 89) {
		toast.open('archive.rangeError', 'error');
		return;
	}

	await archive.load({
		from: range.value.from,
		to: range.value.to,
		status: status.value,
	});
};

watch([range, status], load, { deep: true });
onMounted(load);

const filteredOrders = computed(() => {
	const query = search.value.trim().toLocaleLowerCase();
	if (!query) return archive.orders;
	return archive.orders.filter(order =>
		[order.orderCode, order.customerName, order.deliveryAddress].some(
			value => value?.toLocaleLowerCase().includes(query),
		),
	);
});
</script>

<template>
	<div class="grid items-end gap-4 lg:grid-cols-[minmax(320px,1fr)_1fr_1fr]">
		<Calendar
			v-model="range"
			:label="$t('calendarLabels.period')"
			mode="range"
			:locale="locale"
			date-format="dd.mm.yyyy"
		/>

		<div class="grid grid-cols-2 gap-3 lg:contents">
			<Island
				class="h-full"
				content-class="flex h-full min-h-20 flex-col justify-center gap-0.5 px-4 py-3 sm:gap-1 sm:px-5 sm:py-4"
			>
				<p class="min-h-10 text-sm leading-5 text-muted-foreground">
					{{ $t('archive.completedCount') }}
				</p>
				<p class="text-xl font-semibold sm:text-2xl">
					{{ archive.summary.completedCount }}
				</p>
			</Island>

			<Island
				class="h-full"
				content-class="flex h-full min-h-20 flex-col justify-center gap-0.5 px-4 py-3 sm:gap-1 sm:px-5 sm:py-4"
			>
				<p class="min-h-10 text-sm leading-5 text-muted-foreground">
					{{ $t('archive.completedAmount') }}
				</p>
				<p class="text-xl font-semibold sm:text-2xl">
					<Price :value="archive.summary.completedAmount" />
				</p>
			</Island>
		</div>
	</div>

	<swiper-container
		ref="swiperContainer"
		free-mode
		slides-per-view="auto"
		space-between="8"
		class="block min-w-0 max-w-full"
	>
		<swiper-slide v-for="(filter, index) in filters" :key="filter.value">
			<Chip
				:label="$t(filter.label)"
				:selected="status === filter.value"
				@click="selectStatus(filter.value, index)"
			/>
		</swiper-slide>
	</swiper-container>

	<Search v-model="search" :placeholder="$t('order.search')" />

	<Spinner v-if="archive.loading" />

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

<style scoped lang="scss">
swiper-container {
	width: 100%;
}

swiper-slide {
	width: auto !important;
	height: auto !important;
	display: flex;
	align-items: center;
}
</style>
