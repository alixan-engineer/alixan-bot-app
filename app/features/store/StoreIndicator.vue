<script setup lang="ts">
import type { StoreStatus } from '~/composables/useStores';

const props = defineProps<{ status: StoreStatus }>();

const statusText = computed(() => {
	if (props.status === 'enable') return 'store.status.enable';
	if (props.status === 'disable') return 'store.status.disable';
	if (props.status === 'pending') return 'store.status.pending';
	return 'store.status.authError';
});
const statusDotClass = computed(() => {
	if (props.status === 'enable') return 'bg-emerald-500';
	if (props.status === 'pending') return 'bg-amber-500';
	return 'bg-red-500';
});
</script>

<template>
	<span
		class="size-3 shrink-0 rounded-full"
		:class="statusDotClass"
		:title="$t(statusText)"
	/>
</template>
