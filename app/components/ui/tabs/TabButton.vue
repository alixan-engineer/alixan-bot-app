<script setup lang="ts">
import { cn } from '~/utils/cn';

defineProps<{
	tab: string;
	count?: number;
	active: boolean;
	design: 'material' | 'cupertino';
}>();
const button = ref<HTMLButtonElement>();
defineExpose({ focus: () => button.value?.focus() });
</script>

<template>
	<button
		ref="button"
		type="button"
		role="tab"
		:aria-selected="active"
		:tabindex="active ? 0 : -1"
		:class="
			cn(
				'relative h-full w-full select-none whitespace-nowrap px-4 text-center text-md font-medium outline-none transition-colors focus-visible:bg-secondary',
				design === 'material'
					? active
						? 'font-semibold text-primary'
						: 'text-muted-foreground hover:text-foreground'
					: cn(
							'rounded-lg',
							active
								? 'bg-background font-semibold text-foreground'
								: 'text-muted-foreground hover:bg-background/40',
					  ),
			)
		"
	>
		{{ $t(tab) }}
		<span
			v-if="count !== undefined"
			class="ml-0.5 text-xs tabular-nums opacity-75"
		>
			{{ count }}
		</span>
		<span
			v-if="design === 'material' && active"
			class="absolute inset-x-3 bottom-0 mx-auto h-0.5 max-w-25 rounded-t-full bg-primary"
		/>
	</button>
</template>
