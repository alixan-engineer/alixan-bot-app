<script setup lang="ts">
usePageMeta({
	title: 'seo.pages.priceBot.title',
	description: 'seo.pages.priceBot.description',
});

const botSettings = useBotSettings();
const priceBot = usePriceBot();
const toast = useToast();
const loader = useGlobalLoader();
const priceStep = ref<number | null>(null);
const autoRaiseEnabled = ref(true);

const priceBotMode = computed(() => priceBot.state?.mode ?? 'stop');

const syncForm = () => {
	const settings = botSettings.settings;
	priceStep.value = settings?.priceStep ?? 3;
	autoRaiseEnabled.value = settings?.autoRaiseEnabled ?? true;
};

const save = async () => {
	const nextPriceStep = Number(priceStep.value);
	if (!Number.isFinite(nextPriceStep) || nextPriceStep <= 0) {
		toast.open('settings.priceStepError', 'error');
		return;
	}

	try {
		loader.show();
		await botSettings.updateSettings({
			priceStep: nextPriceStep,
			autoRaiseEnabled: autoRaiseEnabled.value,
		});
		toast.open('settings.saved', 'success');
	} finally {
		loader.hide();
	}
};

onMounted(async () => {
	await Promise.all([botSettings.getSettings(), priceBot.getState()]);
	syncForm();
});
</script>

<template>
	<Spinner v-if="botSettings.loading && !botSettings.settings" />

	<template v-else>
		<BotControl
			title="priceBot.controlTitle"
			description="priceBot.controlDescription"
		>
			<PriceBotToggleButton :mode="priceBotMode" />
		</BotControl>

		<Island content-class="flex flex-col gap-4 p-3.5 sm:gap-6 sm:p-6">
			<div>
				<p class="text-xl font-semibold">
					{{ $t('settings.dumpingSettings') }}
				</p>
				<p class="mt-1 text-base text-muted-foreground">
					{{ $t('settings.priceStepHint') }}
				</p>
			</div>

			<div>
				<Checkbox
					v-model="autoRaiseEnabled"
					:label="$t('settings.autoRaiseEnabled')"
				/>
				<p class="mt-1 pl-8 text-sm text-muted-foreground">
					{{ $t('settings.autoRaiseHint') }}
				</p>
			</div>

			<div class="flex gap-4">
				<Input
					v-model.number="priceStep"
					label="settings.priceStep"
					type="number"
				/>
				<Button color="primary" label="common.save" @click="save" />
			</div>
		</Island>

		<IgnoredCompetitorsSettings />
	</template>
</template>
