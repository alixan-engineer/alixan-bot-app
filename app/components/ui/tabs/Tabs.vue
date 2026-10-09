<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { cn } from '~/utils/cn';

defineOptions({ inheritAttrs: false });

type TabsDesign = 'material' | 'cupertino';

interface TabsProps {
	tabs?: string[];
	design?: TabsDesign;
	full?: boolean;
}

const props = withDefaults(defineProps<TabsProps>(), {
	tabs: () => [],
	design: 'cupertino',
	full: false,
});

const selected = defineModel<number>({ default: 0 });
const attrs = useAttrs();

const safeSelected = computed(() => {
	if (!props.tabs.length) {
		return 0;
	}
	return Math.min(Math.max(selected.value, 0), props.tabs.length - 1);
});

const rootClass = computed(() =>
	cn(props.full ? 'w-full' : 'w-fit max-w-full', attrs.class),
);

const tabButtonClass = computed(() => (props.full ? 'flex-1' : 'shrink-0'));

const materialIndicatorStyle = computed(() => {
	if (!props.tabs.length) {
		return {
			left: '0%',
			width: '0%',
		};
	}
	const width = 100 / props.tabs.length;
	return {
		left: `${safeSelected.value * width}%`,
		width: `${width}%`,
	};
});

const selectTab = (index: number) => (selected.value = index);
</script>

<template>
	<div v-if="tabs.length" :class="rootClass">
		<div v-if="design === 'material'" class="relative h-12 w-full">
			<div
				class="absolute bottom-0 flex h-0.5 justify-center rounded-full transition-all duration-300"
				:style="materialIndicatorStyle"
			>
				<div class="size-full max-w-25 rounded-full bg-primary" />
			</div>

			<nav class="flex h-full overflow-x-auto border-b">
				<button
					v-for="(tab, index) in tabs"
					:key="`${tab}-${index}`"
					type="button"
					:class="
						cn(
							'h-full px-4 text-center text-base focus-visible:bg-secondary focus-visible:outline-none',
							tabButtonClass,
							safeSelected === index
								? 'font-medium text-primary'
								: 'text-foreground/50 hover:text-foreground',
						)
					"
					@click="selectTab(index)"
				>
					{{ $t(tab) }}
				</button>
			</nav>
		</div>

		<nav
			v-else
			class="flex h-11 w-full items-center overflow-x-auto rounded-xl bg-secondary p-1"
		>
			<button
				v-for="(tab, index) in tabs"
				:key="`${tab}-${index}`"
				type="button"
				:class="
					cn(
						'h-full rounded-xl px-3 text-center text-base focus-visible:outline-none',
						tabButtonClass,
						safeSelected === index
							? 'bg-background text-foreground'
							: 'text-foreground hover:bg-background/40 focus-visible:bg-background/40',
					)
				"
				@click="selectTab(index)"
			>
				{{ $t(tab) }}
			</button>
		</nav>
	</div>
</template>
