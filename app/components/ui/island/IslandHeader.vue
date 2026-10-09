<script setup lang="ts">
interface IslandProps {
	title?: string;
	description?: string;
}

withDefaults(defineProps<IslandProps>(), {
	title: undefined,
	description: undefined,
});
</script>

<template>
	<header v-if="title || description" class="flex flex-col gap-1">
		<h1
			v-if="title"
			class="max-md:text-xl font-semibold leading-8 tracking-tight md:text-3xl md:leading-9"
		>
			{{ $t(title) }}
		</h1>
		<p
			v-if="description"
			class="text-base leading-6 text-muted-foreground md:text-xm"
		>
			{{ $t(description) }}
		</p>
	</header>
</template>
