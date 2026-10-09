<script setup lang="ts">
import { Pause, Play } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';

const props = defineProps<{ mode: 'start' | 'stop' }>();
const emit = defineEmits<{ changed: [] }>();
const priceBot = usePriceBot();
const dialog = useDialog();
const toast = useToast();
const loader = useGlobalLoader();

const confirmToggle = () => {
	const isRunning = props.mode === 'start';
	dialog.open(ConfirmDialog, {
		width: '460px',
		height: '260px',
		data: {
			title: isRunning
				? 'priceBot.stopConfirm.title'
				: 'priceBot.startConfirm.title',
			description: isRunning
				? 'priceBot.stopConfirm.description'
				: 'priceBot.startConfirm.description',
			cancelLabel: 'common.cancel',
			submitLabel: isRunning ? 'actions.stop' : 'actions.start',
			submitColor: isRunning ? 'destructive' : 'primary',
			onSubmit: async () => {
				try {
					loader.show();
					const nextMode = isRunning ? 'stop' : 'start';
					await priceBot.setMode(nextMode);
					toast.open(
						nextMode === 'start' ? 'priceBot.started' : 'priceBot.stopped',
						'success',
					);
					emit('changed');
				} finally {
					loader.hide();
				}
			},
		},
	});
};
</script>

<template>
	<Button
		variant="filled"
		:color="mode === 'start' ? 'destructive' : 'secondary'"
		:label="mode === 'start' ? 'priceBot.stop' : 'priceBot.start'"
		@click="confirmToggle"
	>
		<template #leading>
			<Pause v-if="mode === 'start'" class="size-4" />
			<Play v-else class="size-4" />
		</template>
	</Button>
</template>
