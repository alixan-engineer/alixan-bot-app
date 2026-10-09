<script setup lang="ts" generic="T extends Record<string, unknown>">
type ItemKey<TItem> =
	| keyof TItem
	| ((item: TItem, index: number) => string | number);

const props = withDefaults(
	defineProps<{
		items: T[];
		itemKey?: ItemKey<T>;
		rowHeight?: number;
		minColumnWidth?: number;
		gap?: number;
		overscanRows?: number;
		gridClass?: string;
	}>(),
	{
		rowHeight: 312,
		minColumnWidth: 240,
		gap: 12,
		overscanRows: 3,
		gridClass:
			'grid grid-cols-2 gap-3 min-[600px]:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]',
	},
);

const scrollEl = ref<HTMLElement | null>(null);
const headerEl = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const viewportHeight = ref(0);
const containerWidth = ref(0);
const headerHeight = ref(0);

const columns = computed(() => {
	if (containerWidth.value >= 600) {
		return Math.max(
			1,
			Math.floor(
				(containerWidth.value + props.gap) / (props.minColumnWidth + props.gap),
			),
		);
	}

	return 2;
});

const totalRows = computed(() => Math.ceil(props.items.length / columns.value));
const totalHeight = computed(() => totalRows.value * props.rowHeight);
const virtualScrollTop = computed(() =>
	Math.max(0, scrollTop.value - headerHeight.value),
);

const startRow = computed(() => {
	return Math.max(
		0,
		Math.floor(virtualScrollTop.value / props.rowHeight) - props.overscanRows,
	);
});

const endRow = computed(() => {
	const visibleRows = Math.ceil(viewportHeight.value / props.rowHeight);

	return Math.min(
		totalRows.value,
		startRow.value + visibleRows + props.overscanRows * 2,
	);
});

const visibleEntries = computed(() => {
	const start = startRow.value * columns.value;
	const end = endRow.value * columns.value;

	return props.items.slice(start, end).map((item, index) => ({
		item,
		index: start + index,
	}));
});

const offsetY = computed(() => startRow.value * props.rowHeight);

let resizeObserver: ResizeObserver | null = null;

const updateViewport = () => {
	if (!scrollEl.value) {
		return;
	}

	scrollTop.value = scrollEl.value.scrollTop;
	viewportHeight.value = scrollEl.value.clientHeight;
	containerWidth.value = scrollEl.value.clientWidth;
	headerHeight.value = headerEl.value?.offsetHeight ?? 0;
};

const getKey = (item: T, index: number) => {
	if (typeof props.itemKey === 'function') {
		return props.itemKey(item, index);
	}

	if (props.itemKey) {
		const value = item[props.itemKey];

		return typeof value === 'string' || typeof value === 'number'
			? value
			: index;
	}

	return index;
};

onMounted(() => {
	updateViewport();

	if (scrollEl.value) {
		resizeObserver = new ResizeObserver(updateViewport);
		resizeObserver.observe(scrollEl.value);

		if (headerEl.value) {
			resizeObserver.observe(headerEl.value);
		}
	}
});

onBeforeUnmount(() => {
	resizeObserver?.disconnect();
});

watch(
	() => props.items.length,
	() => {
		nextTick(updateViewport);
	},
);
</script>

<template>
	<div
		ref="scrollEl"
		class="min-h-0 flex-1 px-4 py-6 overflow-auto"
		@scroll="updateViewport"
	>
		<div v-if="$slots.header" ref="headerEl">
			<slot name="header" />
		</div>

		<div class="relative" :style="{ height: `${totalHeight}px` }">
			<div
				:class="['absolute inset-x-0 top-0', gridClass]"
				:style="{ transform: `translateY(${offsetY}px)` }"
			>
				<template
					v-for="entry in visibleEntries"
					:key="getKey(entry.item, entry.index)"
				>
					<slot :item="entry.item" :index="entry.index" />
				</template>
			</div>
		</div>
	</div>
</template>
