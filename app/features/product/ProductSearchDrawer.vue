<script setup lang="ts">
import ProductVirtualScroller from './ProductVirtualScroller.vue';

defineProps<{ close: () => void }>();
const products = useProducts();
const search = ref('');
const results = computed(() => {
	const query = search.value.trim().toLocaleLowerCase();
	if (!query) return products.products;
	return products.products.filter((product) =>
		[
			product.masterTitle,
			product.masterSku,
			product.sku,
			...product.stores.map((store) => store.sku),
		].some((value) => value?.toLocaleLowerCase().includes(query)),
	);
});
const reload = () => products.getProducts();
</script>

<template>
	<div class="flex h-full flex-col">
		<div class="shrink-0 space-y-4 border-b p-4 sm:p-6">
			<Search v-model="search" :placeholder="$t('product.search')" autofocus />
			<p class="text-sm text-muted-foreground">
				{{ $t('catalogUi.searchHint') }}
			</p>
		</div>
		<div
			data-product-scroll
			class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
		>
			<Spinner v-if="products.loading" />
			<template v-else>
				<p class="text-sm text-muted-foreground">
					{{ $t('catalogUi.found', { count: results.length }) }}
				</p>
				<ProductVirtualScroller
					v-if="results.length"
					:products="results"
					:on-saved="reload"
				/>
				<Empty
					v-else
					title="product.empty.title"
					description="product.empty.description"
				/>
			</template>
		</div>
	</div>
</template>
