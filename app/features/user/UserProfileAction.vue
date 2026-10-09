<script setup lang="ts">
import { UserRound } from '@lucide/vue';
import UserProfileDialog from './UserProfileDialog.vue';

const emit = defineEmits<{ select: [] }>();
const dialog = useDialog();

const openProfile = () => {
	emit('select');
	dialog.open(UserProfileDialog, {
		width: '500px',
		height: '500px',
		title: 'user.profile',
	});
};
</script>

<template>
	<Button class="w-full justify-start" variant="ghost" label="user.profile" @click="openProfile">
		<template #leading><UserRound class="size-5" /></template>
	</Button>
</template>
