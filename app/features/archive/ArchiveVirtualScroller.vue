<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { ComponentPublicInstance } from 'vue';
import type { Order } from '~/composables/useOrders';
import type { ArchivedOrder } from '~/composables/useOrderArchive';
import OrderCard from '~/features/order/OrderCard.vue';

const props = defineProps<{
	orders: Array<ArchivedOrder | Order>;
}>();

const DESKTOP_BREAKPOINT = 900;
const MOBILE_GAP = 12;
const DESKTOP_GAP = 20;

const containerRef = ref<HTMLElement | null>(null);
const scrollElement = shallowRef<HTMLElement | null>(null);
const viewportWidth = ref(0);
const scrollMargin = ref(0);

let resizeObserver: ResizeObserver | undefined;

const columnCount = computed(() =>
	viewportWidth.value >= DESKTOP_BREAKPOINT ? 2 : 1,
);
const gridGap = computed(() =>
	viewportWidth.value >= 640 ? DESKTOP_GAP : MOBILE_GAP,
);

const rows = computed(() => {
	const result: Array<Array<ArchivedOrder | Order>> = [];

	for (let index = 0; index < props.orders.length; index += columnCount.value) {
		result.push(props.orders.slice(index, index + columnCount.value));
	}

	return result;
});

const virtualizerOptions = computed(() => ({
	count: rows.value.length,
	estimateSize: () => (viewportWidth.value >= 640 ? 260 : 220),
	gap: gridGap.value,
	getItemKey: (index: number) => rows.value[index]?.[0]?.dedupeKey ?? index,
	getScrollElement: () => scrollElement.value,
	overscan: 3,
	scrollMargin: scrollMargin.value,
}));

const rowVirtualizer = useVirtualizer(virtualizerOptions);
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

const updateMetrics = (): void => {
	const container = containerRef.value;
	const scroller = scrollElement.value;

	if (!container || !scroller) {
		return;
	}

	const containerRect = container.getBoundingClientRect();
	const scrollerRect = scroller.getBoundingClientRect();

	viewportWidth.value = container.clientWidth;
	scrollMargin.value =
		containerRect.top - scrollerRect.top + scroller.scrollTop;
};

const measureRow = (
	element: Element | ComponentPublicInstance | null,
): void => {
	const node =
		element instanceof HTMLElement
			? element
			: (element?.$el as Element | undefined);

	if (node instanceof HTMLElement) {
		rowVirtualizer.value.measureElement(node);
	}
};

watch(containerRef, (container) => {
	resizeObserver?.disconnect();
	resizeObserver = undefined;

	if (!container) {
		scrollElement.value = null;
		return;
	}

	scrollElement.value = container.closest<HTMLElement>(
		'[data-order-scroll], main',
	);
	updateMetrics();
	resizeObserver = new ResizeObserver(updateMetrics);
	resizeObserver.observe(container);
});

watch([rows, columnCount], async () => {
	await nextTick();
	updateMetrics();
	rowVirtualizer.value.measure();
});

onMounted(() => {
	window.addEventListener('resize', updateMetrics);
});

onBeforeUnmount(() => {
	resizeObserver?.disconnect();
	window.removeEventListener('resize', updateMetrics);
});
</script>

<template>
	<div
		ref="containerRef"
		class="relative w-full shrink-0"
		:style="{ height: `${totalSize}px` }"
	>
		<div
			v-for="virtualRow in virtualRows"
			:key="virtualRow.key"
			:ref="measureRow"
			:data-index="virtualRow.index"
			class="absolute left-0 top-0 grid w-full"
			:style="{
				gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
				gap: `${gridGap}px`,
				transform: `translateY(${virtualRow.start - scrollMargin}px)`,
			}"
		>
			<OrderCard
				v-for="order in rows[virtualRow.index]"
				:key="order.dedupeKey"
				:order="order"
			/>
		</div>
	</div>
</template>
