<script setup lang="ts">
import TabButton from '~/components/ui/tabs/TabButton.vue';
import { computed, nextTick, useAttrs, useId } from 'vue';
import { cn } from '~/utils/cn';

defineOptions({ inheritAttrs: false });
interface TabsProps {
	tabs?: string[];
	counts?: number[];
	design?: 'material' | 'cupertino';
	full?: boolean;
}
const props = withDefaults(defineProps<TabsProps>(), {
	tabs: () => [],
	design: 'cupertino',
	full: false,
});
const selected = defineModel<number>({ default: 0 });
const attrs = useAttrs();
const id = useId();
const buttons = ref<InstanceType<typeof TabButton>[]>([]);
const safeSelected = computed(() =>
	Math.min(Math.max(selected.value, 0), Math.max(0, props.tabs.length - 1)),
);
const selectTab = (index: number, focus = false) => {
	selected.value = index;
	nextTick(() => {
		const button = buttons.value[index];
		if (focus) button?.focus();
		button?.$el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	});
};
const onKeydown = (event: KeyboardEvent, index: number) => {
	let next = index;
	if (event.key === 'ArrowRight') next = (index + 1) % props.tabs.length;
	else if (event.key === 'ArrowLeft')
		next = (index + props.tabs.length - 1) % props.tabs.length;
	else if (event.key === 'Home') next = 0;
	else if (event.key === 'End') next = props.tabs.length - 1;
	else return;
	event.preventDefault();
	selectTab(next, true);
};
</script>

<template>
	<div
		v-if="tabs.length"
		v-bind="attrs"
		:class="
			cn(full ? 'w-full' : 'w-fit max-w-full', 'min-w-0 shrink-0', attrs.class)
		"
	>
		<div
			:class="
				cn(
					'overflow-hidden',
					design === 'material' ? 'border-b' : 'rounded-xl bg-secondary p-1',
				)
			"
		>
			<div
				role="tablist"
				:class="cn(
					'flex overflow-x-auto',
					design === 'material' ? 'h-12' : 'h-9 gap-1',
				)"
			>
				<div
					v-for="(tab, index) in tabs"
					:key="`${tab}-${index}`"
					:class="cn('shrink-0', full ? 'grow' : '')"
				>
					<TabButton
						:id="`${id}-tab-${index}`"
						ref="buttons"
						:tab="tab"
						:count="counts?.[index]"
						:active="safeSelected === index"
						:design="design"
						@click="selectTab(index)"
						@keydown="onKeydown($event, index)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
