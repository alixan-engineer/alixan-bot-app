<script setup lang="ts">
import { MoveRight } from '@lucide/vue';
import { formatTime } from '~/utils/date';

usePageMeta({
	title: 'seo.pages.home.title',
	description: 'seo.pages.home.description',
});

const dashboard = useDashboard();
let pollingTimer: ReturnType<typeof setInterval> | undefined;

const logStatusView = (status: string) => {
	if (status === 'pending')
		return { text: 'product.logStatus.pending', status: 'warning' as const };
	if (status === 'success') {
		return { text: 'product.logStatus.success', status: 'success' as const };
	}
	if (status === 'failed') {
		return { text: 'product.logStatus.failed', status: 'error' as const };
	}
	return { text: 'product.logStatus.skipped', status: 'warning' as const };
};

const orderPollView = (lastError?: string | null) => {
	if (lastError) {
		return { text: 'order.status.error', status: 'error' as const };
	}
	return { text: 'order.status.ok', status: 'success' as const };
};

onMounted(async () => {
	await dashboard.getSummary();
	pollingTimer = setInterval(() => {
		dashboard.getSummary().catch(() => undefined);
	}, 30_000);
});

onBeforeUnmount(() => {
	if (pollingTimer) {
		clearInterval(pollingTimer);
	}
});
</script>

<template>
	<Spinner v-if="dashboard.loading && !dashboard.summary" />

	<template v-else>

		<Island
			v-if="dashboard.summary?.orderPollStatuses.length"
			title="dashboard.storeHealth"
		>
			<List divider="inset">
				<ListTile
					v-for="entry in dashboard.summary.orderPollStatuses"
					:key="entry.storeId"
					:title="entry.store?.name || entry.storeId"
					:description="
						entry.orderBotConnected && entry.lastCheckedAt
							? entry.lastError || $t('order.lastCheckedAt') + ' ' + formatTime(entry.lastCheckedAt)
							: undefined
					"
				>
					<template #leading>
						<StoreIndicator v-if="entry.store" :status="entry.store.status" />
					</template>
					<template #trailing>
						<Status
							v-if="entry.orderBotConnected && entry.lastCheckedAt"
							:text="$t(orderPollView(entry.lastError).text)"
							:status="orderPollView(entry.lastError).status"
						/>
					</template>
				</ListTile>
			</List>
		</Island>

		<Island
			v-if="dashboard.summary?.recentOrders.length"
			title="dashboard.recentOrders"
		>
			<List divider="inset">
				<ListTile
					v-for="order in dashboard.summary.recentOrders"
					:key="order.dedupeKey"
					:title="'№ ' + order.sourceOrderId"
				>
					<template #leading>
						<p class="text-md text-muted-foreground">
							{{ formatTime(order.createdAt) }}
						</p>
					</template>
					<template #description>
						<p class="my-2 text-md uppercase text-muted-foreground">
							{{ order.store?.name.toUpperCase() }}
						</p>
						<div
							class="w-fit bg-card text-card-foreground px-3 py-2 rounded-xl text-center"
						>
							<Price class="text-md font-medium" :value="order.totalAmount" />
						</div>
					</template>
					<template #trailing>
						<OrderStatus :order="order" />
					</template>
				</ListTile>
			</List>
		</Island>

		<Island
			v-if="dashboard.summary?.recentPriceLogs.length"
			title="dashboard.recentPriceChanges"
		>
			<List divider="inset">
				<ListTile
					v-for="log in dashboard.summary.recentPriceLogs"
					:key="log._id"
				>
					<template #title>
						<p class="line-clamp-2">
							{{ log.masterTitle || log.masterSku }}
						</p>
					</template>
					<template #leading>
						<p class="text-md text-muted-foreground">
							{{ formatTime(log.updatedAt || log.createdAt) }}
						</p>
					</template>
					<template #description>
						<p class="my-2 text-md uppercase text-muted-foreground">
							{{ (log.store?.name || log.merchantUid).toUpperCase() }}
						</p>
						<div
							class="w-fit flex items-center gap-2 bg-card text-card-foreground px-3 py-2 rounded-xl"
						>
							<Price
								:value="log.oldPrice"
								class="text-md text-muted-foreground font-medium"
							/>
							<MoveRight class="size-4 text-muted-foreground" />
							<Price :value="log.newPrice" class="text-md font-medium" />
						</div>
					</template>
					<template #trailing>
						<Status
							:text="$t(logStatusView(log.status).text)"
							:status="logStatusView(log.status).status"
						/>
					</template>
				</ListTile>
			</List>
		</Island>
	</template>
</template>
