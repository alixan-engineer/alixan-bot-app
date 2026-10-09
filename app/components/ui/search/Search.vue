<script setup lang="ts">
import { Search as SearchIcon, X as XIcon } from '@lucide/vue';
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	useAttrs,
	watch,
} from 'vue';

import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

interface SearchProps {
	placeholder?: string;
	debounce?: number;
	autofocus?: boolean;
	readonly?: boolean;
}

const props = withDefaults(defineProps<SearchProps>(), {
	placeholder: 'Search',
	debounce: 300,
	autofocus: false,
	readonly: false,
});

const emit = defineEmits<{
	search: [value: string];
	clear: [];
}>();

const model = defineModel<string>({ default: '' });

const attrs = useAttrs();
const inputRef = ref<HTMLInputElement | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let shouldSkipNextSearch = false;

const rootClass = computed(() =>
	cn(
		'relative min-h-11 w-full overflow-hidden rounded-xl border bg-input/30 hover:border-foreground/20',
		props.readonly ? 'bg-secondary/60' : '',
		attrs.class,
	),
);

const inputAttrs = computed(() => {
	const { class: _class, ...rest } = attrs;
	return rest;
});

const hasValue = computed(() => model.value.trim().length > 0);
const debounceDelay = computed(() => Math.max(0, props.debounce));

const clearDebounce = (): void => {
	if (!debounceTimer) return;
	clearTimeout(debounceTimer);
	debounceTimer = undefined;
};

const emitSearch = (value: string): void => {
	emit('search', value.trim());
};

const scheduleSearch = (value: string): void => {
	clearDebounce();
	debounceTimer = setTimeout(() => {
		emitSearch(value);
		debounceTimer = undefined;
	}, debounceDelay.value);
};

const clearSearch = async () => {
	shouldSkipNextSearch = true;
	model.value = '';
	clearDebounce();
	emitSearch('');
	emit('clear');
	await nextTick();
	inputRef.value?.focus();
};

const focusInput = async () => {
	if (!props.autofocus) return;
	await nextTick();
	inputRef.value?.focus();
};

watch(model, value => {
	if (shouldSkipNextSearch) {
		shouldSkipNextSearch = false;
		return;
	}
	scheduleSearch(value);
});

onMounted(() => {
	focusInput();
});

onBeforeUnmount(() => clearDebounce());
</script>

<template>
	<div :class="rootClass">
		<SearchIcon
			class="pointer-events-none absolute left-2.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
		/>

		<input
			ref="inputRef"
			v-bind="inputAttrs"
			v-model="model"
			type="text"
			:placeholder="placeholder"
			:autofocus="autofocus"
			:readonly="readonly"
			class="size-full bg-transparent px-10 text-base font-normal text-foreground outline-none placeholder:text-muted-foreground"
		/>

		<button
			v-if="hasValue"
			type="button"
			class="absolute right-0.5 top-1/2 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground focus-visible:outline-none"
			@click="clearSearch"
		>
			<XIcon class="size-5" aria-hidden="true" />
		</button>
	</div>
</template>
