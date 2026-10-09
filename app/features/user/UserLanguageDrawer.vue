<script setup lang="ts">
import { Check } from '@lucide/vue';

const props = defineProps<{ close: () => void }>();

const { locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const languages = [
	{ value: 'ru', label: 'user.languages.ru' },
	{ value: 'en', label: 'user.languages.en' },
	{ value: 'kk', label: 'user.languages.kk' },
] as const;
type Locale = (typeof languages)[number]['value'];

const selectLanguage = async (value: Locale): Promise<void> => {
	await navigateTo(switchLocalePath(value));
	props.close();
};
</script>

<template>
	<List divider="inset">
		<ListTile
			v-for="language in languages"
			:key="language.value"
			:title="language.label"
			@click="selectLanguage(language.value)"
		>
			<template #leading>
				<Check :class="cn(locale !== language.value && 'invisible')" />
			</template>
		</ListTile>
	</List>
</template>
