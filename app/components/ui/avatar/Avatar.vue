<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { cn } from '~/utils/cn';

defineOptions({ inheritAttrs: false });

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
	name?: string;
	img?: string;
	alt?: string;
	size?: AvatarSize;
}

const props = withDefaults(defineProps<AvatarProps>(), {
	name: '',
	img: undefined,
	alt: undefined,
	size: 'md',
});

const attrs = useAttrs();
const initials = computed(() =>
	props.name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(part => part.charAt(0))
		.join('')
		.toUpperCase(),
);

const sizeClasses: Record<AvatarSize, string> = {
	sm: 'size-8 text-sm',
	md: 'size-10 text-base',
	lg: 'size-12 text-lg',
	xl: 'size-24 text-3xl',
};
</script>

<template>
	<span
		:class="
			cn(
				'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-card font-semibold text-card-foreground select-none',
				sizeClasses[size],
				attrs.class,
			)
		"
		:role="img ? undefined : 'img'"
		:aria-label="img ? undefined : $t(name)"
		v-bind="{ ...attrs, class: undefined }"
	>
		<img
			v-if="img"
			:src="img"
			:alt="$t(alt || name)"
			loading="lazy"
			class="size-full object-cover"
		/>
		<span v-else aria-hidden="true">{{ initials }}</span>
	</span>
</template>
