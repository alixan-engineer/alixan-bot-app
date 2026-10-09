<script setup lang="ts">
usePageMeta({
	title: 'seo.pages.orderBot.title',
	description: 'seo.pages.orderBot.description',
});

const botSettings = useBotSettings();
const userStore = useUser();
const toast = useToast();
const loader = useGlobalLoader();
const orderSendStartHour = ref<string | number>(6);
const autoDispatchExpressOrders = ref(true);
const orderSendStartHourOptions = [4, 5, 6, 7].map(hour => ({
	label: `${String(hour).padStart(2, '0')}:00`,
	value: hour,
}));

const orderBotEnabled = computed(
	() => botSettings.settings?.telegramEnabled ?? false,
);
const syncForm = () => {
	const settings = botSettings.settings;
	orderSendStartHour.value = settings?.orderSendStartHour ?? 6;
	autoDispatchExpressOrders.value = settings?.autoDispatchExpressOrders ?? true;
};

const save = async () => {
	try {
		loader.show();
		await botSettings.updateSettings({
			orderSendStartHour: Number(orderSendStartHour.value),
			autoDispatchExpressOrders: autoDispatchExpressOrders.value,
		});
		syncForm();
		toast.open('telegram.saved', 'success');
	} finally {
		loader.hide();
	}
};

onMounted(async () => {
	await userStore.getUserByToken();
	if (!userStore.user?.orderBotEnabled) {
		await navigateTo(useLocalePath()('/orders'));
		return;
	}
	await botSettings.getSettings();
	syncForm();
});
</script>

<template>
	<Spinner v-if="botSettings.loading && !botSettings.settings" />

	<template v-else>
		<BotControl
			title="orderBot.controlTitle"
			description="orderBot.controlDescription"
		>
			<OrderBotToggleButton :enabled="orderBotEnabled" />
		</BotControl>

		<Island content-class="flex flex-col gap-4 p-3.5 sm:gap-6 sm:p-6">
			<p class="text-xl font-semibold">
				{{ $t('orderBot.autoDispatchTitle') }}
			</p>

			<div>
				<Checkbox
					v-model="autoDispatchExpressOrders"
					:label="$t('orderBot.autoDispatchExpressOrders')"
				/>
				<p class="mt-1 pl-8 text-sm text-muted-foreground">
					{{ $t('orderBot.autoDispatchExpressOrdersDescription') }}
				</p>
			</div>
		</Island>

		<Island content-class="flex flex-col gap-4 p-3.5 sm:gap-6 sm:p-6">
			<div>
				<p class="text-xl font-semibold">
					{{ $t('orderBot.sendStartHour') }}
				</p>
				<p class="mt-1 text-base text-muted-foreground">
					{{ $t('orderBot.sendStartHourDescription') }}
				</p>
			</div>

			<div class="flex items-start md:gap-6 max-md:flex-col">
				<Select
					v-model="orderSendStartHour"
					label="orderBot.sendStartHour"
					:options="orderSendStartHourOptions"
				/>
				<Button color="primary" label="common.save" @click="save" />
			</div>
		</Island>

		<TelegramChannelSettings />
	</template>
</template>
