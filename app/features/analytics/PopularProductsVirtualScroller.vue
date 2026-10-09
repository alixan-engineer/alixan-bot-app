<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { ComponentPublicInstance } from 'vue';
import type { PopularProduct } from '~/composables/useAnalytics';
import PopularProductCard from './PopularProductCard.vue';

const props = defineProps<{ products: PopularProduct[] }>();

const containerRef = ref<HTMLElement | null>(null);
const scrollElement = shallowRef<HTMLElement | null>(null);
const containerWidth = ref(0);
const viewportWidth = ref(0);
const scrollMargin = ref(0);
let resizeObserver: ResizeObserver | undefined;

const gap = computed(() => (viewportWidth.value >= 640 ? 16 : 12));

const columns = computed(() => {
	if (viewportWidth.value >= 1280) return 3;
	return 2;
});

const rows = computed(() => {
	const result: PopularProduct[][] = [];

	for (let index = 0; index < props.products.length; index += columns.value) {
		result.push(props.products.slice(index, index + columns.value));
	}

	return result;
});

const virtualizer = useVirtualizer(
	computed(() => ({
		count: rows.value.length,
		estimateSize: () => 330,
		gap: gap.value,
		getItemKey: (index: number) =>
			rows.value[index]?.[0]?.sku || rows.value[index]?.[0]?.title || index,
		getScrollElement: () => scrollElement.value,
		overscan: 3,
		scrollMargin: scrollMargin.value,
	})),
);

const updateMetrics = () => {
	if (!containerRef.value || !scrollElement.value) return;

	const containerRect = containerRef.value.getBoundingClientRect();
	const scrollerRect = scrollElement.value.getBoundingClientRect();

	containerWidth.value = containerRect.width;
	viewportWidth.value = window.innerWidth;
	scrollMargin.value =
		containerRect.top - scrollerRect.top + scrollElement.value.scrollTop;
};

const measureRow = (element: Element | ComponentPublicInstance | null) => {
	const node =
		element instanceof HTMLElement
			? element
			: (element?.$el as Element | undefined);

	if (node instanceof HTMLElement) virtualizer.value.measureElement(node);
};

watch(containerRef, (container) => {
	resizeObserver?.disconnect();
	if (!container) return;

	scrollElement.value = container.closest('main');
	updateMetrics();
	resizeObserver = new ResizeObserver(updateMetrics);
	resizeObserver.observe(container);
});

watch([rows, columns], async () => {
	await nextTick();
	updateMetrics();
	virtualizer.value.measure();
});

onMounted(() => window.addEventListener('resize', updateMetrics));

onBeforeUnmount(() => {
	resizeObserver?.disconnect();
	window.removeEventListener('resize', updateMetrics);
});
</script>

<template>
	<div
		ref="containerRef"
		class="relative w-full shrink-0"
		:style="{ height: `${virtualizer.getTotalSize()}px` }"
	>
		<div
			v-for="row in virtualizer.getVirtualItems()"
			:key="row.key"
			:ref="measureRow"
			:data-index="row.index"
			class="absolute left-0 top-0 grid w-full"
			:style="{
				gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
				gap: `${gap}px`,
				transform: `translateY(${row.start - scrollMargin}px)`,
			}"
		>
			<PopularProductCard
				v-for="product in rows[row.index]"
				:key="product.sku || product.title"
				:product="product"
			/>
		</div>
	</div>
</template>
