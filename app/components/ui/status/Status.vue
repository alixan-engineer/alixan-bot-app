<script setup lang="ts">
export type StatusType = 'success' | 'warning' | 'error';

const props = defineProps<{
	text?: string;
	status: StatusType;
}>();

const statusClasses: Record<StatusType, string> = {
	success:
		'text-emerald-700 bg-emerald-500/15 border-emerald-500/30 dark:text-emerald-300 dark:bg-emerald-400/20 dark:border-emerald-400/35',
	warning:
		'text-amber-700 bg-amber-500/20 border-amber-500/35 dark:text-amber-300 dark:bg-amber-400/20 dark:border-amber-400/35',
	error:
		'text-red-700 bg-red-500/15 border-red-500/30 dark:text-red-300 dark:bg-red-400/35 dark:border-red-400/35',
};

const statusClass = computed(() => statusClasses[props.status]);
</script>

<template>
	<div
		:class="[
			'size-fit min-h-7 px-3 py-1 flex items-center justify-center rounded-full border',
			statusClass,
		]"
	>
		<p class="text-sm font-semibold leading-none">{{ text }}</p>
	</div>
</template>
