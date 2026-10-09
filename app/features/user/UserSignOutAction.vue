<script setup lang="ts">
import { LogOut } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';

const emit = defineEmits<{ select: [] }>();
const userStore = useUser();
const dialog = useDialog();

const confirmSignOut = () => {
	emit('select');
	dialog.open(ConfirmDialog, {
		width: '360px',
		height: '240px',
		data: {
			title: 'auth.signOutConfirm.title',
			description: 'auth.signOutConfirm.description',
			cancelLabel: 'common.cancel',
			submitLabel: 'actions.signOut',
			submitColor: 'destructive',
			onSubmit: userStore.logout,
		},
	});
};
</script>

<template>
	<Button class="w-full justify-start" variant="ghost" color="destructive" label="auth.signOut" @click="confirmSignOut">
		<template #leading><LogOut class="size-5" /></template>
	</Button>
</template>
