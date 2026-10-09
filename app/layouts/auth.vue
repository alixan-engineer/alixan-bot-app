<script setup lang="ts">
import { Check, Languages, Monitor, Moon, Sun } from '@lucide/vue';

const colorMode = useColorMode();
const { locale, setLocale } = useI18n();
const themeMenuOpen = ref(false);
const languageMenuOpen = ref(false);

const themes = [
	{ value: 'system', label: 'user.themes.system', icon: Monitor },
	{ value: 'light', label: 'user.themes.light', icon: Sun },
	{ value: 'dark', label: 'user.themes.dark', icon: Moon },
] as const;

const languages = [
	{ value: 'ru', label: 'user.languages.ru' },
	{ value: 'kk', label: 'user.languages.kk' },
	{ value: 'en', label: 'user.languages.en' },
] as const;

type Theme = (typeof themes)[number]['value'];
type Locale = (typeof languages)[number]['value'];

const themeIcon = computed(() => (colorMode.value === 'dark' ? Moon : Sun));

const selectTheme = (theme: Theme): void => {
	colorMode.preference = theme;
	themeMenuOpen.value = false;
};

const selectLanguage = async (language: Locale): Promise<void> => {
	languageMenuOpen.value = false;
	await setLocale(language);
};
</script>

<template>
	<div class="size-full flex flex-col">
		<div
			class="w-full h-16 px-4 max-w-container mx-auto flex items-center gap-4"
		>
			<Logo />
			<div class="flex-1" />

			<DropdownMenu
				v-model:open="themeMenuOpen"
				width="200px"
				position="bottomRight"
			>
				<template #trigger>
					<IconButton
						variant="outlined"
						:tooltip="$t('user.theme')"
						:aria-label="$t('user.theme')"
					>
						<component :is="themeIcon" />
					</IconButton>
				</template>

				<button
					v-for="theme in themes"
					:key="theme.value"
					type="button"
					class="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-base hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
					@click="selectTheme(theme.value)"
				>
					<component :is="theme.icon" class="size-5" />
					<span class="flex-1">{{ $t(theme.label) }}</span>
					<Check v-if="colorMode.preference === theme.value" class="size-4" />
				</button>
			</DropdownMenu>

			<DropdownMenu
				v-model:open="languageMenuOpen"
				width="200px"
				position="bottomRight"
			>
				<template #trigger>
					<IconButton
						variant="outlined"
						:tooltip="$t('user.language')"
						:aria-label="$t('user.language')"
					>
						<Languages />
					</IconButton>
				</template>

				<button
					v-for="language in languages"
					:key="language.value"
					type="button"
					class="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-base hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
					@click="selectLanguage(language.value)"
				>
					<span class="flex-1">{{ $t(language.label) }}</span>
					<Check v-if="locale === language.value" class="size-4" />
				</button>
			</DropdownMenu>
		</div>

		<hr />

		<div class="flex-1 p-4 flex items-center justify-center">
			<Island class="w-full max-w-120" content-class="flex flex-col gap-5 p-4 sm:gap-10 sm:p-10">
				<NuxtPage />
			</Island>
		</div>
	</div>
</template>
