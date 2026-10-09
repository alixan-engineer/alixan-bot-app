<script setup lang="ts">
import { cn } from '~/utils/cn';
import IslandHeader from './IslandHeader.vue';

defineOptions({ inheritAttrs: false });

interface IslandProps {
	title?: string;
	description?: string;
	headerPosition?: 'inside' | 'outside';
	contentClass?: string;
}

withDefaults(defineProps<IslandProps>(), {
	title: undefined,
	description: undefined,
	headerPosition: 'outside',
	contentClass: undefined,
});

const attrs = useAttrs();
</script>

<template>
	<section
		:class="cn('flex h-fit flex-col gap-3', attrs.class)"
		v-bind="{ ...attrs, class: undefined }"
	>
		<IslandHeader
			v-if="headerPosition === 'outside'"
			:title="title"
			:description="description"
			class="ml-4"
		/>
		<div
			:class="
				cn('overflow-hidden rounded-2xl border bg-background', contentClass)
			"
		>
			<IslandHeader
				v-if="headerPosition === 'inside'"
				:title="title"
				:description="description"
				class="p-4"
			/>
			<slot />
		</div>
	</section>
</template>
