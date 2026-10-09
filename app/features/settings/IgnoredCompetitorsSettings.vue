<script setup lang="ts">
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';

const products = useProducts();
const toast = useToast();
const dialog = useDialog();
const competitorId = ref('');
const loading = ref(false);

const openFormAlert = (): void => {
	dialog.open(AlertDialog, {
		width: '360px',
		height: '280px',
		data: {
			title: 'store.formRequired.title',
			description: 'settings.competitorRequired',
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

const loadIgnoredCompetitors = async (): Promise<void> => {
	loading.value = true;
	try {
		await products.getIgnoredCompetitors();
	} finally {
		loading.value = false;
	}
};

const addCompetitor = async (): Promise<void> => {
	const id = competitorId.value.trim();
	if (!id) {
		openFormAlert();
		return;
	}

	loading.value = true;
	try {
		await products.addIgnoredCompetitor(id);
		competitorId.value = '';
		toast.open('product.competitorIgnored', 'success');
	} finally {
		loading.value = false;
	}
};

const removeCompetitor = async (id: string): Promise<void> => {
	loading.value = true;
	try {
		await products.removeIgnoredCompetitor(id);
		toast.open('product.competitorRemoved', 'success');
	} finally {
		loading.value = false;
	}
};

onMounted(async () => {
	await loadIgnoredCompetitors();
});
</script>

<template>
	<Island content-class="flex flex-col gap-4 p-3.5 sm:gap-6 sm:p-6">
		<div>
			<p class="text-xl font-semibold">
				{{ $t('settings.ignoredCompetitors') }}
			</p>
			<p class="mt-1 text-base text-muted-foreground">
				{{ $t('settings.ignoredCompetitorsHint') }}
			</p>
		</div>

		<div class="flex gap-3">
			<Input
				v-model="competitorId"
				label="product.competitorId"
				:disabled="loading"
				@keydown.enter="addCompetitor"
			/>
			<Button
				v-if="!loading"
				class="sm:mt-0.5 sm:shrink-0"
				color="primary"
				label="product.addIgnore"
				@click="addCompetitor"
			/>
		</div>

		<Spinner v-if="loading && !products.ignoredCompetitors.length" />

		<div
			v-else-if="products.ignoredCompetitors.length"
			class="flex flex-wrap gap-2"
		>
			<Chip
				v-for="competitor in products.ignoredCompetitors"
				:key="competitor.competitorId"
				type="remove"
				:disabled="loading"
				@remove="removeCompetitor(competitor.competitorId)"
			>
				{{ competitor.competitorId }}
			</Chip>
		</div>
		
		<p v-else class="text-base text-muted-foreground">
			{{ $t('settings.ignoredCompetitorsEmpty') }}
		</p>
	</Island>
</template>
