<script setup lang="ts">
import { Settings } from '@lucide/vue';
import UserPreferencesDialog from './UserPreferencesDialog.vue';

const emit = defineEmits<{ select: [] }>();
const dialog = useDialog();

const openPreferences = () => {
	emit('select');
	dialog.open(UserPreferencesDialog, {
		width: '500px',
		height: '520px',
		title: 'user.preferences',
	});
};
</script>

<template>
	<Button class="w-full justify-start" variant="ghost" label="user.preferences" @click="openPreferences">
		<template #leading><Settings class="size-5" /></template>
	</Button>
</template>
