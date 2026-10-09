<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, watch } from 'vue';

import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

type DropdownPosition = 'topRight' | 'bottomRight' | 'bottomLeft' | 'topLeft';

interface DropdownMenuProps {
	width?: string;
	height?: string;
	position?: DropdownPosition;
}

const props = withDefaults(defineProps<DropdownMenuProps>(), {
	width: '320px',
	height: 'auto',
	position: 'bottomLeft',
});

const open = defineModel<boolean>('open', { default: false });
const attrs = useAttrs();
const triggerRef = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const popoverStyle = ref<Record<string, string>>({});

const rootClass = computed(() => cn('inline-flex', attrs.class));

const updatePopoverPosition = async (): Promise<void> => {
	const trigger = triggerRef.value;

	if (!trigger || !import.meta.client) {
		return;
	}

	const rect = trigger.getBoundingClientRect();
	const offset = 6;
	const preferredWidth = Number.parseFloat(props.width);
	const fallbackWidth = Number.isFinite(preferredWidth)
		? preferredWidth
		: Math.max(rect.width, 220);

	popoverStyle.value = {
		width: props.width,
		maxHeight: props.height,
		minWidth: `${Math.min(Math.max(rect.width, 160), fallbackWidth)}px`,
		visibility: 'hidden',
	};

	await nextTick();

	const popoverRect = popoverRef.value?.getBoundingClientRect();
	const width = popoverRect?.width ?? fallbackWidth;
	const height = popoverRect?.height ?? 220;
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const space = {
		top: rect.top - offset,
		right: viewportWidth - rect.right - offset,
		bottom: viewportHeight - rect.bottom - offset,
		left: rect.left - offset,
	};

	let vertical: 'top' | 'bottom' = props.position.startsWith('top')
		? 'top'
		: 'bottom';
	let horizontal: 'left' | 'right' = props.position.endsWith('Right')
		? 'right'
		: 'left';

	if (vertical === 'bottom' && space.bottom < height && space.top > space.bottom) {
		vertical = 'top';
	}

	if (vertical === 'top' && space.top < height && space.bottom > space.top) {
		vertical = 'bottom';
	}

	if (horizontal === 'left' && space.right < width && space.left > space.right) {
		horizontal = 'right';
	}

	if (horizontal === 'right' && space.left < width && space.right > space.left) {
		horizontal = 'left';
	}

	const rawTop =
		vertical === 'bottom' ? rect.bottom + offset : rect.top - height - offset;
	const rawLeft =
		horizontal === 'left' ? rect.left : rect.right - width;

	const top = Math.max(8, Math.min(rawTop, viewportHeight - height - 8));
	const left = Math.max(8, Math.min(rawLeft, viewportWidth - width - 8));

	popoverStyle.value = {
		width: props.width,
		maxHeight: props.height,
		minWidth: `${Math.min(Math.max(rect.width, 160), fallbackWidth)}px`,
		left: `${left}px`,
		top: `${top}px`,
		visibility: 'visible',
	};
};

const close = (): void => {
	open.value = false;
};

const openPopover = async (): Promise<void> => {
	open.value = true;
	await nextTick();
	await updatePopoverPosition();
};

const toggle = (): void => {
	if (open.value) {
		close();
		return;
	}

	openPopover();
};

const handleKeydown = (event: KeyboardEvent): void => {
	if (event.key === 'Escape' && open.value) {
		close();
	}
};

watch(open, async value => {
	if (!import.meta.client) {
		return;
	}

	if (value) {
		await nextTick();
		await updatePopoverPosition();
		window.addEventListener('resize', close);
		window.addEventListener('scroll', close, true);
		document.addEventListener('keydown', handleKeydown);
		return;
	}

	window.removeEventListener('resize', close);
	window.removeEventListener('scroll', close, true);
	document.removeEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
	if (!import.meta.client) {
		return;
	}

	window.removeEventListener('resize', close);
	window.removeEventListener('scroll', close, true);
	document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
	<div ref="triggerRef" :class="rootClass" @click="toggle">
		<slot name="trigger" />

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
					class="fixed inset-0 z-9998"
					@mousedown.stop="close"
					@click.stop
				/>
			</Transition>

			<Transition
				enter-active-class="transition"
				enter-from-class="scale-95 opacity-0"
				enter-to-class="scale-100 opacity-100"
				leave-active-class="transition"
				leave-from-class="scale-100 opacity-100"
				leave-to-class="scale-95 opacity-0"
			>
				<div
					v-if="open"
					ref="popoverRef"
					class="fixed z-9999 overflow-auto rounded-2xl border bg-popover p-1 shadow-2xl origin-top-left"
					:style="popoverStyle"
					@mousedown.stop
					@click.stop
				>
					<slot />
				</div>
			</Transition>
		</Teleport>
	</div>
</template>
