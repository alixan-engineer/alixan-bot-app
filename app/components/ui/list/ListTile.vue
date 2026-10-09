<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';

import { cn } from '~/utils/cn';

defineOptions({ inheritAttrs: false });

interface ListTileProps {
	title?: string;
	description?: string;
}

withDefaults(defineProps<ListTileProps>(), {
	title: undefined,
	description: undefined,
});

const attrs = useAttrs();
const slots = useSlots();
const hasLeading = computed(() => Boolean(slots.leading));
const hasTrailing = computed(() => Boolean(slots.trailing));
const hasClickListener = computed(() => Boolean(attrs.onClick));
</script>

<template>
	<component
		:is="hasClickListener ? 'button' : 'div'"
		:type="hasClickListener ? 'button' : undefined"
		:class="
			cn(
				'flex min-h-18 w-full items-center gap-3 bg-background px-4 text-left transition-colors',
				hasClickListener
					? 'cursor-pointer hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none'
					: '',
				attrs.class,
			)
		"
		v-bind="{ ...attrs, class: undefined }"
	>
		<div v-if="hasLeading" class="flex shrink-0 items-center justify-center">
			<slot name="leading" />
		</div>

		<div
			data-list-tile-content
			class="flex min-w-0 flex-1 self-stretch items-center gap-3 py-3.5"
		>
			<div class="min-w-0 flex-1">
				<div
					v-if="title || $slots.title"
					class="md:text-lg max-md:text-xm font-medium leading-5"
				>
					<slot name="title">{{ $t(title ?? '') }}</slot>
				</div>
				<div
					v-if="description || $slots.description"
					class="mt-1.5 text-sm leading-5 text-muted-foreground"
				>
					<slot name="description">{{ $t(description ?? '') }}</slot>
				</div>
				<slot />
			</div>
			<div
				v-if="hasTrailing"
				class="flex shrink-0 items-center justify-center gap-1"
			>
				<slot name="trailing" />
			</div>
		</div>
	</component>
</template>
