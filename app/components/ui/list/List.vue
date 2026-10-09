<script setup lang="ts">
import { computed, useAttrs } from 'vue';

import { cn } from '~/utils/cn';

defineOptions({ inheritAttrs: false });

type ListDivider = 'inset' | 'block';

interface ListProps {
	divider?: ListDivider;
}

const props = withDefaults(defineProps<ListProps>(), {
	divider: 'inset',
});

const attrs = useAttrs();
const listClass = computed(() =>
	cn(
		props.divider === 'inset'
			? 'overflow-hidden [&>*:not(:last-child)>[data-list-tile-content]]:border-b'
			: 'grid gap-6 [&>*]:overflow-hidden [&>*]:rounded-2xl [&>*]:border',
		attrs.class,
	),
);
</script>

<template>
	<div :class="listClass" v-bind="{ ...attrs, class: undefined }">
		<slot />
	</div>
</template>
