<script setup lang="ts">
import { CircleCheck, CircleX, Info, TriangleAlert, X } from '@lucide/vue';
import type { Component } from 'vue';

import type { ToastMessage, ToastType } from '~/composables/useToast';
import { cn } from '~/utils/cn';

interface ToastProps {
	toast: ToastMessage;
}

defineProps<ToastProps>();

const emit = defineEmits<{
	close: [];
}>();

const icons: Record<ToastType, Component> = {
	success: CircleCheck,
	warning: TriangleAlert,
	error: CircleX,
	info: Info,
};

const toastClasses: Record<ToastType, string> = {
	success:
		'border-emerald-700 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-700',
	warning:
		'border-amber-500 bg-amber-400 text-amber-950 dark:border-amber-300 dark:bg-amber-500',
	error:
		'border-red-700 bg-red-600 text-white dark:border-red-500 dark:bg-red-700',
	info: 'border-blue-700 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-700',
};

const iconClasses: Record<ToastType, string> = {
	success: 'bg-black/10 text-white dark:bg-white/20',
	warning: 'bg-black/10 text-amber-950 dark:bg-white/20',
	error: 'bg-black/10 text-white dark:bg-white/20',
	info: 'bg-black/10 text-white dark:bg-white/20',
};
</script>

<template>
	<div
		:class="
			cn(
				'flex w-full items-center gap-4 rounded-2xl border px-4 py-3 shadow-2xl shadow-black/15',
				toastClasses[toast.type],
			)
		"
	>
		<div
			:class="
				cn(
					'size-9 shrink-0 rounded-full flex items-center justify-center [&_svg]:size-5',
					iconClasses[toast.type],
				)
			"
		>
			<component :is="icons[toast.type]" />
		</div>

		<p class="flex-1 text-base font-medium leading-6">
			{{ $t(toast.message) }}
		</p>

		<button
			type="button"
			:aria-label="$t('toast.close')"
			class="flex size-9 shrink-0 items-center justify-center rounded-lg text-current hover:bg-black/10 focus-visible:bg-black/10 focus-visible:outline-none dark:hover:bg-white/15 dark:focus-visible:bg-white/15 [&_svg]:size-4"
			@click="emit('close')"
		>
			<X />
		</button>
	</div>
</template>
