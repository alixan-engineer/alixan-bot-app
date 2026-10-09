<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface PhoneInputProps {
	countryCode?: string;
	mask?: string;
	placeholder?: string;
	autofocus?: boolean;
}

const props = withDefaults(defineProps<PhoneInputProps>(), {
	countryCode: '+7',
	mask: '### ### ## ##',
	placeholder: '777 777 77 77',
	autofocus: false,
});

const model = defineModel<string | number | null>({ default: '' });
const inputValue = ref('');
const isFocused = ref(false);

const normalizedCountryCode = computed(() => props.countryCode.trim() || '+7');
const countryCodeDigits = computed(() =>
	normalizedCountryCode.value.replace(/\D/g, ''),
);
const maxDigits = computed(() => (props.mask.match(/#/g) ?? []).length);
const hasValue = computed(() => inputValue.value.length > 0);
const showPrefix = computed(() => isFocused.value || hasValue.value);
const visiblePlaceholder = computed(() =>
	showPrefix.value
		? undefined
		: `${normalizedCountryCode.value} ${props.placeholder}`,
);
const inputStyle = computed(() => {
	const offset = normalizedCountryCode.value.length + 2;

	return showPrefix.value ? { paddingLeft: `${offset}ch` } : undefined;
});

const applyMask = (value: string): string => {
	const digits = value.replace(/\D/g, '');
	let digitIndex = 0;

	return props.mask
		.split('')
		.map(symbol => {
			if (symbol !== '#') {
				return symbol;
			}

			const digit = digits[digitIndex];
			digitIndex += 1;

			return digit ?? '';
		})
		.join('')
		.replace(/[\s()-]+$/g, '');
};

const getNationalDigits = (value: string): string => {
	const trimmedValue = value.trim();
	const digits = value.replace(/\D/g, '');
	const hasExplicitCountryCode =
		normalizedCountryCode.value.length > 0 &&
		trimmedValue.startsWith(normalizedCountryCode.value);
	const hasOverflowCountryCode =
		maxDigits.value > 0 &&
		digits.length > maxDigits.value &&
		countryCodeDigits.value.length > 0 &&
		digits.startsWith(countryCodeDigits.value);

	if (hasExplicitCountryCode || hasOverflowCountryCode) {
		const nextDigits = digits.slice(countryCodeDigits.value.length);

		return maxDigits.value > 0
			? nextDigits.slice(0, maxDigits.value)
			: nextDigits;
	}

	return maxDigits.value > 0 ? digits.slice(0, maxDigits.value) : digits;
};

const handleFocus = (): void => {
	isFocused.value = true;
};

const handleBlur = (): void => {
	isFocused.value = false;
};

watch(
	() => model.value,
	value => {
		const nextValue = applyMask(getNationalDigits(String(value ?? '')));

		if (nextValue !== inputValue.value) {
			inputValue.value = nextValue;
		}
	},
	{ immediate: true },
);

watch([inputValue, normalizedCountryCode], () => {
	const nextValue = getNationalDigits(inputValue.value);
	const nextInputValue = applyMask(nextValue);

	if (nextInputValue !== inputValue.value) {
		inputValue.value = nextInputValue;
	}

	if (nextValue !== String(model.value ?? '')) {
		model.value = nextValue;
	}
});
</script>

<template>
	<Input
		v-model="inputValue"
		type="tel"
		:placeholder="visiblePlaceholder"
		:autofocus="autofocus"
		:style="inputStyle"
		autocomplete="off"
		@focus="handleFocus"
		@blur="handleBlur"
	>
		<template v-if="showPrefix" #leading>
			<span class="text-base font-medium text-foreground">
				{{ normalizedCountryCode }}
			</span>
		</template>
	</Input>
</template>
