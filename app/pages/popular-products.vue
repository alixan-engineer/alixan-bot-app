<script setup lang="ts">
import PopularProductsVirtualScroller from '~/features/analytics/PopularProductsVirtualScroller.vue';

usePageMeta({
	title: 'seo.pages.popularProducts.title',
	description: 'seo.pages.popularProducts.description',
});

const analytics = useAnalytics();
const { locale } = useI18n();

const toDay = (date: Date) =>
	new Intl.DateTimeFormat('en-CA', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: 'Asia/Almaty',
	}).format(date);
const today = new Date();
const weekAgo = new Date(today);
weekAgo.setDate(weekAgo.getDate() - 6);

const range = ref<{ from: string; to: string } | null>({
	from: toDay(weekAgo),
	to: toDay(today),
});

const load = () =>
	range.value?.from && range.value?.to
		? analytics.loadPopularProducts(range.value.from, range.value.to)
		: Promise.resolve();

watch(range, load, { deep: true });

onMounted(load);
</script>

<template>
	<Calendar
		v-model="range"
		mode="range"
		:locale="locale"
		:label="$t('calendarLabels.period')"
		class="max-w-xl"
	/>
	<p v-if="analytics.popularProductsPartial && !analytics.loading" role="status" class="text-sm text-amber-700 dark:text-amber-300">{{ $t('common.partialStoreData') }}</p>
	<Spinner v-if="analytics.loading" />
	<PopularProductsVirtualScroller
		v-else-if="analytics.popularProducts.length"
		:products="analytics.popularProducts"
	/>
	<Empty
		v-else
		title="analytics.empty"
		description="analytics.emptyDescription"
	/>
</template>
