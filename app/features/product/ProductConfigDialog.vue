<script setup lang="ts">
import type { Product } from '~/composables/useProducts';

const props = defineProps<{
	data?: { product?: Product; onSaved?: () => Promise<void> | void };
	close: () => void;
}>();

const products = useProducts();
const toast = useToast();
const loader = useGlobalLoader();
const rows = ref((props.data?.product?.cities ?? []).map(city => {
  const config = props.data?.product?.cityConfigs.find(config => config.cityId === city.id);
  return { ...city, configured: !!config, minPrice: config?.minPrice ?? null, maxPrice: config?.maxPrice ?? null };
}));

const allCities = ref(false);
const sharedRange = ref({ minPrice: null as number | null, maxPrice: null as number | null });
const priceRows = computed(() => allCities.value ? [sharedRange.value] : rows.value);

const save = async () => {
	const product = props.data?.product;
  const source = allCities.value ? rows.value.map(row => ({ ...row, ...sharedRange.value })) : rows.value;
  const normalized = source.map(row => ({ ...row, minPrice: row.minPrice === null || String(row.minPrice) === '' ? null : Number(row.minPrice), maxPrice: row.maxPrice === null || String(row.maxPrice) === '' ? null : Number(row.maxPrice) }));
  const configured = normalized.filter(row => row.minPrice !== null || row.maxPrice !== null);
  if (!product || (allCities.value && !configured.length) || configured.some(row => !row.minPrice || !row.maxPrice || !Number.isFinite(row.minPrice) || !Number.isFinite(row.maxPrice) || row.minPrice <= 0 || row.maxPrice <= 0)) {
    toast.open('product.priceRangeRequired', 'error'); return;
  }
  if (configured.some(row => row.minPrice! > row.maxPrice!)) { toast.open('product.minMaxError', 'error'); return; }

	try {
		loader.show();
    for (const row of normalized.filter(row => row.configured || row.minPrice !== null || row.maxPrice !== null)) {
      await products.updateProduct(product.masterSku, { cityId: row.id, minPrice: row.minPrice, maxPrice: row.maxPrice, status: row.minPrice === null ? 'draft' : 'enable' });
    }
    await products.getProducts();
		await props.data?.onSaved?.();
		toast.open('product.configSaved', 'success');
		props.close();
	} finally {
		loader.hide();
	}
};
</script>

<template>
	<div class="flex max-h-[calc(100dvh-7rem)] min-h-0 flex-col divide-y">
		<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-3 p-4 sm:space-y-4 sm:p-6">
			<p class="text-base text-muted-foreground">
				{{ $t('product.cityPriceRangeHint') }}
			</p>
			<Checkbox v-model="allCities" :label="$t('product.setPriceForAllCities')" />
			<div v-for="(row, index) in priceRows" :key="allCities ? 'all' : rows[index]!.id" class="grid grid-cols-2 gap-3 sm:gap-4">
        <h3 class="col-span-2 font-medium">{{ allCities ? $t('product.allCities') : rows[index]!.name }}</h3>
				<Input
					v-model.number="row.minPrice"
					label="product.minPrice"
					type="number"
				/>
				<Input
					v-model.number="row.maxPrice"
					label="product.maxPrice"
					type="number"
				/>
			</div>
		</div>
		<div class="grid shrink-0 grid-cols-2 gap-2 p-4">
			<Button
				variant="filled"
				color="secondary"
				label="common.cancel"
				@click="close"
			/>
			<Button label="common.save" @click="save" />
		</div>
	</div>
</template>
