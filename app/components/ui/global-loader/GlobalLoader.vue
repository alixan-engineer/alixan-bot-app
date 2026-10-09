<script setup lang="ts">
interface GlobalLoaderProps {
	label?: string;
}

withDefaults(defineProps<GlobalLoaderProps>(), {
	label: '',
});
</script>

<template>
	<div
		class="min-w-28 rounded-3xl border bg-background p-6 shadow-2xl shadow-black/20"
	>
		<div class="flex flex-col items-center gap-4">
			<Spinner :size="label ? 'md' : 'lg'" />
			<p v-if="label" class="text-md font-medium text-muted-foreground">
				{{ $t(label) }}
			</p>
		</div>
	</div>
</template>
