<script setup lang="ts">
import { Check, ChevronDown } from '@lucide/vue';
import { computed, nextTick, ref, useId } from 'vue';

import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

type SelectValue = string | number;

interface SelectOption {
	label: string;
	value: SelectValue;
	disabled?: boolean;
}

interface SelectProps {
	label?: string;
	placeholder?: string;
	options?: SelectOption[];
	disabled?: boolean;
	teleport?: boolean;
	required?: boolean;
	error?: string;
}

const props = withDefaults(defineProps<SelectProps>(), {
	label: '',
	placeholder: 'Select option',
	options: () => [],
	disabled: false,
	teleport: true,
	required: false,
	error: '',
});

const emit = defineEmits<{
	change: [option: SelectOption];
	'update:open': [value: boolean];
}>();

const model = defineModel<SelectValue | null>({ default: null });

const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const open = ref(false);
const isTouched = ref(false);
const menuStyle = ref<Record<string, string>>({});
const generatedId = useId();

const selectedOption = computed(
	() => props.options.find(option => option.value === model.value) ?? null,
);

const hasSelectedValue = computed(() => selectedOption.value !== null);
const isFocused = computed(() => open.value || hasSelectedValue.value);

const selectedLabel = computed(
	() => selectedOption.value?.label ?? props.placeholder,
);
const messageId = computed(() => `${generatedId}-message`);
const validationError = computed(() => {
	if (props.required && !hasSelectedValue.value) {
		return 'validation.required';
	}

	return '';
});
const errorMessage = computed(() => props.error || validationError.value);
const visibleError = computed(() =>
	isTouched.value && errorMessage.value ? errorMessage.value : '',
);

const updateMenuPosition = () => {
	const trigger = triggerRef.value;

	if (!trigger || !import.meta.client) return;

	const rect = trigger.getBoundingClientRect();
	const width = rect.width;
	const offset = 4;

	if (!props.teleport) {
		menuStyle.value = {
			top: `calc(100% + ${offset}px)`,
			left: '0',
			minWidth: '100%',
			maxWidth: '100%',
		};
		return;
	}

	menuStyle.value = {
		top: `${rect.bottom + offset}px`,
		left: `${rect.left}px`,
		minWidth: `${width}px`,
		maxWidth: `${Math.min(width, window.innerWidth - 16)}px`,
	};
};

const updateOpenMenuPosition = (): void => {
	if (!open.value) {
		return;
	}

	updateMenuPosition();
};

const openSelect = async (): Promise<void> => {
	if (props.disabled) return;
	open.value = true;
	emit('update:open', true);
	await nextTick();
	updateMenuPosition();
	window.addEventListener('resize', updateOpenMenuPosition);
	window.addEventListener('scroll', updateOpenMenuPosition, true);
	document.addEventListener('mousedown', closeSelectOnOutside, true);
};

const closeSelect = () => {
	if (!open.value) return;

	isTouched.value = true;
	open.value = false;
	emit('update:open', false);
	window.removeEventListener('resize', updateOpenMenuPosition);
	window.removeEventListener('scroll', updateOpenMenuPosition, true);
	document.removeEventListener('mousedown', closeSelectOnOutside, true);
};

const closeSelectOnOutside = (event: MouseEvent) => {
	const target = event.target;
	if (!(target instanceof Node)) return;
	if (triggerRef.value?.contains(target) || menuRef.value?.contains(target))
		return;
	closeSelect();
};

const toggleSelect = () => (open.value ? closeSelect() : openSelect());

const selectOption = (option: SelectOption) => {
	if (option.disabled) return;
	isTouched.value = true;
	model.value = option.value;
	emit('change', option);
	closeSelect();
};

defineExpose({
	close: closeSelect,
});

onBeforeUnmount(closeSelect);
</script>

<template>
	<div
		:class="
			cn(
				'relative w-full',
				label ? 'min-h-20' : '',
				visibleError ? 'space-y-1' : '',
				$attrs.class,
			)
		"
	>
		<label
			v-if="label"
			:class="
				cn(
					'pointer-events-none absolute left-3 z-10 px-1 text-base font-normal transition-all duration-200 text-muted-foreground',
					isFocused ? 'top-1.5 text-xs' : 'top-4',
					disabled ? 'text-muted-foreground/50' : '',
					visibleError ? 'text-destructive!' : '',
				)
			"
		>
			{{ $t(label) }}
		</label>

		<button
			ref="triggerRef"
			type="button"
			:disabled="disabled"
			:aria-invalid="visibleError ? true : undefined"
			:aria-describedby="visibleError ? messageId : undefined"
			:class="
				cn(
					'flex w-full items-center justify-between gap-2 border px-4 text-left hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
					label ? 'h-14 rounded-2xl pt-2' : 'h-11 rounded-xl',
					visibleError
						? 'border-destructive text-destructive hover:border-destructive focus-visible:border-destructive'
						: open
							? 'border-primary'
							: 'border-border',
				)
			"
			@click="toggleSelect"
		>
			<span
				:class="
					cn(
						'truncate text-base',
						label && !hasSelectedValue ? 'text-transparent' : '',
						!hasSelectedValue && !label ? 'text-muted-foreground' : '',
					)
				"
			>
				{{ $t(selectedLabel) }}
			</span>
			<ChevronDown
				:class="
					cn(
						'size-5 text-muted-foreground transition-transform',
						open ? 'rotate-180' : '',
						label && 'mb-1.5',
						visibleError ? 'text-destructive!' : '',
					)
				"
			/>
		</button>

		<Transition name="select-message" mode="out-in">
			<p
				v-if="visibleError"
				:id="messageId"
				:key="visibleError"
				class="px-3 text-sm font-medium text-destructive"
			>
				{{ $t(visibleError) }}
			</p>
		</Transition>

		<Teleport to="body" :disabled="!teleport">
			<div
				v-if="open && teleport"
				class="fixed inset-0 z-10000"
				@pointerdown.prevent.stop="closeSelect"
				@click.prevent.stop
			/>
			<div
				v-if="open"
				ref="menuRef"
				:class="
					cn(
						'max-h-72 overflow-auto rounded-lg border bg-popover p-1 shadow-md',
						teleport ? 'fixed z-10001' : 'absolute z-9999',
					)
				"
				:style="menuStyle"
				@pointerdown.stop
			>
				<button
					v-for="option in options"
					:key="option.value"
					type="button"
					:disabled="option.disabled"
					:class="
						cn(
							'min-h-9 w-full flex items-center gap-3 rounded-md px-3 text-left text-md hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
							model === option.value ? 'bg-secondary' : '',
						)
					"
					@click="selectOption(option)"
				>
					<span class="min-w-0 flex-1 truncate">{{ $t(option.label) }}</span>
					<Check v-if="model === option.value" class="size-4" />
				</button>
			</div>
		</Teleport>
	</div>
</template>

<style scoped lang="scss">
.select-message-enter-active,
.select-message-leave-active {
	transition:
		opacity 160ms ease,
		transform 160ms ease,
		max-height 180ms ease;
}

.select-message-enter-from,
.select-message-leave-to {
	max-height: 0;
	opacity: 0;
	transform: translateY(-4px);
}

.select-message-enter-to,
.select-message-leave-from {
	max-height: 32px;
	opacity: 1;
	transform: translateY(0);
}
</style>
