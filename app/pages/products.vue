<script setup lang="ts">
import {
	ArrowUp,
	RefreshCw,
	SlidersHorizontal,
	Search as SearchIcon,
} from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import ProductSearchDrawer from '~/features/product/ProductSearchDrawer.vue';
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
const disablingProducts = ref(false);
const removedCount = computed(
	() =>
		products.products.filter(
			(product) => product.status === 'enable' && !product.stores.length,
		).length,
);

const belowMinCount = computed(
	() =>
		products.products.filter(
			(product) => product.status === 'enable' && product.competitorBelowMin,
		).length,
);
const atMinCount = computed(() => products.products.filter(isAtMinPrice).length);
const confirmDisableProducts = (kind: 'removed' | 'belowMin' | 'atMin') => {
	const atMinProducts = kind === 'atMin' ? products.products.filter(isAtMinPrice) : [];
	const count = kind === 'removed' ? removedCount.value : kind === 'atMin' ? atMinProducts.length : belowMinCount.value;
	if (disablingProducts.value || products.loading || !count) return;
	const translation =
		kind === 'removed' ? 'product.clearRemoved' : 'product.disableBelowMin';
	const selectedCity = products.cityId;
	filtersOpen.value = false;
	dialog.open(ConfirmDialog, {
		width: '460px',
		height: '180px',
		data: {
			title: `${translation}.title`,
			cancelLabel: 'common.cancel',
			submitLabel: 'actions.disable',
			submitColor: 'destructive',
			onSubmit: async () => {
				if (disablingProducts.value) return;
				disablingProducts.value = true;
				loader.show();
				try {
					const disableAtMin = async () => {
						let disabledCount = 0;
						for (const product of atMinProducts) {
							await products.updateProduct(product.masterSku, { status: 'disable', cityId: selectedCity });
							disabledCount++;
						}
						return { disabledCount };
					};
					const result =
						kind === 'removed'
							? await products.disableRemovedProducts(selectedCity)
							: kind === 'atMin'
								? await disableAtMin()
								: await products.disableBelowMinProducts(selectedCity);
					await products.getProducts();
					toast.open(
						t(`${translation}.success`, { count: result.disabledCount }),
						'success',
					);
				} catch {
					// useApiFetch displays the API error.
				} finally {
					disablingProducts.value = false;
					loader.hide();
				}
			},
		},
	});
};
const { t, locale } = useI18n();
const drawer = useDrawer();
const openSearch = () =>
	drawer.open(ProductSearchDrawer, {
		title: 'catalogUi.searchTitle',
		position: 'right',
		width: '800px',
	});
useAppBarActions([
	{ icon: SearchIcon, label: 'catalogUi.searchTitle', onClick: openSearch },
	{
		icon: SlidersHorizontal,
		label: 'catalogUi.filters',
		onClick: () => {
			filtersOpen.value = true;
		},
	},
]);
const pageElement = ref<HTMLElement>();
const filtersOpen = ref(false);
const showScrollToTop = ref(false);
let scrollContainer: HTMLElement | null = null;
type PriceSort = 'none' | 'asc' | 'desc';
const priceSort = ref<PriceSort>('none');
const draftCityId = ref('');
const draftPriceSort = ref<PriceSort>('none');
const applyingFilters = ref(false);
watch(filtersOpen, (open) => {
	if (!open) return;
	draftCityId.value = products.cityId;
	draftPriceSort.value = priceSort.value;
});
const applyFilters = async () => {
	if (applyingFilters.value || products.loading) return;
	const previousCity = products.cityId;
	applyingFilters.value = true;
	try {
		if (draftCityId.value !== previousCity) {
			products.cityId = draftCityId.value;
			await loadProducts();
		}
		priceSort.value = draftPriceSort.value;
		filtersOpen.value = false;
	} catch {
		products.cityId = previousCity;
		// Keep the draft open so the user can retry after the API error.
	} finally {
		applyingFilters.value = false;
	}
};

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
const refreshCatalog = async () => {
	if (products.loading) return;
	try {
		await products.getProducts(true);
		toast.open('catalogUi.refreshed', 'success');
	} catch {
		/* The API error is displayed by useApiFetch. */
	}
};
const updatedLabel = computed(() =>
	products.catalogUpdatedAt
		? new Intl.DateTimeFormat(locale.value, {
				dateStyle: 'short',
				timeStyle: 'short',
		  }).format(new Date(products.catalogUpdatedAt))
		: '',
);

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
	product.stores.some((store) => store.currentPrice === product.minPrice);

