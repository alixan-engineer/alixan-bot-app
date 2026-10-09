<script setup lang="ts">
import { Bot, Ellipsis, Pencil, Power, RefreshCw, Trash2 } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import type { Store } from '~/composables/useStores';
import EditStoreDialog from './EditStoreDialog.vue';

const props = defineProps<{ store: Store }>();
const stores = useStores();
const dialog = useDialog();
const toast = useToast();
const loader = useGlobalLoader();
const menuOpen = ref(false);

const closeMenu = () => (menuOpen.value = false);

const run = async (action: () => Promise<unknown>, message: string) => {
	try {
		loader.show();
		await action();
		toast.open(message, 'success');
	} finally {
		loader.hide();
	}
};

const confirm = (data: {
	title: string;
	description: string;
	submitLabel: string;
	submitColor?: 'primary' | 'destructive';
	onSubmit: () => Promise<unknown>;
}) => {
	closeMenu();
	dialog.open(ConfirmDialog, {
		width: '460px',
		height: '260px',
		data: {
			...data,
			cancelLabel: 'common.cancel',
		},
	});
};

const openEditDialog = () => {
	closeMenu();
	dialog.open(EditStoreDialog, {
		width: '480px',
		height: '540px',
		title: 'store.editStore',
		data: { store: props.store },
	});
};

const confirmRetry = () =>
	confirm({
		title: 'store.retryConfirm.title',
		description: 'store.retryConfirm.description',
		submitLabel: 'actions.retry',
		onSubmit: () =>
			run(() => stores.retryAuth(props.store._id), 'store.retryStarted'),
	});

const confirmEnable = () =>
	confirm({
		title: 'store.enableConfirm.title',
		description: 'store.enableConfirm.description',
		submitLabel: 'actions.enable',
		onSubmit: () =>
			run(
				() => stores.updateStatus(props.store._id, 'enable'),
				'store.enabled',
			),
	});

const confirmTogglePriceBot = () => {
	const willEnable = props.store.priceBotEnabled === false;
	confirm({
		title: willEnable
			? 'store.startPriceBotConfirm.title'
			: 'store.stopPriceBotConfirm.title',
		description: willEnable
			? 'store.startPriceBotConfirm.description'
			: 'store.stopPriceBotConfirm.description',
		submitLabel: willEnable ? 'actions.start' : 'actions.stop',
		submitColor: willEnable ? 'primary' : 'destructive',
		onSubmit: () =>
			run(
				() => stores.updatePriceBotStatus(props.store._id, willEnable),
				willEnable ? 'store.priceBotEnabled' : 'store.priceBotDisabled',
			),
	});
};

const confirmDisable = () =>
	confirm({
		title: 'store.disableConfirm.title',
		description: 'store.disableConfirm.description',
		submitLabel: 'actions.disable',
		submitColor: 'destructive',
		onSubmit: () =>
			run(
				() => stores.updateStatus(props.store._id, 'disable'),
				'store.disabled',
			),
	});

const confirmRemove = () =>
	confirm({
		title: 'store.removeConfirm.title',
		description: 'store.removeConfirm.description',
		submitLabel: 'actions.remove',
		submitColor: 'destructive',
		onSubmit: () =>
			run(() => stores.removeStore(props.store._id), 'store.removed'),
	});
</script>

<template>
	<DropdownMenu
		v-model:open="menuOpen"
		width="260px"
		height="360px"
		position="bottomRight"
	>
		<template #trigger>
			<IconButton
				variant="ghost"
				:tooltip="$t('store.actions')"
				:aria-label="$t('store.actions')"
			>
				<Ellipsis />
			</IconButton>
		</template>

		<template #default>
			<div class="p-1">
				<Button
					class="w-full justify-start"
					variant="ghost"
					label="store.editStore"
					@click="openEditDialog"
				>
					<template #leading>
						<Pencil class="size-5" />
					</template>
				</Button>
				<Button
					v-if="store.status === 'enable'"
					class="w-full justify-start"
					variant="ghost"
					:color="store.priceBotEnabled ? 'destructive' : 'secondary'"
					:label="
						store.priceBotEnabled ? 'store.stopPriceBot' : 'store.startPriceBot'
					"
					@click="confirmTogglePriceBot"
				>
					<template #leading>
						<Bot class="size-5" />
					</template>
				</Button>
				<Button
					v-if="store.status === 'auth_error'"
					class="w-full justify-start"
					variant="ghost"
					color="primary"
					label="store.retry"
					@click="confirmRetry"
				>
					<template #leading>
						<RefreshCw class="size-5" />
					</template>
				</Button>
				<Button
					v-if="store.status === 'disable'"
					class="w-full justify-start"
					variant="ghost"
					color="primary"
					label="store.enable"
					@click="confirmEnable"
				>
					<template #leading>
						<Power class="size-5" />
					</template>
				</Button>
				<Button
					v-else
					class="w-full justify-start"
					variant="ghost"
					color="destructive"
					label="store.disable"
					@click="confirmDisable"
				>
					<template #leading>
						<Power class="size-5" />
					</template>
				</Button>
				<Button
					v-if="store.status === 'disable'"
					class="w-full justify-start"
					variant="ghost"
					color="destructive"
					label="store.remove"
					@click="confirmRemove"
				>
					<template #leading>
						<Trash2 class="size-5" />
					</template>
				</Button>
			</div>
		</template>
	</DropdownMenu>
</template>
