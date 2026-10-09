<script setup lang="ts">
import { Info } from '@lucide/vue';
import type { Store } from '~/composables/useStores';

const props = defineProps<{
	data?: {
		stores?: Store[];
		onSaved?: () => Promise<void> | void;
	};
	close: () => void;
}>();

const stores = useStores();
const toast = useToast();
const loader = useGlobalLoader();

const availableStores = computed(() =>
	(props.data?.stores ?? []).filter(
		store => store.status === 'enable' && store.storeId,
	),
);
const selectedStoreId = ref(
	availableStores.value.find(store => store.isMain)?._id ??
		availableStores.value[0]?._id ??
		'',
);

const save = async () => {
	if (!selectedStoreId.value) {
		toast.open('store.mainStoreRequired', 'error');
		return;
	}

	try {
		loader.show();
		await stores.setMainStore(selectedStoreId.value);
		await props.data?.onSaved?.();
		toast.open('store.mainStoreSaved', 'success');
		props.close();
	} finally {
		loader.hide();
	}
};
</script>

<template>
	<div class="size-full flex flex-col divide-y">
		<div class="flex-1 space-y-8 p-6">
			<InfoBox :icon="Info">
				{{ $t('store.mainStoreDescription') }}
			</InfoBox>
			<Select
				v-model="selectedStoreId"
				label="store.mainStore"
				:options="
					availableStores.map(store => ({
						label: store.name || store.email,
						value: store._id,
					}))
				"
			/>
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
