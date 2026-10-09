<script setup lang="ts">
import { computed, watch } from 'vue';
import {
	isTopDialog,
	registerOpenDialog,
	unregisterOpenDialog,
} from '~/composables/useDialog';
import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

interface DialogProps {
	width?: string;
	height?: string;
	title?: string;
	closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<DialogProps>(), {
	width: '500px',
	height: '500px',
	title: '',
	closeOnOverlay: true,
});

const emit = defineEmits<{
	close: [];
}>();

const open = defineModel<boolean>({ default: false });
const dialogToken = Symbol('dialog');

const dialogStyle = computed(() => {
	const isAutoHeight = props.height === 'auto';

	return {
		width: '100%',
		height: isAutoHeight ? 'auto' : '100%',
		maxWidth: props.width,
		maxHeight: isAutoHeight ? 'calc(100dvh - 2rem)' : props.height,
	};
});

const closeDialog = (): void => {
	open.value = false;
	emit('close');
};

const handleOverlayMouseDown = (): void => {
	if (props.closeOnOverlay) {
		closeDialog();
	}
};

const handleKeydown = (event: KeyboardEvent): void => {
	if (event.key === 'Escape' && open.value && isTopDialog(dialogToken)) {
		closeDialog();
	}
};

const lockBodyScroll = (): void => {
	registerOpenDialog(dialogToken);
};

const unlockBodyScroll = (): void => {
	unregisterOpenDialog(dialogToken);
};

watch(
	open,
	(value, oldValue) => {
		if (!import.meta.client) {
			return;
		}

		if (value && !oldValue) {
			document.addEventListener('keydown', handleKeydown);
			lockBodyScroll();
			return;
		}

		if (!value && oldValue) {
			document.removeEventListener('keydown', handleKeydown);
			unlockBodyScroll();
		}
	},
	{ immediate: true },
);

onBeforeUnmount(() => {
	if (!import.meta.client) {
		return;
	}

	document.removeEventListener('keydown', handleKeydown);

	if (open.value) {
		unlockBodyScroll();
	}
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
				class="backdrop z-9998 p-4 flex items-center justify-center"
				@mousedown.stop="handleOverlayMouseDown"
				@click.stop
			>
				<Transition
					appear
					enter-active-class="transition"
					enter-from-class="scale-95 opacity-0"
					enter-to-class="scale-100 opacity-100"
					leave-active-class="transition"
					leave-from-class="scale-100 opacity-100"
					leave-to-class="scale-95 opacity-0"
				>
					<div
						role="dialog"
						aria-modal="true"
						:style="dialogStyle"
						:class="
							cn(
								'w-full min-h-0 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl',
								$attrs.class,
							)
						"
						@mousedown.stop
					>
						<DialogHeader
							v-if="title"
							:title="title"
							:close="closeDialog"
							class="shrink-0 border-b"
						/>
						<div class="min-h-0 flex-1 overflow-hidden">
							<slot />
						</div>
					</div>
				</Transition>
			</div>
		</Transition>
	</Teleport>
</template>
