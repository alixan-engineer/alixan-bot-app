<script setup lang="ts">
type Step = {
	label: string;
};

defineProps<{
	steps: Step[];
	currentStep: number;
}>();
</script>

<template>
	<ol class="flex w-full items-start" aria-label="Прогресс формы">
		<template v-for="(step, index) in steps" :key="step.label">
			<li class="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
				<div
					:class="[
						'flex size-9 items-center justify-center rounded-full border-2 bg-background text-base transition-colors',
						index + 1 <= currentStep
							? 'border-foreground text-foreground'
							: 'border-border text-muted-foreground',
					]"
					:aria-current="index + 1 === currentStep ? 'step' : undefined"
				>
					{{ index + 1 }}
				</div>

				<span
					:class="[
						'max-w-28 text-xs font-semibold sm:text-base',
						index + 1 === currentStep
							? 'text-foreground'
							: 'text-muted-foreground',
					]"
				>
					{{ step.label }}
				</span>
			</li>

			<li
				v-if="index < steps.length - 1"
				aria-hidden="true"
				class="mt-4 h-0.5 min-w-8 flex-1 bg-border sm:mt-6 sm:min-w-16"
			/>
		</template>
	</ol>
</template>
