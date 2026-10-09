<script setup lang="ts">
import { Plus } from '@lucide/vue';
import AddStoreDialog from './AddStoreDialog.vue';

const dialog = useDialog();

const openDialog = () => {
	dialog.open(AddStoreDialog, {
		width: '480px',
		height: '480px',
		title: 'store.newStore',
	});
};
</script>

<template>
	<Button color="primary" @click="openDialog">
		<template #leading>
			<Plus class="size-5" />
		</template>
		{{ $t('store.addStore') }}
	</Button>
</template>
