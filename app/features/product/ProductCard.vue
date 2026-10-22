<script setup lang="ts">
import { Bookmark } from '@lucide/vue';
import type { Product } from '~/composables/useProducts';
import ProductPriceDialog from './ProductPriceDialog.vue';

type ProductViewStatus = 'enable' | 'disable' | 'draft';

const props = defineProps<{
	product: Product;
	onSaved?: () => Promise<void> | void;
}>();

const drawer = useDrawer();
const favorites = useFavoriteProducts();
const isFavorite = computed(() => favorites.isFavorite(props.product.key));

const viewStatus = computed<ProductViewStatus>(() => {
	return props.product.status;
});

const lowestPrice = computed(() => {
	const prices = props.product.stores
		.map((store) => store.currentPrice)
		.filter((price): price is number => typeof price === 'number');
	return prices.length ? Math.min(...prices) : null;
});

const hasPriceRange = computed(
	() =>
		typeof props.product.minPrice === 'number' &&
		typeof props.product.maxPrice === 'number',
);

const statusView = computed(() => {
	if (viewStatus.value === 'disable') {
		return {
			text: 'product.status.disable',
			status: 'warning' as const,
		};
	}

	if (viewStatus.value === 'enable') {
		return {
			text: 'product.status.enable',
			status: 'success' as const,
		};
	}

	return {
		text: 'product.status.draft',
		status: 'warning' as const,
	};
});

const openProduct = (): void => {
	drawer.open(ProductPriceDialog, {
		stack: true,
		width: '620px',
		height: 'min(90vh, 760px)',
		position: 'bottom',
		data: {
			masterSku: props.product.masterSku,
			cityId: props.product.cityId,
			onSaved: props.onSaved,
		},
	});
};

const toggleFavorite = (): void => {
	favorites.toggle(props.product.key);
};
</script>

<template>
	<Island
		role="button"
		tabindex="0"
		content-class="relative min-h-56 overflow-hidden p-0 text-left sm:min-h-80"
		@click="openProduct"
		@keydown.enter="openProduct"
		@keydown.space.prevent="openProduct"
	>
		<div class="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
			<IconButton
				size="sm"
				variant="filled"
				:color="isFavorite ? 'primary' : 'secondary'"
				:tooltip="
					$t(isFavorite ? 'product.removeFavorite' : 'product.addFavorite')
				"
				:aria-label="
					$t(isFavorite ? 'product.removeFavorite' : 'product.addFavorite')
				"
				:aria-pressed="isFavorite"
				@click.stop="toggleFavorite"
			>
				<Bookmark :fill="isFavorite ? 'currentColor' : 'none'" />
			</IconButton>
		</div>
		<img
			v-if="product.images?.[0]"
			:src="product.images[0]"
			:alt="product.masterTitle || product.masterSku"
			class="aspect-4/3 w-full object-cover rounded-2xl"
			loading="lazy"
		/>
		<div v-else class="aspect-4/3 w-full bg-secondary" />

		<div class="min-h-32 flex flex-col gap-2 p-2.5 sm:min-h-44 sm:gap-4 sm:p-4">
			<p class="line-clamp-2 text-sm font-medium leading-5 sm:text-md">
				{{ product.masterTitle || product.masterSku }}
			</p>
			<div class="flex items-center justify-between">
				<Price :value="lowestPrice" class="text-lg font-semibold sm:text-2xl" />
			</div>
			<div
				v-if="hasPriceRange"
				class="flex items-center gap-1 text-muted-foreground"
			>
				<Price :value="product.minPrice" class="md:text-lg max-md:text-sm" />
				<p>—</p>
				<Price :value="product.maxPrice" class="md:text-lg max-md:text-sm" />
			</div>
			<Status :text="$t(statusView.text)" :status="statusView.status" />
		</div>
	</Island>
</template>
