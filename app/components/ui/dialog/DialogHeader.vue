<script setup lang="ts">
import { X } from '@lucide/vue';

interface DialogHeaderProps {
	title: string;
	close: () => void;
}

defineProps<DialogHeaderProps>();
</script>

<template>
	<div class="h-16 pl-6 pr-2.5 flex items-center justify-between">
		<h2 class="text-lg font-semibold">
			{{ $t(title) }}
		</h2>
		<IconButton variant="ghost" color="default" @click="close">
			<X />
		</IconButton>
	</div>
</template>
