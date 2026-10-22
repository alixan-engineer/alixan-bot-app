<script setup lang="ts">
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
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
const buttons = ref<HTMLButtonElement[]>([]);
const swiper = shallowRef<SwiperInstance>();
const syncSwiper = async (speed = 250) => {
	await nextTick();
	if (!swiper.value || swiper.value.destroyed) return;
	swiper.value.update();
	const gap = props.design === 'cupertino' ? 4 : 0;
	const contentWidth =
		swiper.value.slidesSizesGrid.reduce((sum, width) => sum + width, 0) +
		Math.max(0, props.tabs.length - 1) * gap;
	const centered = contentWidth > swiper.value.size + 1;
	if (swiper.value.params.centeredSlides !== centered) {
		swiper.value.params.centeredSlides = centered;
		swiper.value.originalParams.centeredSlides = centered;
		swiper.value.update();
	}
	swiper.value.slideTo(safeSelected.value, speed);
};
const onSwiper = (instance: SwiperInstance) => {
	swiper.value = instance;
	void syncSwiper(0);
};
const safeSelected = computed(() =>
	Math.min(Math.max(selected.value, 0), Math.max(0, props.tabs.length - 1)),
);
const selectTab = (index: number, focus = false) => {
	selected.value = index;
	nextTick(() => {
		const button = buttons.value[index];
		if (focus) button?.focus();
		void syncSwiper();
	});
};
watch(safeSelected, () => {
	void syncSwiper();
});
watch(
	() => [props.tabs, props.counts],
	() => {
		void syncSwiper(0);
	},
	{ deep: true },
);

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
			<Swiper
				role="tablist"
				:modules="[FreeMode]"
				:slides-per-view="'auto'"
				:free-mode="true"
				:centered-slides-bounds="true"
				:space-between="design === 'cupertino' ? 4 : 0"
				:class="
					cn(
						'tabs-swiper',
						full ? 'tabs-swiper-full' : '',
						design === 'material' ? 'h-12' : 'h-9',
					)
				"
				:wrapper-class="'tabs-swiper-track'"
				@swiper="onSwiper"
				@resize="syncSwiper(0)"
			>
				<SwiperSlide
					v-for="(tab, index) in tabs"
					:key="`${tab}-${index}`"
					class="tabs-swiper-slide"
				>
					<button
						:id="`${id}-tab-${index}`"
						ref="buttons"
						type="button"
						role="tab"
						:aria-selected="safeSelected === index"
						:tabindex="safeSelected === index ? 0 : -1"
						:class="
							cn(
								'relative h-full w-full whitespace-nowrap px-4 text-center text-md font-medium outline-none transition-colors focus-visible:bg-secondary',
								design === 'material'
									? safeSelected === index
										? 'font-semibold text-primary'
										: 'text-muted-foreground hover:text-foreground'
									: cn(
											'rounded-lg',
											safeSelected === index
												? 'bg-background font-semibold text-foreground'
												: 'text-muted-foreground hover:bg-background/40',
									  ),
							)
						"
						@click="selectTab(index)"
						@keydown="onKeydown($event, index)"
					>
						{{ $t(tab) }}
						<span
							v-if="counts?.[index] !== undefined"
							class="ml-0.5 text-xs tabular-nums opacity-75"
						>
							{{ counts[index] }}
						</span>
						<span
							v-if="design === 'material' && safeSelected === index"
							class="absolute inset-x-3 bottom-0 mx-auto h-0.5 max-w-25 rounded-t-full bg-primary"
						/>
					</button>
				</SwiperSlide>
			</Swiper>
		</div>
	</div>
</template>

<style scoped>
.tabs-swiper {
	max-width: 100%;
}
.tabs-swiper :deep(.tabs-swiper-track) {
	min-width: 100%;
}
.tabs-swiper :deep(.tabs-swiper-slide) {
	width: auto;
	flex-shrink: 0;
}
.tabs-swiper-full :deep(.tabs-swiper-slide) {
	flex-grow: 1;
}
</style>
