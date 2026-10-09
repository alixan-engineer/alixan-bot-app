<script setup lang="ts">
import type { PopularProduct } from '~/composables/useAnalytics';
import ProductPriceDialog from '~/features/product/ProductPriceDialog.vue';

const props = defineProps<{ product: PopularProduct }>();
const drawer = useDrawer();

const masterSku = computed(() => {
	const sku = props.product.sku.trim();
	const newFormat = sku.match(/^(\d{9})(?:_|$)/)?.[1];
	if (newFormat) return newFormat;

	return sku.match(/(?:^|_)(\d{9})$/)?.[1] ?? '';
});

const openProduct = (): void => {
	if (!masterSku.value) return;

	drawer.open(ProductPriceDialog, {
		width: '620px',
		height: 'min(90vh, 760px)',
		position: 'bottom',
		data: { masterSku: masterSku.value },
	});
};
</script>

<template>
	<Island
		class="h-full cursor-pointer"
		content-class="flex h-full flex-col overflow-hidden"
		role="button"
		tabindex="0"
		@click="openProduct"
		@keydown.enter="openProduct"
		@keydown.space.prevent="openProduct"
	>
		<img
			v-if="product.imageUrl"
			:src="product.imageUrl"
			:alt="product.title"
			loading="lazy"
			class="h-32 w-full object-cover sm:h-50"
		/>

		<div class="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
			<h2 class="line-clamp-2 text-sm font-semibold sm:text-base">
				{{ product.title }}
			</h2>

			<div class="mt-auto flex items-center justify-between gap-2 sm:gap-3">
				<span class="text-base text-muted-foreground">
					{{ $t('analytics.purchased') }}
				</span>
				<strong class="text-2xl text-primary sm:text-3xl">{{
					product.quantity
				}}</strong>
			</div>
		</div>
	</Island>
</template>
