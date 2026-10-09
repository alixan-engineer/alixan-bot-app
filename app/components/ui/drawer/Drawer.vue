<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

type DrawerPosition = 'top' | 'right' | 'bottom' | 'left';

interface DrawerProps {
	width?: string | number;
	height?: string | number;
	title?: string;
	position?: DrawerPosition;
	closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<DrawerProps>(), {
	width: '420px',
	height: '420px',
	title: '',
	position: 'bottom',
	closeOnOverlay: true,
});

const emit = defineEmits<{
	close: [];
}>();

const open = defineModel<boolean>({ default: false });
const panelRef = ref<HTMLElement | null>(null);
const touchStartY = ref<number | null>(null);
const dragOffset = ref(0);
const dragging = ref(false);
const dragEligible = ref(false);

const toCssSize = (value: string | number) => {
	return typeof value === 'number' ? `${value}px` : value;
};

const drawerStyle = computed(() => {
	if (props.position === 'top' || props.position === 'bottom') {
		return {
			maxWidth: toCssSize(props.width),
			maxHeight: toCssSize(props.height),
		};
	}

	return {
		maxWidth: toCssSize(props.width),
	};
});

const positionClass = computed(() => {
	const positions: Record<DrawerPosition, string> = {
		top: 'inset-x-0 top-0 mx-auto h-full w-full rounded-b-3xl',
		right: 'right-0 top-0 h-full w-full rounded-l-3xl',
		bottom: 'bottom-0 inset-x-0 mx-auto h-full w-full rounded-t-3xl',
		left: 'left-0 top-0 h-full w-full rounded-r-3xl',
	};

	return positions[props.position];
});

const transitionClass = computed(() => {
	const positions: Record<DrawerPosition, string> = {
		top: '-translate-y-full',
		right: 'translate-x-full',
		bottom: 'translate-y-full',
		left: '-translate-x-full',
	};

	return positions[props.position];
});

const closeDrawer = () => {
	dragOffset.value = 0;
	open.value = false;
	emit('close');
};

const handleTouchStart = (event: TouchEvent) => {
	if (props.position !== 'bottom') return;
	let element = event.target instanceof HTMLElement ? event.target : null;
	let hasScrolledContent = false;
	while (element && element !== panelRef.value) {
		const overflowY = window.getComputedStyle(element).overflowY;
		if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollTop > 0) {
			hasScrolledContent = true;
			break;
		}
		element = element.parentElement;
	}
	dragEligible.value = !hasScrolledContent;
	touchStartY.value = event.touches[0]?.clientY ?? null;
};

const handleTouchMove = (event: TouchEvent) => {
	if (touchStartY.value === null || !dragEligible.value) return;
	const currentY = event.touches[0]?.clientY ?? touchStartY.value;
	const nextOffset = Math.max(0, currentY - touchStartY.value);
	if (nextOffset > 0) {
		dragging.value = true;
		dragOffset.value = nextOffset;
		if (event.cancelable) event.preventDefault();
	}
};

const handleTouchEnd = () => {
	if (dragOffset.value >= 96) {
		closeDrawer();
	} else {
		dragOffset.value = 0;
	}
	touchStartY.value = null;
	dragging.value = false;
	dragEligible.value = false;
};

const panelStyle = computed(() => ({
	...drawerStyle.value,
	...(props.position === 'bottom' && dragOffset.value
		? { transform: `translateY(${dragOffset.value}px)` }
		: {}),
	transition: dragging.value ? 'none' : undefined,
}));

const handleOverlayMouseDown = () => {
	if (props.closeOnOverlay) {
		closeDrawer();
	}
};

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Escape' && open.value) {
		closeDrawer();
	}
};

watch(open, value => {
	if (!import.meta.client) {
		return;
	}

	if (value) {
		document.addEventListener('keydown', handleKeydown);
		document.body.style.overflow = 'hidden';
		return;
	}

	document.removeEventListener('keydown', handleKeydown);
	document.body.style.overflow = '';
});

onBeforeUnmount(() => {
	if (!import.meta.client) {
		return;
	}

	document.removeEventListener('keydown', handleKeydown);
	document.body.style.overflow = '';
});
</script>

<template>
	<Teleport to="body">
		<Transition
			enter-active-class="transition"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="open"
				class="backdrop z-9000"
				@mousedown.stop="handleOverlayMouseDown"
				@click.stop
			>
				<Transition
					appear
					enter-active-class="transition"
					:enter-from-class="`${transitionClass} opacity-95`"
					enter-to-class="translate-x-0 translate-y-0 opacity-100"
					leave-active-class="transition"
					leave-from-class="translate-x-0 translate-y-0 opacity-100"
					:leave-to-class="`${transitionClass} opacity-95`"
				>
					<aside
						ref="panelRef"
						:style="panelStyle"
						:class="
							cn(
								'fixed flex flex-col overflow-hidden border bg-background shadow-2xl',
								positionClass,
								$attrs.class,
							)
						"
						role="dialog"
						aria-modal="true"
						@mousedown.stop
						@touchstart.passive="handleTouchStart"
						@touchmove="handleTouchMove"
						@touchend="handleTouchEnd"
						@touchcancel="handleTouchEnd"
					>
						<div
							v-if="position === 'bottom'"
							class="flex h-7 shrink-0 touch-none items-center justify-center"
							aria-hidden="true"
						>
							<div class="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
						</div>
						<DrawerHeader
							v-if="title"
							:title="title"
							:close="closeDrawer"
							class="border-b"
						/>
						<div class="flex-1 overflow-auto">
							<slot />
						</div>
					</aside>
				</Transition>
			</div>
		</Transition>
	</Teleport>
</template>
