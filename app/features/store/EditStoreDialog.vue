<script setup lang="ts">
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';
import type { Store } from '~/composables/useStores';

const props = defineProps<{
	data?: {
		store?: Store;
	};
	close: () => void;
}>();

const store = computed(() => props.data?.store);
const name = ref(store.value?.name ?? '');
const email = ref(store.value?.email ?? '');
const password = ref('');
const dialog = useDialog();
const stores = useStores();
const toast = useToast();
const loader = useGlobalLoader();

const openAlert = (description: string) => {
	dialog.open(AlertDialog, {
		width: '360px',
		height: '260px',
		data: {
			title: 'store.formRequired.title',
			description,
			buttonLabel: 'common.ok',
			buttonColor: 'destructive',
			mediaComponent: 'Lottie',
			mediaProps: {
				name: 'error',
				loop: false,
				width: '80px',
				height: '80px',
			},
		},
	});
};

const save = async () => {
	if (!store.value) {
		props.close();
		return;
	}

	if (!email.value.trim()) {
		openAlert('store.formRequired.email');
		return;
	}

	const payload: {
		name: string;
		email: string;
		password?: string;
	} = {
		name: name.value.trim(),
		email: email.value.trim(),
	};

	if (password.value.trim()) {
		payload.password = password.value;
	}

	try {
		loader.show();
		await stores.updateStore(store.value._id, payload);
		toast.open(
			password.value.trim() ? 'store.authStarted' : 'store.saved',
			'success',
		);
		props.close();
	} finally {
		loader.hide();
	}
};
</script>

<template>
	<div class="size-full flex flex-col divide-y">
		<div class="flex-1 p-6 space-y-3">
			<Input v-model="name" label="store.name" />
      <p class="text-sm text-muted-foreground">Города складов: {{ store?.cities.map(city => city.name).join(', ') || 'Не получены' }}</p>
			<EmailInput v-model="email" required />
			<PasswordInput
				v-model="password"
				label="store.newPassword"
				:min="4"
				:hint="$t('store.passwordEditHint')"
				:max="64"
			/>
		</div>

		<div class="grid grid-cols-2 gap-2 p-4">
			<Button
				variant="filled"
				color="secondary"
				label="common.cancel"
				@click="close"
			/>
			<Button
				label="common.save"
				variant="filled"
				color="primary"
				@click="save"
			/>
		</div>
	</div>
</template>
