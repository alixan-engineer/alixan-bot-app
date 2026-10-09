<script setup lang="ts">
import { computed, useAttrs } from 'vue';

import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
	size?: SpinnerSize;
}

const props = withDefaults(defineProps<SpinnerProps>(), {
	size: 'md',
});

const attrs = useAttrs();

const sizeClasses: Record<SpinnerSize, string> = {
	sm: 'size-6 border-[3px]',
	md: 'size-9 border-4',
	lg: 'size-12 border-4',
};

const rootClass = computed(() =>
	cn('flex-1 size-full flex items-center justify-center', attrs.class),
);

const spinnerClass = computed(() =>
	cn(
		'rounded-full border-secondary border-t-primary animate-spin',
		sizeClasses[props.size],
	),
);
</script>

<template>
	<div :class="rootClass" role="status">
		<div :class="spinnerClass" aria-hidden="true" />
	</div>
</template>
