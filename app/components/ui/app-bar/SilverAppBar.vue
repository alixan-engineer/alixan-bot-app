<script setup lang="ts">
import { cn } from '~/utils/cn';

type SilverAppBarTitleAlign = 'responsive' | 'start' | 'center';

interface SilverAppBarProps {
	title: string;
	titleAlign?: SilverAppBarTitleAlign;
}

const props = withDefaults(defineProps<SilverAppBarProps>(), {
	titleAlign: 'responsive',
});

const isLargeTitleVisible = ref<boolean>(true);
const largeTitleRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
	if (!largeTitleRef.value) return;
	observer = new IntersectionObserver(
		([entry]) => {
			isLargeTitleVisible.value = entry?.isIntersecting ?? false;
		},
		{
			threshold: 0,
		},
	);
	observer.observe(largeTitleRef.value);
});

onBeforeUnmount(() => {
	observer?.disconnect();
});
</script>

<template>
	<header
		:class="
			cn(
				'w-full h-14',
				'sticky top-0 bg-background',
				'border-b transition-colors duration-200',
				isLargeTitleVisible ? 'border-transparent' : 'border-border',
			)
		"
	>
		<div class="size-full px-2 relative flex items-center gap-2">
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
						'transition-all duration-200 ease-out',
						titleAlign === 'center' ? 'text-center' : '',
						titleAlign === 'responsive' ? 'max-md:text-center' : '',
						isLargeTitleVisible
							? 'translate-y-1 opacity-0'
							: 'translate-y-0 opacity-100',
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
		</div>
	</header>

	<div ref="largeTitleRef">
		<slot name="observer" />
	</div>
</template>
