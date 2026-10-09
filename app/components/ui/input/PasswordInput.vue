<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue';

interface PasswordInputProps {
	label?: string;
	autofocus?: boolean;
	min?: number;
	max?: number;
	required?: boolean;
}

withDefaults(defineProps<PasswordInputProps>(), {
	label: 'auth.password',
	autofocus: false,
	min: undefined,
	max: undefined,
	required: false,
});

const model = defineModel<string | number | null>({ default: '' });
const isVisible = ref(false);
</script>

<template>
	<Input
		v-model="model"
		:label="label"
		:type="isVisible ? 'text' : 'password'"
		:autofocus="autofocus"
		:min="min"
		:max="max"
		:required="required"
	>
		<template #trailing>
			<button
				type="button"
				class="flex size-9 items-center justify-center rounded-lg hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none [&_svg]:size-5"
				:aria-label="isVisible ? 'Hide password' : 'Show password'"
				@click="isVisible = !isVisible"
			>
				<EyeOff v-if="isVisible" />
				<Eye v-else />
			</button>
		</template>
	</Input>
</template>
