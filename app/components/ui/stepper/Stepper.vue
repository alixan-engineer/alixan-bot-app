<script setup lang="ts">
import { computed } from 'vue';
import { Check } from '@lucide/vue';
import { cn } from '~/utils/cn';

interface Step {
	id: string | number;
	label: string;
}

interface StepperProps {
	steps?: Step[];
	selected?: Step;
	direction?: 'horizontal' | 'vertical';
}

const props = withDefaults(defineProps<StepperProps>(), {
	steps: () => [],
	direction: 'horizontal',
});

const selectedIndex = computed(() =>
	props.steps.findIndex(step => step.id === props.selected?.id),
);
</script>

<template>
	<div
		role="list"
		:class="cn('flex justify-around', direction === 'vertical' ? 'flex-col items-start' : 'items-center')"
	>
		<template v-for="(step, index) in steps" :key="step.id">
			<div
				role="listitem"
				:aria-current="index === selectedIndex ? 'step' : undefined"
				:class="cn('flex min-w-0 flex-1 items-center gap-2 rounded-lg py-2', direction === 'horizontal' && 'flex-col')"
			>
				<div
					:class="cn(
						'flex size-8 shrink-0 items-center justify-center rounded-full',
						index === selectedIndex
							? 'border-2 border-primary text-base font-normal text-primary'
							: index < selectedIndex
								? 'bg-primary/90 text-primary-foreground'
								: 'border text-muted-foreground',
					)"
				>
					<Check v-if="index < selectedIndex" :size="18" aria-hidden="true" />
					<span v-else>{{ index + 1 }}</span>
				</div>
				<p
					:class="cn('text-center text-sm wrap-anywhere', index === selectedIndex ? 'font-semibold text-primary' : 'font-medium text-muted-foreground')"
				>
					{{ $t(step.label) }}
				</p>
			</div>
			<div
				v-if="index < steps.length - 1"
				aria-hidden="true"
				:class="cn(
					direction === 'horizontal' ? 'h-0.5 min-w-2 flex-1' : 'ml-4 h-6 w-0.5 shrink-0',
					index < selectedIndex ? 'bg-primary' : 'bg-border',
				)"
			/>
		</template>
	</div>
</template>
