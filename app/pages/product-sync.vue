<script setup lang="ts">
import { RefreshCw } from '@lucide/vue';
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import type { CatalogSyncState } from '~/composables/useProducts';

usePageMeta({
	title: 'seo.pages.productSync.title',
	description: 'seo.pages.productSync.description',
});

const products = useProducts();
const dialog = useDialog();
const state = ref<CatalogSyncState | null>(null);
const loading = ref(true);
const activeFaq = ref<string | number | null>('when');
const faqItems = [{ value: 'when', title: 'productSync.faq.when' }];
let timer: ReturnType<typeof setInterval> | undefined;

const isActive = computed(
	() => state.value?.status === 'queued' || state.value?.status === 'running',
);
const progress = computed(() => {
	if (!state.value?.totalProducts) return 0;
	return Math.min(
		100,
		Math.round(
			(state.value.processedProducts / state.value.totalProducts) * 100,
		),
	);
});
const statusKey = computed(
	() =>
		({
			idle: 'productSync.statuses.idle',
			queued: 'productSync.statuses.queued',
			running: 'productSync.statuses.running',
			completed: 'productSync.statuses.completed',
			failed: 'productSync.statuses.failed',
		})[state.value?.status ?? 'idle'],
);

const loadStatus = async () => {
	state.value = await products.getSynchronizationStatus();
};

const start = async () => {
	state.value = await products.synchronizeProducts();
};

const openAlreadyRunningAlert = () => {
	dialog.open(AlertDialog, {
		width: '360px',
		height: '300px',
		data: {
			title: 'productSync.alreadyRunning.title',
			description: 'productSync.alreadyRunning.description',
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

const confirmStart = () => {
	if (isActive.value) {
		openAlreadyRunningAlert();
		return;
	}

	dialog.open(ConfirmDialog, {
		width: '460px',
		height: '300px',
		data: {
			title: 'productSync.confirm.title',
			description: 'productSync.confirm.description',
			cancelLabel: 'common.cancel',
			submitLabel: 'productSync.confirm.submit',
			onSubmit: start,
		},
	});
};

onMounted(async () => {
	try {
		await loadStatus();
	} finally {
		loading.value = false;
	}
	timer = setInterval(() => void loadStatus(), 2_000);
});

onBeforeUnmount(() => {
	if (timer) clearInterval(timer);
});
</script>

<template>
	<InfoBox>
		{{ $t('productSync.info') }}
	</InfoBox>

	<div class="flex">
		<Button color="primary" size="sm" @click="confirmStart">
			<template #leading>
				<RefreshCw class="size-4" :class="isActive ? 'animate-spin' : ''" />
			</template>
			{{
				$t(
					isActive
						? 'productSync.actions.running'
						: 'productSync.actions.start',
				)
			}}
		</Button>
	</div>

	<Spinner v-if="loading" />
	<Island v-else-if="state" content-class="space-y-6 p-5 sm:p-6">
		<div class="flex items-center justify-between gap-4">
			<p class="text-sm text-muted-foreground">
				{{ $t('productSync.status') }}
			</p>
			<p class="font-semibold">{{ $t(statusKey) }}</p>
		</div>
		<div class="flex items-end justify-between gap-4">
			<div>
				<p class="text-sm text-muted-foreground">
					{{ $t('productSync.processed') }}
				</p>
				<p class="mt-1 text-3xl font-bold">
					{{ state.processedProducts }}/{{ state.totalProducts }}
				</p>
			</div>
			<p class="text-xl font-semibold">{{ progress }}%</p>
		</div>

		<div class="h-3 overflow-hidden rounded-full bg-secondary">
			<div
				class="h-full rounded-full bg-primary transition-all duration-500"
				:style="{ width: `${progress}%` }"
			/>
		</div>

		<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			<div class="rounded-xl border p-4">
				<p class="text-sm text-muted-foreground">
					{{ $t('productSync.added') }}
				</p>
				<p class="mt-1 text-2xl font-semibold">{{ state.addedProducts }}</p>
			</div>
			<div class="rounded-xl border p-4">
				<p class="text-sm text-muted-foreground">
					{{ $t('productSync.skipped') }}
				</p>
				<p class="mt-1 text-2xl font-semibold">{{ state.skippedProducts }}</p>
			</div>
			<div class="rounded-xl border p-4">
				<p class="text-sm text-muted-foreground">
					{{ $t('productSync.failedProducts') }}
				</p>
				<p class="mt-1 text-2xl font-semibold">{{ state.failedProducts }}</p>
			</div>
			<div class="rounded-xl border p-4">
				<p class="text-sm text-muted-foreground">
					{{ $t('productSync.failedOperations') }}
				</p>
				<p class="mt-1 text-2xl font-semibold">
					{{ state.failedOperations ?? 0 }}
				</p>
			</div>
		</div>

		<p
			v-if="state.currentTitle || state.currentMasterSku"
			class="text-sm text-muted-foreground"
		>
			{{ $t('productSync.current') }}:
			{{ state.currentTitle || state.currentMasterSku }}
		</p>
		<p v-if="state.error" class="text-sm text-destructive">
			{{ state.error }}
		</p>
	</Island>
	<section class="mt-8 space-y-4">
		<h2 class="ml-3 text-xl font-semibold">
			{{ $t('productSync.faq.title') }}
		</h2>
		<Accordion v-model="activeFaq" :items="faqItems">
			<template #content>
				<ul class="list-disc space-y-1 pl-5">
					<li>{{ $t('productSync.faq.removed') }}</li>
					<li>{{ $t('productSync.faq.multipleStores') }}</li>
				</ul>
			</template>
		</Accordion>
	</section>
</template>
