<script setup lang="ts">
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
			botSettings.settings.pickupPointChannels.some(
				(point) =>
					point.enabled &&
					(!point.expressTelegramChatId?.trim() ||
						!point.regularTelegramChatId?.trim()),
			))
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
					toast.open(
						willEnable ? 'orderBot.started' : 'orderBot.stopped',
						'success',
					);
				} finally {
					loader.hide();
				}
			},
		},
	});
};
</script>

<template>
	<Switch
		:model-value="enabled"
		:disabled="botSettings.loading || !botSettings.settings"
		:aria-label="$t('settings.tabs.orderBot')"
		class="relative after:absolute after:-inset-2.5"
		@update:model-value="confirmToggle"
	/>
</template>
