<script setup lang="ts">
import type { buildOrderGraph } from '~/utils/order-graph';
const props = defineProps<{ data: ReturnType<typeof buildOrderGraph> }>();
const analytics = computed(() => props.data);
const { locale } = useI18n();
const height = 360;
const chart = { top: 24, right: 16, bottom: 64, left: 8 };
const width = computed(() => Math.max(760, analytics.value.graph.length * 18));

const maxCount = computed(() =>
	Math.max(1, ...analytics.value.graph.map((point) => point.count)),
);

const chartPoints = computed(() =>
	analytics.value.graph.map((point, index) => {
		const x =
			chart.left +
			(index / Math.max(1, analytics.value.graph.length - 1)) *
				(width.value - chart.left - chart.right);
		const y =
			height -
			chart.bottom -
			(point.count / maxCount.value) * (height - chart.top - chart.bottom);

		return { ...point, x, y, index };
	}),
);

const polyline = computed(() =>
	chartPoints.value.map((point) => `${point.x},${point.y}`).join(' '),
);

const yMarkers = computed(() =>
	Array.from({ length: 5 }, (_, index) => {
		const ratio = index / 4;

		return {
			value: Math.round(maxCount.value * (1 - ratio)),
			y: chart.top + ratio * (height - chart.top - chart.bottom),
		};
	}),
);

const weekMarkers = computed(() =>
	chartPoints.value.filter((_, index) => index % 7 === 0),
);

const monthMarkers = computed(() =>
	chartPoints.value.filter((point, index, points) => {
		if (index === 0) return true;

		return point.date.slice(0, 7) !== points[index - 1]?.date.slice(0, 7);
	}),
);

const formatDay = (date: string) =>
	new Intl.DateTimeFormat(locale.value, {
		day: 'numeric',
		month: 'short',
	}).format(new Date(`${date}T12:00:00+05:00`));

const formatMonth = (date: string) => {
	const label = new Intl.DateTimeFormat(locale.value, {
		month: 'long',
	}).format(new Date(`${date}T12:00:00+05:00`));

	return label.charAt(0).toUpperCase() + label.slice(1);
};

const peak = computed(() =>
	analytics.value.graph.reduce<{ date: string; count: number } | null>(
		(result, point) => (!result || point.count > result.count ? point : result),
		null,
	),
);

const peakWeekday = computed(() =>
	analytics.value.weekdayPoints.reduce<{
		weekday: number;
		count: number;
	} | null>(
		(result, point) => (!result || point.count > result.count ? point : result),
		null,
	),
);

const peakHour = computed(() =>
	analytics.value.hourPoints.reduce<{ hour: number; count: number } | null>(
		(result, point) => (!result || point.count > result.count ? point : result),
		null,
	),
);

const maxWeekdayCount = computed(() =>
	Math.max(1, ...analytics.value.weekdayPoints.map((point) => point.count)),
);

const monthlyPoints = computed(() => {
	const months = new Map<string, number>();

	for (const point of analytics.value.graph) {
		const month = point.date.slice(0, 7);
		months.set(month, (months.get(month) ?? 0) + point.count);
	}

	return [...months].map(([month, count]) => ({ month, count }));
});

const maxMonthlyCount = computed(() =>
	Math.max(1, ...monthlyPoints.value.map((point) => point.count)),
);

const peakMonth = computed(() =>
	monthlyPoints.value.reduce<(typeof monthlyPoints.value)[number] | null>(
		(result, point) => (!result || point.count > result.count ? point : result),
		null,
	),
);

const maxHourCount = computed(() =>
	Math.max(1, ...analytics.value.hourPoints.map((point) => point.count)),
);

const formatWeekday = (weekday: number) =>
	new Intl.DateTimeFormat(locale.value, {
		weekday: 'short',
		timeZone: 'Asia/Almaty',
	}).format(new Date(Date.UTC(2024, 0, 1 + weekday)));

