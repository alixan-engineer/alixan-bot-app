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
const monthAgo = new Date(today);
monthAgo.setDate(monthAgo.getDate() - 29);

const range = ref<{ from: string; to: string } | null>({
	from: toDay(monthAgo),
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
