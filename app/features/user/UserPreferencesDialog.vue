<script setup lang="ts">
import { ChevronDown } from '@lucide/vue';
import UserLanguageDrawer from './UserLanguageDrawer.vue';

const props = defineProps<{ close: () => void }>();

const colorMode = useColorMode();
const { locale } = useI18n();
const drawer = useDrawer();

const appVersion = '6.0.0';

const darkMode = computed({
	get: () => colorMode.value === 'dark',
	set: enabled => {
		colorMode.preference = enabled ? 'dark' : 'light';
	},
});

const openLanguages = () => {
	props.close();
	drawer.open(UserLanguageDrawer, {
		width: '500px',
		height: '300px',
		position: 'bottom',
		title: 'user.selectLanguage',
	});
};
</script>

<template>
	<div class="size-full flex flex-col gap-6 p-6">
		<div class="overflow-hidden rounded-xl border">
			<button
				type="button"
				class="flex min-h-16 w-full items-center gap-3 px-4 text-left hover:bg-secondary/40 focus-visible:bg-secondary/40"
				@click="openLanguages"
			>
				<p class="font-medium">{{ $t('user.language') }}</p>
				<div class="flex-1" />
				<p class="text-base text-muted-foreground">
					{{ $t(`user.languages.${locale}`) }}
				</p>
				<ChevronDown class="text-muted-foreground" />
			</button>
			<div
				class="flex min-h-16 cursor-pointer items-center justify-between gap-4 border-t px-4 hover:bg-secondary/40"
				@click="darkMode = !darkMode"
			>
				<p class="font-medium">{{ $t('user.darkTheme') }}</p>
				<Switch
					v-model="darkMode"
					:aria-label="$t('user.darkTheme')"
					@click.stop
				/>
			</div>
		</div>

		<div class="flex-1" />

		<p class="text-base text-center font-normal text-muted-foreground">
			{{ $t('user.version', { version: appVersion }) }}
		</p>
	</div>
</template>
