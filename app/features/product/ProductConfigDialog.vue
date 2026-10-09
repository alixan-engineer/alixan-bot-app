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

const save = async () => {
	const product = props.data?.product;
  const normalized = rows.value.map(row => ({ ...row, minPrice: row.minPrice === null || String(row.minPrice) === '' ? null : Number(row.minPrice), maxPrice: row.maxPrice === null || String(row.maxPrice) === '' ? null : Number(row.maxPrice) }));
  const configured = normalized.filter(row => row.minPrice !== null || row.maxPrice !== null);
  if (!product || configured.some(row => !row.minPrice || !row.maxPrice || row.minPrice <= 0 || row.maxPrice <= 0)) {
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
	<div class="size-full flex flex-col divide-y">
		<div class="flex-1 space-y-3 p-4 sm:space-y-4 sm:p-6">
			<p class="text-base text-muted-foreground">
				Укажите границы цены отдельно для каждого города. Пустой город не участвует в демпинге.
			</p>
			<div v-for="row in rows" :key="row.id" class="grid grid-cols-2 gap-3 sm:gap-4">
        <h3 class="col-span-2 font-medium">{{ row.name }}</h3>
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
		<div class="grid grid-cols-2 gap-2 p-4">
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
