<script setup lang="ts">
const dashboard = useDashboard();
const stores = useStores();
const products = useProducts();
const priceBot = usePriceBot();
const { t } = useI18n();
const onboardingLoaded = ref(Boolean(dashboard.summary));

const hasConnectedStore = computed(
	() =>
		(dashboard.summary?.cards.activeStores ?? 0) > 0 ||
		stores.stores.some(
			store => store.status === 'enable' && Boolean(store.storeId),
		),
);
const hasConfiguredProduct = computed(
	() =>
		(dashboard.summary?.cards.activeDumpingProducts ?? 0) > 0 ||
		products.products.some(product => product.status === 'enable'),
);
const isPriceBotEnabled = computed(
	() =>
		priceBot.state?.mode === 'start' ||
		dashboard.summary?.priceBot.mode === 'start',
);

const tasks = computed(() =>
	[
		{
			id: 'store',
			title: t('onboarding.gettingStarted.store.title'),
			description: t('onboarding.gettingStarted.store.description'),
			completed: hasConnectedStore.value,
		},
		{
			id: 'product',
			title: t('onboarding.gettingStarted.product.title'),
			description: t('onboarding.gettingStarted.product.description'),
			completed: hasConfiguredProduct.value,
		},
		{
			id: 'price-bot',
			title: t('onboarding.gettingStarted.priceBot.title'),
			description: t('onboarding.gettingStarted.priceBot.description'),
			completed: isPriceBotEnabled.value,
		},
	].filter(task => !task.completed),
);

onMounted(async () => {
	try {
		if (!dashboard.summary) await dashboard.getSummary();
	} finally {
		onboardingLoaded.value = true;
	}
});
</script>

<template>
	<Island v-if="onboardingLoaded && tasks.length">
		<div class="p-4 bg-primary/10">
			<div v-for="(task, i) in tasks.slice(0, 1)" :key="task.id">
				<div class="space-y-1">
					<div class="flex">
						<h2 class="text-xm font-semibold flex-1">{{ task.title }}</h2>
						<div v-if="tasks.length > 1" class="flex items-center gap-1.5">
							<div
								v-for="(task, index) in tasks"
								:key="task.id"
								:class="
									cn(
										'size-2.5 rounded-full',
										index === 0 ? 'bg-primary' : 'bg-foreground/20',
									)
								"
							/>
						</div>
					</div>
					<p class="text-md text-foreground/90">{{ task.description }}</p>
				</div>
			</div>
		</div>
	</Island>
</template>
