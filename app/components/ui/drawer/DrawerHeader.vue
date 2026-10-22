<script setup lang="ts">
import { X } from '@lucide/vue';
defineProps<{ title: string; close: () => void }>();
</script>

<template>
	<div class="flex min-h-14 shrink-0 items-center gap-3 px-4 py-3">
		<h2 class="flex-1 text-lg font-semibold leading-6">{{ $t(title) }}</h2>
		<IconButton variant="ghost" :aria-label="$t('common.close')" @click="close"
			><X
		/></IconButton>
	</div>
</template>
