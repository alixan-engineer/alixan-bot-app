<script setup lang="ts">
type ButtonColor = 'default' | 'primary' | 'secondary' | 'destructive';

interface EmptyProps {
	title: string;
	description?: string;
	button?: string;
	buttonColor?: ButtonColor;
}

defineProps<EmptyProps>();

const emit = defineEmits<{
	action: [];
}>();
</script>

<template>
	<div
		class="size-full flex flex-col items-center justify-center gap-4 text-center"
	>
		<slot />
		<h2 class="md:text-2xl max-md:text-xl font-semibold">{{ $t(title) }}</h2>
		<p
			v-if="description"
			class="md:text-lg max-md:text-md text-balance text-muted-foreground"
		>
			{{ $t(description) }}
		</p>
		<Button
			v-if="button"
			:color="buttonColor ?? 'primary'"
			@click="emit('action')"
		>
			{{ $t(button) }}
		</Button>
	</div>
</template>
