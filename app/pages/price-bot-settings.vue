<script setup lang="ts">
import { ChevronRight } from '@lucide/vue';
import SettingValueDialog from '~/features/settings/SettingValueDialog.vue';

usePageMeta({
	title: 'seo.pages.priceBot.title',
	description: 'seo.pages.priceBot.description',
});
const botSettings = useBotSettings();
const priceBot = usePriceBot();
const dialog = useDialog();
const openPriceStep = () =>
	dialog.open(SettingValueDialog, {
		width: '440px',
		height: 'auto',
		title: 'settings.priceStep',
		data: { field: 'priceStep', value: botSettings.settings?.priceStep ?? 3 },
	});
onMounted(async () => {
	await Promise.all([botSettings.getSettings(), priceBot.getState()]);
});
</script>

<template>
	<Spinner v-if="botSettings.loading && !botSettings.settings" />
	<div v-else class="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-6">
		<Island content-class="p-0">
			<List>
				<ListTile
					title="settings.tabs.priceBot"
					description="priceBot.controlDescription"
				>
					<template #trailing
						><PriceBotToggleButton :mode="priceBot.state?.mode ?? 'stop'"
					/></template>
				</ListTile>
			</List>
		</Island>
		<Island title="settings.dumpingSettings" content-class="p-0">
			<List>
				<ListTile
					title="settings.priceStep"
					:disabled="!botSettings.settings"
					@click="openPriceStep"
				>
					<template #description
						>{{ botSettings.settings?.priceStep ?? 3 }} ₸</template
					>
					<template #trailing
						><ChevronRight
							class="size-5 text-muted-foreground"
							aria-hidden="true"
					/></template>
				</ListTile>
				<SettingSwitchRow
					field="autoRaiseEnabled"
					title="settings.autoRaiseEnabled"
					description="settings.autoRaiseHint"
				/>
				<SettingSwitchRow
					field="smartNearMinEnabled"
					title="settings.smartNearMinEnabled"
					description="settings.smartNearMinHint"
				/>
				<IgnoredCompetitorsSettings />
			</List>
		</Island>
	</div>
</template>
