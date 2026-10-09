<script setup lang="ts">
import { ArrowUp, Check, ChevronDown } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import ProductVirtualScroller from '~/features/product/ProductVirtualScroller.vue';

usePageMeta({
	title: 'seo.pages.products.title',
	description: 'seo.pages.products.description',
});

const products = useProducts();
const favorites = useFavoriteProducts();
const dialog = useDialog();
const toast = useToast();
const loader = useGlobalLoader();
const clearingRemoved = ref(false);
const removedCount = computed(() => products.products.filter(
	product => product.status === 'enable' && !product.stores.length,
).length);

const confirmClearRemoved = () => {
	if (clearingRemoved.value || products.loading || !removedCount.value) return;
	const selectedCity = products.cityId;
	dialog.open(ConfirmDialog, {
		width: '460px',
		height: '300px',
		data: {
			title: 'product.clearRemoved.title',
			description: 'product.clearRemoved.description',
			cancelLabel: 'common.cancel',
			submitLabel: 'actions.disable',
			submitColor: 'destructive',
			onSubmit: async () => {
				if (clearingRemoved.value) return;
				clearingRemoved.value = true;
				loader.show();
				try {
					const result = await products.disableRemovedProducts(selectedCity);
					await products.getProducts();
					toast.open(t('product.clearRemoved.success', { count: result.disabledCount }), 'success');
				} catch {
					// useApiFetch displays the API error.
				} finally {
					clearingRemoved.value = false;
					loader.hide();
				}
			},
		},
	});
};
const { t } = useI18n();
const search = ref('');
const pageElement = ref<HTMLElement>();
const swiperContainer = ref<
	| (HTMLElement & {
			swiper?: { slideTo: (index: number, speed?: number) => void };
	  })
	| null
>(null);
const showScrollToTop = ref(false);
let scrollContainer: HTMLElement | null = null;
type PriceSort = 'none' | 'asc' | 'desc';
const priceSort = ref<PriceSort>('none');
const sortMenuOpen = ref(false);
const statusFilter = ref<
	| 'all'
	| 'favorite'
	| 'enable'
	| 'disable'
	| 'draft'
	| 'problem'
	| 'belowMin'
	| 'atMin'
>('all');
type ProductViewStatus = 'enable' | 'disable' | 'draft';

const loadProducts = async () => {
	await products.getProducts();
};

const productViewStatus = (
	product: (typeof products.products)[number],
): ProductViewStatus => {
	if (product.status === 'disable') {
		return 'disable';
	}

	return product.status;
};

const isAtMinPrice = (product: (typeof products.products)[number]) =>
	product.status === 'enable' &&
	typeof product.minPrice === 'number' &&
	product.stores.some(store => store.currentPrice === product.minPrice);

const filteredProducts = computed(() => {
	const query = search.value.trim().toLocaleLowerCase();
	const filtered = products.products.filter(product => {
		const matchesStatus =
			statusFilter.value === 'all' ||
			(statusFilter.value === 'problem' &&
				product.status === 'enable' &&
				product.stores.length === 0) ||
			(statusFilter.value === 'belowMin' && product.competitorBelowMin) ||
			(statusFilter.value === 'atMin' && isAtMinPrice(product)) ||
			(statusFilter.value === 'favorite' &&
				favorites.isFavorite(product.key)) ||
			productViewStatus(product) === statusFilter.value;
		const matchesSearch =
			!query ||
			[product.masterTitle, product.masterSku, product.sku].some(
				value => value?.toLocaleLowerCase().includes(query),
			);
		return matchesStatus && matchesSearch;
	});

	if (priceSort.value === 'none') return filtered;

	const getLowestPrice = (product: (typeof products.products)[number]) => {
		const prices = product.stores
			.map(store => store.currentPrice)
			.filter((price): price is number => typeof price === 'number');
		return prices.length ? Math.min(...prices) : null;
	};

	return [...filtered].sort((left, right) => {
		const leftPrice = getLowestPrice(left);
		const rightPrice = getLowestPrice(right);
		if (leftPrice === null) return 1;
		if (rightPrice === null) return -1;
		return priceSort.value === 'asc'
			? leftPrice - rightPrice
			: rightPrice - leftPrice;
	});
});

const priceSortOptions = computed(() => [
	{ label: t('product.sort.default'), value: 'none' as const },
	{ label: t('product.sort.cheapFirst'), value: 'asc' as const },
	{ label: t('product.sort.expensiveFirst'), value: 'desc' as const },
]);

const selectPriceSort = (value: PriceSort) => {
	priceSort.value = value;
	sortMenuOpen.value = false;
};

const selectStatusFilter = (
	value: typeof statusFilter.value,
	index: number,
) => {
	statusFilter.value = value;
	swiperContainer.value?.swiper?.slideTo(index, 300);
};