const filteredProducts = computed(() => {
	const filtered = products.products.filter((product) => {
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
		return matchesStatus;
	});

	if (priceSort.value === 'none') return filtered;

	const getLowestPrice = (product: (typeof products.products)[number]) => {
		const prices = product.stores
			.map((store) => store.currentPrice)
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
	{ label: t('catalogUi.cheap'), value: 'asc' as const },
	{ label: t('catalogUi.expensive'), value: 'desc' as const },
]);

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
		{
			label: 'product.filters.favorite',
			value: 'favorite' as const,
			count: products.products.filter((product) =>
				favorites.isFavorite(product.key),
			).length,
		},
		{ label: 'product.filters.all', value: 'all' as const, count: counts.all },
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
				(product) => product.status === 'enable' && !product.stores.length,
			).length,
		},
		{
			label: 'product.filters.belowMin',
			value: 'belowMin' as const,
			count: products.products.filter((product) => product.competitorBelowMin)
				.length,
		},
		{
			label: 'product.filters.atMin',
			value: 'atMin' as const,
			count: products.products.filter(isAtMinPrice).length,
		},
	];
});

const mainFilters = computed(() => statusFilters.value);
const selectedTab = computed({
	get: () =>
		Math.max(
			0,
			mainFilters.value.findIndex(
				(filter) => filter.value === statusFilter.value,
			),
		),
	set: (index: number) => {
		statusFilter.value = mainFilters.value[index]?.value ?? 'all';
	},
});
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
		<InfoBox>
			<span class="block text-sm font-medium leading-5">
				{{ $t('catalogUi.updated', { date: updatedLabel || '—' }) }}
			</span>
			<span class="mt-1 block text-xs leading-5 text-muted-foreground">
				{{ $t('catalogUi.cacheHint') }}
			</span>
			<template #trailing>
				<IconButton
					variant="ghost"
					:tooltip="$t('catalogUi.refresh')"
					:aria-label="$t('catalogUi.refresh')"
					:disabled="products.loading"
					@click="refreshCatalog"
				>
					<RefreshCw :class="{ 'animate-spin': products.loading }" />
				</IconButton>
			</template>
		</InfoBox>
		<Tabs
			v-model="selectedTab"
			:tabs="mainFilters.map((filter) => filter.label)"
			:counts="mainFilters.map((filter) => filter.count)"
			design="material"
			full
		/>
		<Teleport to="#scaffold-footer" defer>
			<footer
				v-if="statusFilter === 'problem' || statusFilter === 'belowMin' || statusFilter === 'atMin'"
				class="border-t bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6"
			>
				<Button
					v-if="statusFilter === 'problem'"
					variant="filled"
					size="sm"
					color="destructive"
					class="h-auto min-h-11 w-full whitespace-normal py-2 [&>span]:whitespace-normal"
					:disabled="products.loading || disablingProducts || !removedCount"
					@click="confirmDisableProducts('removed')"
				>
					{{ $t('product.clearRemoved.button') }}
				</Button>
				<Button
					v-else-if="statusFilter === 'belowMin'"
					variant="filled"
					size="sm"
					color="destructive"
					class="h-auto min-h-11 w-full whitespace-normal py-2 [&>span]:whitespace-normal"
					:disabled="products.loading || disablingProducts || !belowMinCount"
					@click="confirmDisableProducts('belowMin')"
				>
					{{ $t('product.disableBelowMin.button') }}
				</Button>
				<Button
					v-else-if="statusFilter === 'atMin'"
					variant="filled"
					size="sm"
					color="destructive"
					class="h-auto min-h-11 w-full whitespace-normal py-2 [&>span]:whitespace-normal"
					:disabled="products.loading || disablingProducts || !atMinCount"
					@click="confirmDisableProducts('atMin')"
				>
					{{ $t('product.disableBelowMin.button') }}
				</Button>
			</footer>
		</Teleport>
		<Drawer
			v-model="filtersOpen"
			position="right"
			width="440px"
			title="catalogUi.filters"
		>
			<div class="flex min-h-full flex-col gap-6 p-4 sm:p-6">
				<section v-if="products.cities.length" class="space-y-3">
					<h3 class="text-sm font-medium">{{ $t('catalogUi.city') }}</h3>
					<div
						class="flex flex-wrap gap-2"
						role="group"
						:aria-label="$t('catalogUi.city')"
					>
						<Chip
							v-for="city in products.cities"
							:key="city.id"
							:label="city.name"
							:selected="draftCityId === city.id"
							:aria-pressed="draftCityId === city.id"
							:disabled="applyingFilters || products.loading"
							@click="draftCityId = city.id"
						/>
					</div>
				</section>
				<section class="space-y-3">
					<h3 class="text-sm font-medium">{{ $t('catalogUi.sortFirst') }}</h3>
					<div
						class="flex flex-wrap gap-2"
						role="group"
						:aria-label="$t('catalogUi.sortFirst')"
					>
						<Chip
							v-for="option in priceSortOptions"
							:key="option.value"
							:label="option.label"
							:selected="draftPriceSort === option.value"
							:aria-pressed="draftPriceSort === option.value"
							:disabled="applyingFilters || products.loading"
							@click="draftPriceSort = option.value"
						/>
					</div>
				</section>
				<Button
					class="mt-auto w-full"
					label="catalogUi.apply"
					color="primary"
					:disabled="applyingFilters || products.loading"
					@click="applyFilters"
				/>
			</div>
		</Drawer>

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
				:style="statusFilter === 'problem' || statusFilter === 'belowMin' || statusFilter === 'atMin' ? { bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' } : undefined"
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
