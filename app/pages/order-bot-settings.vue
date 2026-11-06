<script setup lang="ts">
import { ChevronRight } from '@lucide/vue';
import SettingValueDialog from '~/features/settings/SettingValueDialog.vue';

usePageMeta({
	title: 'seo.pages.orderBot.title',
	description: 'seo.pages.orderBot.description',
});
const botSettings = useBotSettings();
const userStore = useUser();
const dialog = useDialog();
const startHour = computed(
	() =>
		`${String(botSettings.settings?.orderSendStartHour ?? 6).padStart(
			2,
			'0',
		)}:00`,
);
const openStartHour = () =>
	dialog.open(SettingValueDialog, {
		width: '440px',
		height: 'auto',
		title: 'orderBot.sendStartHour',
		data: {
			field: 'orderSendStartHour',
			value: botSettings.settings?.orderSendStartHour ?? 6,
		},
	});
onMounted(async () => {
	await userStore.getUserByToken();
	if (!userStore.user?.orderBotEnabled) {
		await navigateTo(useLocalePath()('/orders'));
		return;
	}
	await botSettings.getSettings();
});
</script>

<template>
	<Spinner v-if="botSettings.loading && !botSettings.settings" />
	<div v-else class="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-6">
		<Island content-class="p-0">
			<List>
				<ListTile
					title="settings.tabs.orderBot"
					description="orderBot.controlDescription"
				>
					<template #trailing
						><OrderBotToggleButton
							:enabled="botSettings.settings?.telegramEnabled ?? false"
					/></template>
				</ListTile>
			</List>
		</Island>
		<Island title="settings.orderPreferences" content-class="p-0">
			<List>
				<SettingSwitchRow
					field="autoDispatchExpressOrders"
					title="orderBot.autoDispatchExpressOrders"
					description="orderBot.autoDispatchExpressOrdersDescription"
				/>
				<ListTile
					title="orderBot.sendStartHour"
					:disabled="!botSettings.settings"
					@click="openStartHour"
				>
					<template #description>{{ startHour }}</template>
					<template #trailing
						><ChevronRight
							class="size-5 text-muted-foreground"
							aria-hidden="true"
					/></template>
				</ListTile>
			</List>
		</Island>
		<TelegramChannelSettings />
	</div>
</template>
