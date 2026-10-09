<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { ComponentPublicInstance } from 'vue';
import type { Product } from '~/composables/useProducts';
import ProductCard from './ProductCard.vue';

const props = defineProps<{
	products: Product[];
	onSaved?: () => Promise<void> | void;
}>();

const CARD_MIN_WIDTH = 280;
const DESKTOP_GRID_GAP = 24;
const MOBILE_GRID_GAP = 12;

const containerRef = ref<HTMLElement | null>(null);
const scrollElement = shallowRef<HTMLElement | null>(null);
const containerWidth = ref(0);
const viewportWidth = ref(0);
const scrollMargin = ref(0);

let resizeObserver: ResizeObserver | undefined;

const gridGap = computed(() =>
	viewportWidth.value > 0 && viewportWidth.value <= 768
		? MOBILE_GRID_GAP
		: DESKTOP_GRID_GAP,
);

const columnCount = computed(() => {
	if (viewportWidth.value > 0 && viewportWidth.value <= 768) {
		return 2;
	}

	return Math.max(
		1,
		Math.floor(
			(containerWidth.value + gridGap.value) / (CARD_MIN_WIDTH + gridGap.value),
		),
	);
});

const rows = computed(() => {
	const result: Product[][] = [];

	for (
		let index = 0;
		index < props.products.length;
		index += columnCount.value
	) {
		result.push(props.products.slice(index, index + columnCount.value));
	}

	return result;
});

const estimatedRowHeight = computed(() => {
	const availableWidth =
		containerWidth.value - gridGap.value * (columnCount.value - 1);
	const cardWidth = availableWidth / columnCount.value;

	return Math.max(320, cardWidth * 0.75 + 176);
});

const virtualizerOptions = computed(() => ({
	count: rows.value.length,
	estimateSize: () => estimatedRowHeight.value,
	gap: gridGap.value,
	getItemKey: (index: number) => rows.value[index]?.[0]?.key ?? index,
	getScrollElement: () => scrollElement.value,
	overscan: 2,
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

	containerWidth.value = containerRect.width;
	viewportWidth.value = window.innerWidth;
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

watch(containerRef, container => {
	resizeObserver?.disconnect();
	resizeObserver = undefined;

	if (!container) {
		scrollElement.value = null;
		return;
	}

	scrollElement.value = container.closest('main');
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
			v-for="(virtualRow, i) in virtualRows"
			:key="i"
			:ref="measureRow"
			:data-index="virtualRow.index"
			class="absolute left-0 top-0 grid w-full"
			:style="{
				gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
				gap: `${gridGap}px`,
				transform: `translateY(${virtualRow.start - scrollMargin}px)`,
			}"
		>
			<ProductCard
				v-for="product in rows[virtualRow.index]"
				:key="product.key"
				:product="product"
				:on-saved="onSaved"
			/>
		</div>
	</div>
</template>
