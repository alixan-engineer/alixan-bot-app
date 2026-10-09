<script setup lang="ts">
import { ChevronDown, X } from '@lucide/vue';
import { computed, useAttrs, useSlots } from 'vue';

import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

type ChipType = 'default' | 'select' | 'remove';
type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps {
	label?: string;
	type?: ChipType;
	size?: ChipSize;
	selected?: boolean;
	disabled?: boolean;
}

const props = withDefaults(defineProps<ChipProps>(), {
	label: undefined,
	type: 'default',
	size: 'md',
	selected: false,
	disabled: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
	remove: [event: MouseEvent];
}>();

const attrs = useAttrs();
const slots = useSlots();

const sizeClasses: Record<ChipSize, string> = {
	sm: 'h-8 rounded-lg px-2.5 text-sm [&_svg]:size-4',
	md: 'h-9 rounded-xl px-3 text-md [&_svg]:size-4',
	lg: 'h-10 rounded-2xl px-4 text-base [&_svg]:size-5',
};

const chipClass = computed(() =>
	cn(
		'inline-flex max-w-full items-center justify-center gap-2 border font-medium whitespace-nowrap focus-visible:outline-none',
		sizeClasses[props.size],
		props.selected
			? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:bg-primary/90'
			: 'border-border text-foreground hover:bg-secondary/40 focus-visible:bg-secondary/40',
		props.disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer',
		attrs.class,
	),
);

const hasDefaultSlot = computed(() => Boolean(slots.default));
const hasTrailingSlot = computed(() => Boolean(slots.trailing));
const isRemove = computed(() => props.type === 'remove');
const isSelect = computed(() => props.type === 'select');

const handleClick = (event: MouseEvent): void => {
	if (props.disabled) {
		return;
	}

	emit('click', event);

	if (isRemove.value) {
		emit('remove', event);
	}
};
</script>

<template>
	<button
		v-bind="{ ...attrs, class: undefined }"
		type="button"
		:disabled="disabled"
		:class="chipClass"
		@click="handleClick"
	>
		<span v-if="$slots.leading" class="flex items-center justify-center">
			<slot name="leading" />
		</span>

		<span v-if="hasDefaultSlot || label" class="truncate">
			<slot>
				{{ label }}
			</slot>
		</span>

		<span
			v-if="hasTrailingSlot || isSelect || isRemove"
			class="flex items-center justify-center"
		>
			<slot name="trailing">
				<ChevronDown v-if="isSelect" />
				<X v-else-if="isRemove" />
			</slot>
		</span>
	</button>
</template>
