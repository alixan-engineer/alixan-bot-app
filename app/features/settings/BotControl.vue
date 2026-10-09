<script setup lang="ts">
defineProps<{
	title: string;
	description: string;
}>();
</script>

<template>
	<Island content-class="flex flex-col p-3.5 sm:p-6">
		<div
			class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="min-w-0">
				<p class="text-xl font-semibold">{{ $t(title) }}</p>
				<p class="mt-1 text-base text-muted-foreground">
					{{ $t(description) }}
				</p>
			</div>
			<div class="flex shrink-0 items-center *:w-full sm:*:w-auto">
				<slot />
			</div>
		</div>
	</Island>
</template>
