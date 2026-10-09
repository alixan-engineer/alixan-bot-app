<script setup lang="ts">
import { Info } from '@lucide/vue';
import type { Component } from 'vue';

type DialogButtonColor = 'default' | 'primary' | 'secondary' | 'destructive';
type DialogMediaComponent = Component | string;
type DialogMediaProps = Record<string, unknown>;

interface AlertDialogData {
	title?: string;
	description?: string;
	buttonLabel?: string;
	buttonColor?: DialogButtonColor;
	mediaComponent?: DialogMediaComponent;
	mediaProps?: DialogMediaProps;
	onAction?: () => void;
}

const props = defineProps<{
	data?: AlertDialogData;
	close: () => void;
}>();

const handleAction = (): void => {
	props.data?.onAction?.();
	props.close();
};
</script>

<template>
	<div
		class="size-full p-5 flex flex-col items-center justify-between text-center"
	>
		<div
			class="flex size-22 items-center justify-center overflow-hidden rounded-3xl bg-secondary text-primary"
		>
			<slot name="illustration">
				<component
					:is="data?.mediaComponent"
					v-if="data?.mediaComponent"
					v-bind="data?.mediaProps"
				/>
				<Info v-else class="size-9" />
			</slot>
		</div>

		<div class="space-y-2">
			<h1 class="text-xl font-semibold">{{ $t(data?.title ?? '') }}</h1>
			<p
				v-if="data?.description"
				class="text-base leading-6 text-muted-foreground"
			>
				{{ $t(data.description) }}
			</p>
		</div>

		<Button
			class="w-full"
			:color="data?.buttonColor ?? 'primary'"
			size="sm"
			@click="handleAction"
		>
			{{ $t(data?.buttonLabel ?? 'actions.ok') }}
		</Button>
	</div>
</template>
