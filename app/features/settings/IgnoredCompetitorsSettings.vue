<script setup lang="ts">
import { ChevronRight } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import IgnoredCompetitorsDialog from './IgnoredCompetitorsDialog.vue';

const products = useProducts();
const dialog = useDialog();
const loading = ref(true);
const failed = ref(false);
const removingId = ref<string | null>(null);
const toast = useToast();
const confirmRemove = (competitorId: string) => {
	if (removingId.value !== null) return;
	dialog.open(ConfirmDialog, {
		width: '460px',
		height: '200px',
		data: {
			title: 'settings.removeIgnoredCompetitorConfirm',
			cancelLabel: 'common.cancel',
			submitLabel: 'actions.remove',
			submitColor: 'destructive',
			onSubmit: async () => {
				if (removingId.value !== null) return;
				removingId.value = competitorId;
				try {
					await products.removeIgnoredCompetitor(competitorId);
				} catch {
					toast.open('settings.saveError', 'error');
				} finally {
					removingId.value = null;
				}
			},
		},
	});
};
const load = async () => {
	loading.value = true;
	failed.value = false;
	try {
		await products.getIgnoredCompetitors();
	} catch {
		failed.value = true;
	} finally {
		loading.value = false;
	}
};
const open = () =>
	dialog.open(IgnoredCompetitorsDialog, {
		width: '480px',
		height: 'auto',
		title: 'settings.ignoredCompetitors',
	});
onMounted(load);
</script>

<template>
	<ListTile>
		<template #title>
			<button type="button" class="w-full cursor-pointer text-left" @click="open">
				{{ $t('settings.ignoredCompetitors') }}
			</button>
		</template>
		<template #description>
			<span v-if="loading">{{ $t('settings.loading') }}</span>
			<span v-else-if="failed">{{ $t('settings.loadError') }}</span>
			<div v-else-if="products.ignoredCompetitors.length" class="flex flex-wrap gap-2">
				<Chip
					v-for="competitor in products.ignoredCompetitors"
					:key="competitor.competitorId"
					:label="competitor.competitorId"
					type="remove"
					:disabled="removingId !== null"
					@remove="confirmRemove(competitor.competitorId)"
				/>
			</div>
			<span v-else>{{ $t('settings.ignoredCompetitorsEmpty') }}</span>
		</template>
		<template #trailing>
			<IconButton :tooltip="$t('product.addIgnore')" :aria-label="$t('product.addIgnore')" @click="open">
				<ChevronRight class="size-5" aria-hidden="true" />
			</IconButton>
		</template>
	</ListTile>
</template>
