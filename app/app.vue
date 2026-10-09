<script setup lang="ts">
import { favicon } from './config/site/favicon';

const { locale } = useI18n();

usePageMeta();

useHead({
	htmlAttrs: {
		lang: computed(() => locale.value),
	},
	link: favicon,
});
</script>

<template>
	<NuxtLayout />

	<DialogHost />
	<DrawerHost />
	<ToastHost />
	<GlobalLoaderHost />
</template>
