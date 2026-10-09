<script setup lang="ts">
import { computed, resolveComponent, useAttrs, useSlots } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

type ButtonVariant = 'filled' | 'outlined' | 'ghost';
type ButtonColor = 'default' | 'primary' | 'secondary' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonTarget = '_blank' | '_self' | '_parent' | '_top';

interface ButtonProps {
	label?: string;
	type?: 'button' | 'submit' | 'reset';
	variant?: ButtonVariant;
	color?: ButtonColor;
	size?: ButtonSize;
	to?: RouteLocationRaw;
	href?: string;
	target?: ButtonTarget;
	tooltip?: string;
}

const props = withDefaults(defineProps<ButtonProps>(), {
	type: 'button',
	variant: 'filled',
	color: 'default',
	size: 'md',
	label: undefined,
	to: undefined,
	href: undefined,
	target: undefined,
	tooltip: undefined,
});

const attrs = useAttrs();
const slots = useSlots();
const NuxtLink = resolveComponent('NuxtLink');
const Tooltip = resolveComponent('Tooltip');

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'h-9 rounded-lg px-3.5 text-sm',
	md: 'h-11 rounded-[10px] px-4 text-base',
	lg: 'h-12 rounded-xl px-5 text-base',
};

const toneClasses: Record<ButtonVariant, Record<ButtonColor, string>> = {
	filled: {
		default:
			'border-foreground bg-foreground text-background hover:bg-foreground/90 focus-visible:bg-foreground/90',
		primary:
			'border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:bg-primary/90',
		secondary:
			'border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:bg-secondary/80',
		destructive:
			'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:bg-destructive/90',
	},
	outlined: {
		default:
			'border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground',
		primary:
			'border-primary/25 bg-transparent text-primary hover:bg-primary/10 focus-visible:bg-primary/10',
		secondary:
			'border-border bg-secondary/70 text-secondary-foreground hover:bg-secondary focus-visible:bg-secondary',
		destructive:
			'border-destructive/25 bg-transparent text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10',
	},
	ghost: {
		default:
			'border-transparent bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground',
		primary:
			'border-transparent bg-transparent text-primary hover:bg-primary/10 focus-visible:bg-primary/10',
		secondary:
			'border-transparent bg-transparent text-secondary-foreground hover:bg-secondary focus-visible:bg-secondary',
		destructive:
			'border-transparent bg-transparent text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10',
	},
};

const hasDefaultSlot = computed(() => Boolean(slots.default));

const buttonClass = computed(() =>
	cn(
			'flex items-center justify-center gap-2 border font-semibold whitespace-nowrap cursor-pointer transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 select-none',
		sizeClasses[props.size],
		toneClasses[props.variant][props.color],
		attrs.class,
	),
);

const wrapperComponent = computed(() => (props.tooltip ? Tooltip : 'span'));
const wrapperAttrs = computed(() =>
	props.tooltip ? { text: props.tooltip } : { class: 'contents' },
);
</script>

<template>
	<component :is="wrapperComponent" v-bind="wrapperAttrs">
		<component
			:is="to ? NuxtLink : href ? 'a' : 'button'"
			v-bind="{ ...attrs, class: undefined }"
			:to="to"
			:href="href"
			:target="target"
			:type="to || href ? undefined : type"
			:class="buttonClass"
		>
			<span v-if="$slots.leading" class="flex items-center justify-center">
				<slot name="leading" />
			</span>

			<span v-if="hasDefaultSlot || label" class="truncate">
				<slot>
					{{ $t(label) }}
				</slot>
			</span>

			<span v-if="$slots.trailing" class="flex items-center justify-center">
				<slot name="trailing" />
			</span>
		</component>
	</component>
</template>
