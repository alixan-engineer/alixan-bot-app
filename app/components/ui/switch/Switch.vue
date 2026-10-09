<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue';

import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

interface SwitchProps {
	label?: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<SwitchProps>(), {
	label: undefined,
	disabled: false,
});

const model = defineModel<boolean>({ default: false });
const attrs = useAttrs();
const generatedId = useId();

const switchId = computed(() => generatedId);

const switchClass = computed(() =>
	cn(
		'peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input px-0.5',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		model.value ? 'bg-primary' : 'bg-input',
		props.disabled ? 'cursor-not-allowed opacity-50' : '',
		attrs.class,
	),
);

const labelClass = computed(() =>
	cn(
		'text-base select-none',
		props.disabled
			? 'cursor-not-allowed text-muted-foreground'
			: 'cursor-pointer text-foreground',
	),
);

const toggleSwitch = (): void => {
	if (props.disabled) {
		return;
	}

	model.value = !model.value;
};
</script>

<template>
	<div v-if="label" class="inline-flex w-fit items-center gap-2">
		<button
			:id="switchId"
			v-bind="{ ...attrs, class: undefined }"
			type="button"
			role="switch"
			:aria-checked="model"
			:disabled="disabled"
			:class="switchClass"
			@click="toggleSwitch"
		>
			<span
				:class="
					cn(
						'pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200',
						model ? 'translate-x-4' : 'translate-x-0',
					)
				"
			/>
		</button>

		<label :for="switchId" :class="labelClass">
			{{ label }}
		</label>
	</div>

	<button
		v-else
		:id="switchId"
		v-bind="{ ...attrs, class: undefined }"
		type="button"
		role="switch"
		:aria-checked="model"
		:disabled="disabled"
		:class="switchClass"
		@click="toggleSwitch"
	>
		<span
			:class="
				cn(
					'pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200',
					model ? 'translate-x-4' : 'translate-x-0',
				)
			"
		/>
	</button>
</template>
