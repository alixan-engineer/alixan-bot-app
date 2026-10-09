<script setup lang="ts">
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';

usePageMeta({
	title: 'seo.pages.orders.title',
	description: 'seo.pages.orders.description',
});

const orders = useOrders();
const userStore = useUser();
const dialog = useDialog();
const toast = useToast();
const search = ref('');
const initialLoading = ref(true);
const requestLoading = ref(false);
let pollingTimer: ReturnType<typeof setInterval> | undefined;

const orderBotEnabled = computed(
	() => userStore.user?.orderBotEnabled === true,
);

type SelectedDay = 'today' | 'yesterday';

const dayFilters: Array<{ value: SelectedDay; label: string }> = [
	{ value: 'today', label: 'order.days.today' },
	{ value: 'yesterday', label: 'order.days.yesterday' },
];

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	timeZone: 'Asia/Almaty',
});

const toDayKey = (value: Date): string => {
	const parts = dayFormatter.formatToParts(value);
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find(item => item.type === type)?.value ?? '';

	return `${part('year')}-${part('month')}-${part('day')}`;
};

const selectedDay = ref<SelectedDay>('today');

const selectedDate = computed(() => {
	const offset = selectedDay.value === 'yesterday' ? 86_400_000 : 0;
	return toDayKey(new Date(Date.now() - offset));
});

const selectedOrders = computed(() => {
	const query = search.value.trim().toLocaleLowerCase();
	return orders.orders.filter(order => {
		const matchesDate =
			toDayKey(new Date(order.createdAt)) === selectedDate.value;
		const matchesSearch =
			!query ||
			[order.sourceOrderId, order.customerName, order.deliveryAddress].some(
				value => value?.toLocaleLowerCase().includes(query),
			);
		return matchesDate && matchesSearch;
	});
});

const refresh = () => orders.getOrders();

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
		height: '280px',
		data: {
			title: 'order.connectionRequest.confirmTitle',
			description: 'order.connectionRequest.confirmDescription',
			cancelLabel: 'common.cancel',
			submitLabel: 'order.connectionRequest.submit',
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
	<Spinner v-if="initialLoading" />

	<Empty
		v-else-if="!orderBotEnabled"
		title="order.connectionRequest.title"
		description="order.connectionRequest.description"
		button="order.connectionRequest.submit"
		@action="confirmConnectionRequest"
	/>

	<template v-else>
		<div class="flex flex-wrap gap-2">
			<Chip
				v-for="filter in dayFilters"
				:key="filter.value"
				:label="$t(filter.label)"
				:selected="selectedDay === filter.value"
				@click="selectedDay = filter.value"
			/>
		</div>

		<Search v-model="search" :placeholder="$t('order.search')" />

		<div v-if="selectedOrders.length" class="space-y-3 sm:space-y-4">
			<p class="text-base font-semibold sm:text-lg">
				{{ $t('order.ordersCount') }}:
				{{ selectedOrders.length }}
			</p>
			<div class="grid gap-3 sm:gap-5 xl:grid-cols-2">
				<OrderCard
					v-for="order in selectedOrders"
					:key="order.dedupeKey"
					:order="order"
				/>
			</div>
		</div>

		<Empty
			v-else
			title="order.empty.title"
			description="order.empty.description"
		/>
	</template>
</template>