const statusFilters = computed(() => {
	const counts = products.products.reduce(
		(acc, product) => {
			acc[productViewStatus(product)] += 1;
			acc.all += 1;
			return acc;
		},
		{ all: 0, enable: 0, disable: 0, draft: 0 } as Record<
			'all' | ProductViewStatus,
			number
		>,
	);

	return [
		{ label: 'product.filters.all', value: 'all' as const, count: counts.all },
		{
			label: 'product.filters.favorite',
			value: 'favorite' as const,
			count: products.products.filter(product =>
				favorites.isFavorite(product.key),
			).length,
		},
		{
			label: 'product.status.enable',
			value: 'enable' as const,
			count: counts.enable,
		},
		{
			label: 'product.status.disable',
			value: 'disable' as const,
			count: counts.disable,
		},
		{
			label: 'product.status.draft',
			value: 'draft' as const,
			count: counts.draft,
		},
		{
			label: 'product.filters.problem',
			value: 'problem' as const,
			count: products.products.filter(
				product => product.status === 'enable' && !product.stores.length,
			).length,
		},
		{
			label: 'product.filters.belowMin',
			value: 'belowMin' as const,
			count: products.products.filter(product => product.competitorBelowMin)
				.length,
		},
		{
			label: 'product.filters.atMin',
			value: 'atMin' as const,
			count: products.products.filter(isAtMinPrice).length,
		},
	];
});

const filterInfo = computed(() => ({
	title: `product.filterInfo.${statusFilter.value}.title`,
	description: `product.filterInfo.${statusFilter.value}.description`,
}));

const syncScrollToTop = () => {
	showScrollToTop.value = (scrollContainer?.scrollTop ?? 0) > 400;
};

const scrollToTop = () => {
	scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(async () => {
	scrollContainer = pageElement.value?.closest('main') ?? null;
	scrollContainer?.addEventListener('scroll', syncScrollToTop, {
		passive: true,
	});
	syncScrollToTop();
	favorites.initialize();
	await loadProducts();
});

onBeforeUnmount(() => {
	scrollContainer?.removeEventListener('scroll', syncScrollToTop);
});
</script>

<template>
	<div ref="pageElement" class="size-full space-y-6">
		<swiper-container
			ref="swiperContainer"
			free-mode
			free-mode-sticky
			slides-per-view="auto"
			space-between="8"
			class="block min-w-0 max-w-full"
		>
			<swiper-slide
				v-for="(filter, index) in statusFilters"
				:key="filter.value"
			>
				<Chip
					:selected="statusFilter === filter.value"
					@click="selectStatusFilter(filter.value, index)"
				>
					{{ $t(filter.label) }} ({{ filter.count }})
				</Chip>
			</swiper-slide>
		</swiper-container>

		<InfoBox>
			<span class="font-semibold text-foreground">
				{{ $t(filterInfo.title) }}.
			</span>
			{{ ' ' }}{{ $t(filterInfo.description) }}
		</InfoBox>

		<div class="flex">
			<Button
				variant="outlined"
				color="destructive"
				size="sm"
				:disabled="products.loading || clearingRemoved || !removedCount"
				@click="confirmClearRemoved"
			>
				{{ $t('product.clearRemoved.button') }} ({{ removedCount }})
			</Button>
		</div>

		<div class="flex gap-4">
			<select v-if="products.cities.length" v-model="products.cityId" aria-label="Город" class="rounded-lg border bg-background p-3" @change="loadProducts">
        <option v-for="city in products.cities" :key="city.id" :value="city.id">{{ city.name }}</option>
      </select>
      <Search v-model="search" :placeholder="$t('product.search')" />
			<DropdownMenu
				v-model:open="sortMenuOpen"
				width="250px"
				position="bottomRight"
			>
				<template #trigger>
					<IconButton
						variant="outlined"
						:tooltip="$t('product.sort.label')"
						:aria-label="$t('product.sort.label')"
					>
						<ChevronDown
							:class="sortMenuOpen ? 'rotate-180' : ''"
							class="transition-transform"
						/>
					</IconButton>
				</template>
				<div class="p-1">
					<Button
						v-for="option in priceSortOptions"
						:key="option.value"
						class="w-full justify-start"
						variant="ghost"
						@click="selectPriceSort(option.value)"
					>
						<template #leading>
							<Check
								class="size-4"
								:class="
									priceSort === option.value ? 'opacity-100' : 'opacity-0'
								"
							/>
						</template>
						{{ option.label }}
					</Button>
				</div>
			</DropdownMenu>
		</div>

		<Spinner v-if="products.loading && !products.products.length" />

		<ProductVirtualScroller
			v-else-if="filteredProducts.length"
			:products="filteredProducts"
			:on-saved="loadProducts"
		/>

		<Empty
			v-else
			title="product.empty.title"
			description="product.empty.description"
		/>

		<Transition
			enter-active-class="transition duration-200"
			enter-from-class="translate-y-2 opacity-0"
			leave-active-class="transition duration-150"
			leave-to-class="translate-y-2 opacity-0"
		>
			<IconButton
				v-if="showScrollToTop"
				class="fixed bottom-5 right-4 z-20 shadow-lg sm:bottom-6 sm:right-6"
				variant="filled"
				:tooltip="$t('product.scrollToTop')"
				:aria-label="$t('product.scrollToTop')"
				@click="scrollToTop"
			>
				<ArrowUp />
			</IconButton>
		</Transition>
	</div>
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
