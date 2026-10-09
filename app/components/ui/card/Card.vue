<script setup lang="ts">
interface CardProps {
	image?: string;
	imageAlt?: string;
	title: string;
	description?: string;
	price?: string;
	button?: string;
}

withDefaults(defineProps<CardProps>(), {
	image: undefined,
	imageAlt: '',
	description: undefined,
	price: undefined,
	button: undefined,
});

const emit = defineEmits<{
	onTap: [];
}>();
</script>

<template>
	<Island content-class="overflow-hidden bg-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
		<img
			v-if="image"
			:src="image"
			:alt="$t(imageAlt)"
			loading="lazy"
			class="w-full aspect-auto object-cover"
		/>
		<div class="space-y-4 p-5">
			<div class="space-y-2">
				<h3 class="text-lg font-semibold leading-6 tracking-normal">
					{{ $t(title) }}
				</h3>
				<p v-if="description" class="text-md leading-6 text-muted-foreground">
					{{ $t(description) }}
				</p>
			</div>
			<div class="flex items-center justify-between gap-3">
				<p v-if="price" class="text-lg font-semibold">
					{{ $t(price) }}
				</p>
				<Button
					v-if="button"
					class="ml-auto"
					size="sm"
					color="primary"
					@click="emit('onTap')"
				>
					{{ $t(button) }}
				</Button>
			</div>
		</div>
	</Island>
</template>
