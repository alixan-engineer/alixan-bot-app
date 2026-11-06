<script setup lang="ts">
const props = defineProps<{ close: () => void }>();
const products = useProducts();
const toast = useToast();
const competitorId = ref('');
const loading = ref(false);
const error = ref('');
const add = async () => {
	if (loading.value) return;
	const id = competitorId.value.trim();
	if (!id) {
		error.value = 'settings.competitorRequired';
		return;
	}
	loading.value = true;
	error.value = '';
	try {
		await products.addIgnoredCompetitor(id);
		competitorId.value = '';
		toast.open('product.competitorIgnored', 'success');
		props.close();
	} catch {
		error.value = 'settings.saveError';
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<div class="flex max-h-[70dvh] flex-col">
		<div class="min-h-0 space-y-5 overflow-y-auto p-4 sm:p-6">
			<p class="text-sm leading-6 text-muted-foreground">
				{{ $t('settings.ignoredCompetitorsHint') }}
			</p>
			<form class="flex flex-col gap-3" @submit.prevent="add">
				<Input
					v-model="competitorId"
					label="product.competitorId"
					:disabled="loading"
					autocomplete="off"
				/>
				<Button
					type="submit"
					color="primary"
					label="product.addIgnore"
					:disabled="loading || !competitorId.trim()"
				/>
			</form>
			<p v-if="error" role="alert" class="text-sm text-destructive">
				{{ $t(error) }}
			</p>
		</div>
	</div>
</template>