const formatWeekdayLong = (weekday: number) =>
	new Intl.DateTimeFormat(locale.value, {
		weekday: 'long',
		timeZone: 'Asia/Almaty',
	}).format(new Date(Date.UTC(2024, 0, 1 + weekday)));

const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

const formatMonthYear = (month: string) => {
	const label = new Intl.DateTimeFormat(locale.value, {
		month: 'long',
		year: 'numeric',
		timeZone: 'Asia/Almaty',
	}).format(new Date(`${month}-01T12:00:00+05:00`));

	return label.charAt(0).toUpperCase() + label.slice(1);
};
</script>

<template>
	<Island content-class="flex flex-col gap-5 overflow-hidden p-4 sm:p-6">
		<div class="flex flex-wrap gap-8">
			<div>
				<p class="text-sm text-muted-foreground">
					{{ $t('analytics.totalOrders') }}
				</p>
				<p class="text-3xl font-bold">{{ analytics.total }}</p>
			</div>

			<div v-if="peak">
				<p class="text-sm text-muted-foreground">
					{{ $t('analytics.peakDay') }}
				</p>
				<p class="text-lg font-semibold">
					{{ formatDay(peak.date) }} · {{ peak.count }}
				</p>
			</div>
		</div>

		<div v-if="chartPoints.length" class="flex min-w-0">
			<svg
				:viewBox="`0 0 48 ${height}`"
				class="w-12 shrink-0 bg-background"
				aria-hidden="true"
			>
				<text
					v-for="marker in yMarkers"
					:key="marker.y"
					x="38"
					:y="marker.y + 4"
					text-anchor="end"
					class="fill-muted-foreground text-xs"
				>
					{{ marker.value }}
				</text>
			</svg>
			<div class="min-w-0 flex-1 overflow-x-auto">
				<svg
					:width="width"
					:height="height"
					:viewBox="`0 0 ${width} ${height}`"
					role="img"
				>
					<g v-for="marker in yMarkers" :key="marker.y">
						<line
							x1="0"
							:y1="marker.y"
							:x2="width - chart.right"
							:y2="marker.y"
							class="stroke-border"
							stroke-dasharray="4 6"
						/>
					</g>

					<line
						v-for="marker in weekMarkers"
						:key="`week-${marker.date}`"
						:x1="marker.x"
						:y1="chart.top"
						:x2="marker.x"
						:y2="height - chart.bottom"
						class="stroke-border/60"
					/>

					<polyline
						:points="polyline"
						fill="none"
						class="stroke-primary"
						stroke-width="4"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>

					<circle
						v-for="point in chartPoints"
						:key="point.date"
						:cx="point.x"
						:cy="point.y"
						:r="point.count === peak?.count ? 5 : 2.5"
						class="fill-primary"
					>
						<title>{{ formatDay(point.date) }}: {{ point.count }}</title>
					</circle>

					<text
						v-for="marker in weekMarkers"
						:key="`label-${marker.date}`"
						:x="marker.x"
						:y="height - chart.bottom + 20"
						text-anchor="middle"
						class="fill-muted-foreground text-[10px]"
					>
						{{ formatDay(marker.date) }}
					</text>

					<text
						v-for="marker in monthMarkers"
						:key="`month-${marker.date}`"
						:x="marker.x"
						:y="height - 10"
						text-anchor="start"
						class="fill-foreground text-xs font-semibold"
					>
						{{ formatMonth(marker.date) }}
					</text>
				</svg>
			</div>
		</div>

		<Empty
			v-else
			title="analytics.empty"
			description="analytics.emptyDescription"
		/>
	</Island>

	<Island
		class="min-w-0 max-w-full"
		content-class="flex min-w-0 flex-col gap-6 overflow-hidden p-4 sm:p-6"
	>
		<div v-if="peakMonth && analytics.total">
			<p class="text-sm text-muted-foreground">
				{{ $t('analytics.peakMonth') }}
			</p>
			<p class="text-lg font-semibold capitalize">
				{{ formatMonthYear(peakMonth.month) }} · {{ peakMonth.count }}
			</p>
		</div>

		<div
			v-if="monthlyPoints.length"
			class="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-1 touch-pan-x"
		>
			<div
				class="grid h-56 items-end gap-3"
				:style="{
					gridTemplateColumns: `repeat(${monthlyPoints.length}, minmax(80px, 1fr))`,
					minWidth: `${Math.max(320, monthlyPoints.length * 96)}px`,
				}"
			>
				<div
					v-for="point in monthlyPoints"
					:key="point.month"
					class="flex h-full min-w-0 flex-col items-center justify-end gap-2"
				>
					<span class="text-xs font-medium">{{ point.count }}</span>
					<div class="flex h-40 w-full items-end rounded-lg bg-secondary/60">
						<div
							class="w-full rounded-lg bg-primary transition-[height] duration-300"
							:style="{
								height: `${(point.count / maxMonthlyCount) * 100}%`,
							}"
						/>
					</div>
					<span class="truncate text-xs capitalize text-muted-foreground">
						{{ formatMonthYear(point.month) }}
					</span>
				</div>
			</div>
		</div>
	</Island>

	<Island
		class="min-w-0 max-w-full"
		content-class="flex min-w-0 flex-col gap-6 overflow-hidden p-4 sm:p-6"
	>
		<div v-if="peakWeekday && analytics.total">
			<p class="text-sm text-muted-foreground">
				{{ $t('analytics.peakWeekday') }}
			</p>
			<p class="text-lg font-semibold capitalize">
				{{ formatWeekdayLong(peakWeekday.weekday) }} ·
				{{ peakWeekday.count }}
			</p>
		</div>

		<div
			class="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-1 touch-pan-x"
		>
			<div class="grid h-56 min-w-xl grid-cols-7 items-end gap-3">
				<div
					v-for="point in analytics.weekdayPoints"
					:key="point.weekday"
					class="flex h-full min-w-0 flex-col items-center justify-end gap-2"
				>
					<span class="text-xs font-medium">{{ point.count }}</span>
					<div class="flex h-40 w-full items-end rounded-lg bg-secondary/60">
						<div
							class="w-full rounded-lg bg-primary transition-[height] duration-300"
							:style="{
								height: `${(point.count / maxWeekdayCount) * 100}%`,
							}"
						/>
					</div>
					<span class="truncate text-xs capitalize text-muted-foreground">
						{{ formatWeekday(point.weekday) }}
					</span>
				</div>
			</div>
		</div>
	</Island>

	<Island
		class="min-w-0 max-w-full"
		content-class="flex min-w-0 flex-col gap-6 overflow-hidden p-4 sm:p-6"
	>
		<div v-if="peakHour && analytics.total">
			<p class="text-sm text-muted-foreground">
				{{ $t('analytics.peakHour') }}
			</p>
			<p class="text-lg font-semibold">
				{{ formatHour(peakHour.hour) }} · {{ peakHour.count }}
			</p>
		</div>

		<div
			class="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-1 touch-pan-x"
		>
			<div class="grid h-56 min-w-3xl grid-cols-24 items-end gap-1.5">
				<div
					v-for="point in analytics.hourPoints"
					:key="point.hour"
					class="flex h-full min-w-0 flex-col items-center justify-end gap-2"
				>
					<span class="text-[10px] font-medium">{{ point.count }}</span>
					<div class="flex h-40 w-full items-end rounded bg-secondary/60">
						<div
							class="w-full rounded bg-primary transition-[height] duration-300"
							:style="{
								height: `${(point.count / maxHourCount) * 100}%`,
							}"
						/>
					</div>
					<span class="text-[10px] text-muted-foreground">
						{{ String(point.hour).padStart(2, '0') }}
					</span>
				</div>
			</div>
		</div>
	</Island>
</template>
