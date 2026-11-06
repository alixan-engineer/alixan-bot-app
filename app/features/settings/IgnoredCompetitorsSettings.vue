<script setup lang="ts">
import { ChevronRight } from '@lucide/vue';
import IgnoredCompetitorsDialog from './IgnoredCompetitorsDialog.vue';

const products = useProducts();
const dialog = useDialog();
const loading = ref(true);
const failed = ref(false);
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
	<ListTile title="settings.ignoredCompetitors" @click="open">
		<template #description>
			<span v-if="loading">{{ $t('settings.loading') }}</span>
			<span v-else-if="failed">{{ $t('settings.loadError') }}</span>
			<span
				v-else-if="products.ignoredCompetitors.length"
				class="block wrap-anywhere"
				>{{
					products.ignoredCompetitors
						.map((item) => item.competitorId)
						.join(', ')
				}}</span
			>
			<span v-else>{{ $t('settings.ignoredCompetitorsEmpty') }}</span>
		</template>
		<template #trailing
			><ChevronRight class="size-5 text-muted-foreground" aria-hidden="true"
		/></template>
	</ListTile>
</template>
