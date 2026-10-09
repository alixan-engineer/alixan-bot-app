import { computed, reactive, ref } from 'vue';

export type XControlErrors = Record<string, string>;

export interface XControl<T = string | number | null> {
	value: T;
	errors: XControlErrors;
	readonly valid: boolean;
	readonly invalid: boolean;
	readonly touched: boolean;
	readonly untouched: boolean;
	readonly dirty: boolean;
	readonly pristine: boolean;
	readonly disabled: boolean;
	readonly enabled: boolean;
	setValue(value: T, options?: { markAsDirty?: boolean }): void;
	setErrors(errors: XControlErrors): void;
	hasError(error: string): boolean;
	markAsTouched(): void;
	markAsUntouched(): void;
	markAsDirty(): void;
	markAsPristine(): void;
	disable(): void;
	enable(): void;
	reset(value?: T): void;
	validate(): boolean;
	setValidator(validator?: () => boolean): void;
}

export const useXControl = <T = string | number | null>(
	initialValue: T,
): XControl<T> => {
	const initial = ref(initialValue) as { value: T };
	const value = ref(initialValue) as { value: T };
	const errors = ref<XControlErrors>({});
	const touched = ref(false);
	const dirty = ref(false);
	const disabled = ref(false);
	let validator: (() => boolean) | undefined;

	return reactive({
		value,
		errors,
		valid: computed(() => Object.keys(errors.value).length === 0),
		invalid: computed(() => Object.keys(errors.value).length > 0),
		touched,
		untouched: computed(() => !touched.value),
		dirty,
		pristine: computed(() => !dirty.value),
		disabled,
		enabled: computed(() => !disabled.value),
		setValue(nextValue: T, options = {}) {
			value.value = nextValue;
			if (options.markAsDirty) dirty.value = true;
		},
		setErrors(nextErrors: XControlErrors) {
			errors.value = nextErrors;
		},
		hasError(error: string) {
			return Boolean(errors.value[error]);
		},
		markAsTouched() {
			touched.value = true;
		},
		markAsUntouched() {
			touched.value = false;
		},
		markAsDirty() {
			dirty.value = true;
		},
		markAsPristine() {
			dirty.value = false;
		},
		disable() {
			disabled.value = true;
		},
		enable() {
			disabled.value = false;
		},
		reset(nextValue: T = initial.value) {
			initial.value = nextValue;
			value.value = nextValue;
			errors.value = {};
			touched.value = false;
			dirty.value = false;
			validator?.();
		},
		validate() {
			touched.value = true;
			return validator?.() ?? Object.keys(errors.value).length === 0;
		},
		setValidator(nextValidator?: () => boolean) {
			validator = nextValidator;
		},
	}) as XControl<T>;
};
