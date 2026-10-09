<script setup lang="ts">
import { computed } from 'vue';

type TextLinkTarget = '_blank' | '_self' | '_parent' | '_top';

interface TextLinkProps {
	href: string;
	target?: TextLinkTarget;
}

const props = withDefaults(defineProps<TextLinkProps>(), {
	target: undefined,
});

const rel = computed(() =>
	props.target === '_blank' ? 'noopener noreferrer' : undefined,
);
</script>

<template>
	<a
		class="font-medium text-foreground underline underline-offset-4"
		:href="href"
		:target="target"
		:rel="rel"
	>
		<slot />
	</a>
</template>
