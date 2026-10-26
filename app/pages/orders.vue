<script setup lang="ts">
import { Search as SearchIcon } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import ArchiveVirtualScroller from '~/features/archive/ArchiveVirtualScroller.vue';
import TelegramOrderSearchDrawer from '~/features/orders/TelegramOrderSearchDrawer.vue';
import { toAlmatyDay } from '~/utils/order-graph';

usePageMeta({
	title: 'seo.pages.orders.title',
	description: 'seo.pages.orders.description',
});

const orders = useOrders();
const userStore = useUser();
const dialog = useDialog();
const toast = useToast();
const drawer = useDrawer();
const { locale } = useI18n();
const today = toAlmatyDay(Date.now());
const range = ref<{ from: string; to: string } | null>({
	from: today,
	to: today,
});
const selectedTab = ref(0);
const statusValues = [
	'',
	'new',
	'in_progress',
	'ready',
	'courier_search',
	'courier_assigned',
	'cleared',
];
const tabs = [
	'archive.filters.all',
	...statusValues.slice(1).map(status => `order.telegramStatus.${status}`),
];
const openSearch = () =>
	drawer.open(TelegramOrderSearchDrawer, {
		title: 'ordersUi.findOrder',
		position: 'right',
		width: '720px',
	});
const initialLoading = ref(true);
const requestLoading = ref(false);
const loadFailed = ref(false);
const refreshing = ref(false);
let pollingTimer: ReturnType<typeof setInterval> | undefined;

const orderBotEnabled = computed(
	() => userStore.user?.orderBotEnabled === true,
);

useAppBarActions(() =>
	orderBotEnabled.value
		? { icon: SearchIcon, label: 'ordersUi.findOrder', onClick: openSearch }
		: null,
);

const periodOrders = computed(() =>
	orders.orders.filter(order => {
		const day = toAlmatyDay(order.createdAt);
		return (
			range.value?.from &&
			range.value.to &&
			day >= range.value.from &&
			day <= range.value.to
		);
	}),
);
const selectedOrders = computed(() =>
	periodOrders.value.filter(
		order =>
			!statusValues[selectedTab.value] ||
			order.telegramStatus === statusValues[selectedTab.value],
	),
);
const totalAmount = computed(() =>
	periodOrders.value.reduce((total, order) => total + order.totalAmount, 0),
);

const refresh = async () => {
	if (!range.value?.from || !range.value.to) return;
	refreshing.value = true;
	try {
		await orders.getOrders(range.value);
		loadFailed.value = false;
	} catch {
		loadFailed.value = true;
	} finally {
		refreshing.value = false;
	}
};
watch(
	range,
	() => {
		if (orderBotEnabled.value && !initialLoading.value) void refresh();
	},
	{ deep: true },
);

const sendConnectionRequest = async () => {
	if (requestLoading.value) return;
	requestLoading.value = true;
	try {
		await useApiFetch('landing/leads/order-bot', { method: 'POST' });
		toast.open('order.connectionRequest.success', 'success');
	} finally {
		requestLoading.value = false;
	}
};

const confirmConnectionRequest = () => {
	dialog.open(ConfirmDialog, {
		width: '400px',
		height: '240px',
		data: {
			title: 'order.connectionRequest.confirmTitle',
			description: 'order.connectionRequest.confirmDescription',
			cancelLabel: 'common.cancel',
			submitLabel: 'order.connectionRequest.confirmSubmit',
			onSubmit: sendConnectionRequest,
		},
	});
};

onMounted(async () => {
	await userStore.getUserByToken();
	if (!orderBotEnabled.value) {
		initialLoading.value = false;
		return;
	}
	try {
		await refresh();
	} finally {
		initialLoading.value = false;
	}
	pollingTimer = setInterval(() => {
		refresh().catch(() => undefined);
	}, 30_000);
});

onBeforeUnmount(() => {
	if (pollingTimer) {
		clearInterval(pollingTimer);
	}
});
</script>

<template>
	<div class="flex min-w-0 flex-1 shrink-0 flex-col gap-6">
		<Spinner v-if="initialLoading" />

		<div
			v-else-if="!orderBotEnabled"
			class="flex flex-1 items-center justify-center"
		>
			<Island class="w-full max-w-xl" content-class="px-6 py-10">
				<Empty
					title="order.connectionRequest.title"
					description="order.connectionRequest.description"
					button="order.connectionRequest.submit"
					@action="confirmConnectionRequest"
				/>
			</Island>
		</div>

		<template v-else>
			<Calendar
				v-model="range"
				mode="range"
				:locale="locale"
				:label="$t('calendarLabels.period')"
				date-format="dd.mm.yyyy"
				class="max-w-xl"
			/>
			<div class="grid grid-cols-2 gap-3 sm:gap-4">
				<Island
					class="h-full"
					content-class="flex h-full flex-col justify-between gap-2 p-4 sm:p-5"
				>
					<p class="text-sm text-muted-foreground">
						{{ $t('order.ordersCount') }}
					</p>
					<p class="text-xl font-semibold sm:text-2xl">
						{{ periodOrders.length }}
					</p>
				</Island>
				<Island
					class="h-full"
					content-class="flex h-full flex-col justify-between gap-2 p-4 sm:p-5"
				>
					<p class="text-sm text-muted-foreground">
						{{ $t('ordersUi.orderAmount') }}
					</p>
					<p class="text-xl font-semibold sm:text-2xl">
						<Price :value="totalAmount" />
					</p>
				</Island>
			</div>
			<SwipeTabs v-model="selectedTab" :tabs="tabs" design="material" full />
			<Spinner v-if="refreshing" />
			<Empty
				v-else-if="loadFailed"
				class="h-auto flex-1"
				title="ordersUi.loadError"
				description="ordersUi.tryAgain"
				button="ordersUi.retry"
				@action="refresh"
			/>
			<ArchiveVirtualScroller
				v-else-if="selectedOrders.length"
				:orders="selectedOrders"
			/>
			<Empty
				v-else
				class="h-auto flex-1"
				title="order.empty.title"
				description="order.empty.description"
			/>
		</template>
	</div>
</template>
