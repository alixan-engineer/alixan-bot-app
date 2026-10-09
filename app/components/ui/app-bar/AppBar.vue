<script setup lang="ts">
import { cn } from '~/utils/cn';

type AppBarTitleAlign = 'responsive' | 'start' | 'center';

interface AppBarProps {
	title: string;
	titleAlign?: AppBarTitleAlign;
}

const props = withDefaults(defineProps<AppBarProps>(), {
	titleAlign: 'responsive',
});
</script>

<template>
	<header class="w-full h-14 px-2 relative flex items-center gap-2 border-b">
		<div
			:class="
				cn(
					titleAlign === 'center' && 'absolute left-2',
					titleAlign === 'responsive' && 'max-md:absolute max-md:left-2',
				)
			"
		>
			<slot name="leading" />
		</div>

		<h1
			:class="
				cn(
					'flex-1 text-xl font-semibold',
					titleAlign === 'center' ? 'text-center' : '',
					titleAlign === 'responsive' ? 'max-md:text-center' : '',
				)
			"
		>
			{{ $t(title) }}
		</h1>

		<div
			:class="
				cn(
					'flex items-center',
					titleAlign === 'center' && 'absolute right-2',
					titleAlign === 'responsive' && 'max-md:absolute max-md:right-2',
				)
			"
		>
			<slot name="trailing" />
		</div>
	</header>
</template>
