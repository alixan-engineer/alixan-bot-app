<script setup lang="ts">
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';

usePageMeta({
	title: 'seo.pages.stockSettings.title',
	description: 'seo.pages.stockSettings.description',
});

const MIN_STOCK_QUANTITY = 3;
const MAX_STOCK_QUANTITY = 10_000;

const botSettings = useBotSettings();
const toast = useToast();
const loader = useGlobalLoader();
const dialog = useDialog();
const stockQuantity = ref<number | null>(null);
const activeFaq = ref<string | number | null>(null);

const faqItems = [
	{
		value: 'same-quantity',
		title: 'stockSettings.faq.sameQuantity.title',
		content: 'stockSettings.faq.sameQuantity.content',
	},
	{
		value: 'single-product',
		title: 'stockSettings.faq.singleProduct.title',
		content: 'stockSettings.faq.singleProduct.content',
	},
	{
		value: 'small-quantity',
		title: 'stockSettings.faq.smallQuantity.title',
		content: 'stockSettings.faq.smallQuantity.content',
	},
];

const openValidationAlert = () => {
	dialog.open(AlertDialog, {
		width: '420px',
		height: '300px',
		data: {
			title: 'stockSettings.validation.title',
			description: 'stockSettings.validation.description',
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
	const nextStockQuantity = Number(stockQuantity.value);
	if (
		!Number.isInteger(nextStockQuantity) ||
		nextStockQuantity < MIN_STOCK_QUANTITY ||
		nextStockQuantity > MAX_STOCK_QUANTITY
	) {
		openValidationAlert();
		return;
	}

	try {
		loader.show();
		await botSettings.updateSettings({ stockQuantity: nextStockQuantity });
		stockQuantity.value = nextStockQuantity;
		toast.open('stockSettings.saved', 'success');
	} finally {
		loader.hide();
	}
};

onMounted(async () => {
	const settings = await botSettings.getSettings();
	stockQuantity.value = settings.stockQuantity ?? MAX_STOCK_QUANTITY;
});
</script>

<template>
	<Spinner v-if="botSettings.loading && !botSettings.settings" />

	<template v-else>
		<Island content-class="p-4 sm:p-6">
			<p class="text-xl font-semibold">
				{{ $t('stockSettings.title') }}
			</p>
			<p class="text-base text-muted-foreground mt-1 mb-4">
				{{ $t('stockSettings.description') }}
			</p>
			<form
				class="flex flex-col gap-4 sm:flex-row sm:items-start"
				novalidate
				@submit.prevent="save"
			>
				<Input
					v-model.number="stockQuantity"
					type="number"
					:hint="$t('stockSettings.quantityHint')"
					:min="MIN_STOCK_QUANTITY"
					:max="MAX_STOCK_QUANTITY"
					step="1"
					required
					class="flex-1"
				/>
				<Button
					type="submit"
					color="primary"
					label="common.save"
					class="sm:mt-1.5"
				/>
			</form>
		</Island>

		<section class="space-y-4 mt-8">
			<p class="text-xl font-semibold ml-6">
				{{ $t('stockSettings.faq.title') }}
			</p>
			<Accordion v-model="activeFaq" :items="faqItems" />
		</section>
	</template>
</template>
