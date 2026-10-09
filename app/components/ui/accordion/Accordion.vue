<script setup lang="ts">
import { ChevronDown } from '@lucide/vue';
import { cn } from '~/utils/cn';

type AccordionValue = string | number;

interface AccordionItem {
	value: AccordionValue;
	title: string;
	content?: string;
	disabled?: boolean;
}

interface AccordionProps {
	items?: AccordionItem[];
	multiple?: boolean;
	collapsible?: boolean;
}

const props = withDefaults(defineProps<AccordionProps>(), {
	items: () => [],
	multiple: false,
	collapsible: true,
});

const model = defineModel<AccordionValue | AccordionValue[] | null>({
	default: null,
});

const emit = defineEmits<{
	change: [value: AccordionValue | AccordionValue[] | null];
}>();

const isOpen = (value: AccordionValue): boolean => {
	if (props.multiple) {
		return Array.isArray(model.value) && model.value.includes(value);
	}
	return model.value === value;
};

const setValue = (value: AccordionValue | AccordionValue[] | null): void => {
	model.value = value;
	emit('change', value);
};

const toggleItem = (item: AccordionItem): void => {
	if (item.disabled) return;
	if (props.multiple) {
		const currentValue = Array.isArray(model.value) ? model.value : [];
		const nextValue = currentValue.includes(item.value)
			? currentValue.filter(value => value !== item.value)
			: [...currentValue, item.value];
		setValue(nextValue);
		return;
	}
	if (isOpen(item.value)) {
		setValue(props.collapsible ? null : item.value);
	} else {
		setValue(item.value);
	}
};
</script>

<template>
	<div class="w-full divide-y rounded-2xl border">
		<div v-for="item in items" :key="item.value">
			<button
				type="button"
				:disabled="item.disabled"
				:class="
					cn(
						'min-h-12 w-full flex items-center justify-between gap-4 px-4 py-3 text-left text-md font-medium hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none disabled:pointer-events-none disabled:text-muted-foreground',
						isOpen(item.value) ? 'text-foreground' : 'text-foreground',
					)
				"
				@click="toggleItem(item)"
			>
				<span class="flex-1">
					<slot name="title" :item="item" :open="isOpen(item.value)">
						{{ $t(item.title) }}
					</slot>
				</span>
				<ChevronDown
					:class="
						cn(
							'size-5 shrink-0 text-muted-foreground ',
							isOpen(item.value) ? 'rotate-180' : '',
						)
					"
				/>
			</button>

			<div v-if="isOpen(item.value)">
				<div class="px-4 pb-4 text-sm leading-7 text-muted-foreground">
					<slot name="content" :item="item">
						{{ item.content ? $t(item.content) : '' }}
					</slot>
				</div>
			</div>
		</div>
	</div>
</template>
