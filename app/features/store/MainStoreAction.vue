<script setup lang="ts">
import { ArrowDownUp } from '@lucide/vue';
import SetMainStoreDialog from './SetMainStoreDialog.vue';

const stores = useStores();
const dialog = useDialog();

const openDialog = () => {
	dialog.open(SetMainStoreDialog, {
		width: '560px',
		height: '460px',
		title: 'store.changeMainStore',
		data: { stores: stores.stores, onSaved: stores.getStores },
	});
};
</script>

<template>
	<Button color="secondary" label="store.changeMainStore" @click="openDialog">
		<template #leading>
			<ArrowDownUp class="size-5" />
		</template>
	</Button>
</template>
