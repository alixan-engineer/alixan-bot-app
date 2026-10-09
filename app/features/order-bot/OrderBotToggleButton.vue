<script setup lang="ts">
import { Pause, Play } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';

const props = defineProps<{ enabled: boolean }>();
const botSettings = useBotSettings();
const dialog = useDialog();
const toast = useToast();
const loader = useGlobalLoader();

const confirmToggle = () => {
	const willEnable = !props.enabled;
	if (
		willEnable &&
		(!botSettings.settings?.pickupPointChannels?.length ||
			botSettings.settings.pickupPointChannels.some(point => point.enabled && !point.telegramChatId))
	) {
		toast.open('telegram.formRequired', 'error');
		return;
	}

	dialog.open(ConfirmDialog, {
		width: '460px',
		height: '260px',
		data: {
			title: willEnable
				? 'orderBot.startConfirm.title'
				: 'orderBot.stopConfirm.title',
			description: willEnable
				? 'orderBot.startConfirm.description'
				: 'orderBot.stopConfirm.description',
			cancelLabel: 'common.cancel',
			submitLabel: willEnable ? 'actions.start' : 'actions.stop',
			submitColor: willEnable ? 'primary' : 'destructive',
			onSubmit: async () => {
				try {
					loader.show();
					await botSettings.updateSettings({ telegramEnabled: willEnable });
					toast.open(willEnable ? 'orderBot.started' : 'orderBot.stopped', 'success');
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
		:color="enabled ? 'destructive' : 'secondary'"
		:label="enabled ? 'orderBot.stop' : 'orderBot.start'"
		@click="confirmToggle"
	>
		<template #leading>
			<Pause v-if="enabled" class="size-4" />
			<Play v-else class="size-4" />
		</template>
	</Button>
</template>
