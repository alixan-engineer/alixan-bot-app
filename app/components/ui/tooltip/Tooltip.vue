<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

type TooltipPlacement = 'top' | 'bottom';

interface TooltipProps {
	text?: string;
	disabled?: boolean;
	delay?: number;
}

const props = withDefaults(defineProps<TooltipProps>(), {
	text: '',
	disabled: false,
	delay: 100,
});

const isOpen = ref(false);
const isPositioned = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const placement = ref<TooltipPlacement>('bottom');
const tooltipStyle = ref({ left: '0px', top: '0px' });
const canUseTooltip = ref(false);
let openTimer: number | undefined;
let pointerMedia: MediaQueryList | undefined;

const content = computed(() => props.text);
const delay = computed(() => Math.max(0, props.delay));

const clearOpenTimer = (): void => {
	if (!openTimer) return;
	window.clearTimeout(openTimer);
	openTimer = undefined;
};

const updatePosition = async (): Promise<void> => {
	await nextTick();

	const trigger = triggerRef.value;
	const tooltip = tooltipRef.value;
	if (!trigger || !tooltip) return;

	const gap = 8;
	const padding = 8;
	const triggerRect = trigger.getBoundingClientRect();
	const tooltipRect = tooltip.getBoundingClientRect();
	const hasBottomSpace =
		triggerRect.bottom + gap + tooltipRect.height <=
		window.innerHeight - padding;
	const hasTopSpace = triggerRect.top - gap - tooltipRect.height >= padding;

	placement.value = hasBottomSpace || !hasTopSpace ? 'bottom' : 'top';

	const left = Math.min(
		Math.max(
			triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
			padding,
		),
		window.innerWidth - tooltipRect.width - padding,
	);
	const top =
		placement.value === 'bottom'
			? triggerRect.bottom + gap
			: triggerRect.top - tooltipRect.height - gap;

	tooltipStyle.value = {
		left: `${left}px`,
		top: `${top}px`,
	};
	isPositioned.value = true;
};

const addWindowListeners = (): void => {
	window.addEventListener('resize', updatePosition);
	window.addEventListener('scroll', updatePosition, true);
};

const removeWindowListeners = (): void => {
	window.removeEventListener('resize', updatePosition);
	window.removeEventListener('scroll', updatePosition, true);
};

const openTooltip = (): void => {
	if (props.disabled) return;
	if (!canUseTooltip.value) return;

	clearOpenTimer();
	openTimer = window.setTimeout(() => {
		isPositioned.value = false;
		isOpen.value = true;
		void updatePosition();
	}, delay.value);
};

const closeTooltip = (): void => {
	clearOpenTimer();
	isOpen.value = false;
	isPositioned.value = false;
};

const handleKeydown = (event: KeyboardEvent): void => {
	if (event.key === 'Escape') {
		closeTooltip();
	}
};

const updatePointerCapability = (): void => {
	canUseTooltip.value = Boolean(pointerMedia?.matches);

	if (!canUseTooltip.value) {
		closeTooltip();
	}
};

watch(isOpen, value => {
	if (value) {
		addWindowListeners();
		return;
	}
	removeWindowListeners();
});

onBeforeUnmount(() => {
	clearOpenTimer();
	removeWindowListeners();
	pointerMedia?.removeEventListener('change', updatePointerCapability);
});

onMounted(() => {
	pointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
	updatePointerCapability();
	pointerMedia.addEventListener('change', updatePointerCapability);
});
</script>

<template>
	<span
		ref="triggerRef"
		class="inline-flex"
		@mouseenter="openTooltip"
		@mouseleave="closeTooltip"
		@focusin="openTooltip"
		@focusout="closeTooltip"
		@click="closeTooltip"
		@keydown="handleKeydown"
	>
		<slot />
	</span>

	<Teleport to="body">
		<Transition
			enter-active-class="transition duration-150"
			enter-from-class="opacity-0 translate-y-1"
			enter-to-class="opacity-100 translate-y-0"
			leave-active-class="transition duration-100"
			leave-from-class="opacity-100 translate-y-0"
			leave-to-class="opacity-0 translate-y-1"
		>
			<div
				v-if="isOpen && (content || $slots.content)"
				ref="tooltipRef"
				:style="tooltipStyle"
				class="pointer-events-none fixed z-9999 max-w-64 rounded-lg border bg-popover px-3 py-2 text-md text-popover-foreground shadow-lg"
				:class="isPositioned ? '' : 'invisible'"
				role="tooltip"
			>
				<slot name="content">
					{{ $t(content) }}
				</slot>
			</div>
		</Transition>
	</Teleport>
</template>
