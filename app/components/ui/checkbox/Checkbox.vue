<script setup lang="ts">
import { Check } from '@lucide/vue';
import { computed, useAttrs, useId } from 'vue';
import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

type CheckboxMode = 'single' | 'multiple';
type CheckboxValue = string | number;
type CheckboxModel = boolean | CheckboxValue | CheckboxValue[] | null;

interface CheckboxProps {
	label?: string;
	value?: CheckboxValue;
	mode?: CheckboxMode;
	disabled?: boolean;
}

const props = withDefaults(defineProps<CheckboxProps>(), {
	label: undefined,
	value: undefined,
	mode: 'single',
	disabled: false,
});

const model = defineModel<CheckboxModel>({ default: false });
const attrs = useAttrs();
const generatedId = useId();

const checkboxId = computed(() => generatedId);

const checked = computed(() => {
	if (props.mode === 'multiple') {
		return (
			Array.isArray(model.value) && model.value.includes(props.value ?? '')
		);
	}
	if (props.value !== undefined && typeof model.value !== 'boolean') {
		return model.value === props.value;
	}
	return Boolean(model.value);
});

const toggleCheckbox = (): void => {
	if (props.disabled) return;
	if (props.mode === 'multiple') {
		const value = props.value;
		if (value === undefined) return;
		const currentValue = Array.isArray(model.value) ? model.value : [];
		model.value = checked.value
			? currentValue.filter(item => item !== value)
			: [...currentValue, value];
		return;
	}
	if (props.value !== undefined && typeof model.value !== 'boolean') {
		model.value = checked.value ? null : props.value;
		return;
	}
	model.value = !checked.value;
};

const toggleFromControl = (event: MouseEvent): void => {
	event.stopPropagation();
	toggleCheckbox();
};
</script>

<template>
	<div
		:class="
			cn(
				'inline-flex w-fit items-center gap-2',
				disabled ? 'cursor-not-allowed' : 'cursor-pointer',
			)
		"
		@click="toggleCheckbox"
	>
		<button
			:id="checkboxId"
			v-bind="{ ...attrs, class: undefined }"
			type="button"
			role="checkbox"
			:aria-checked="checked"
			:disabled="disabled"
			:class="
				cn(
					'flex size-6 shrink-0 items-center justify-center rounded-full border p-0.5 transition-colors',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
					checked
						? 'border-primary bg-primary text-primary-foreground'
						: 'border-input',
					disabled
						? 'cursor-not-allowed opacity-50'
						: 'cursor-pointer hover:border-primary/60',
					attrs.class,
				)
			"
			@click="toggleFromControl"
		>
			<Check v-if="checked" class="size-3.5 stroke-3" />
		</button>

		<span
			v-if="label"
			:class="
				cn(
					'text-base leading-none',
					disabled
						? 'cursor-not-allowed text-muted-foreground'
						: 'cursor-pointer text-foreground',
				)
			"
		>
			{{ label }}
		</span>
	</div>
</template>
