<script setup lang="ts">
const localePath = useLocalePath();
await navigateTo(
	{ path: localePath('/archive'), query: { tab: 'graph' } },
	{ replace: true, redirectCode: 301 },
);
</script>
<template><span /></template>
