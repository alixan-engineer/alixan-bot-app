<script setup lang="ts">
defineProps<{
	title: string;
	close: () => void;
}>();
</script>

<template>
	<div class="min-h-14 flex flex-col items-center px-4 pb-4 pt-1.5">
		<h2
			class="flex-1 flex items-center justify-center text-lg font-semibold leading-6"
		>
			{{ $t(title) }}
		</h2>
	</div>
</template>
