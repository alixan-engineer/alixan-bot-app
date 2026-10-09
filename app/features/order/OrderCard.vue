<script setup lang="ts">
import { MapPin, ReceiptText, UserRound } from '@lucide/vue';
import type { ArchivedOrder } from '~/composables/useOrderArchive';
import type { Order } from '~/composables/useOrders';
import OrderDetailsDialog from './OrderDetailsDialog.vue';
import OrderStatus from './OrderStatus.vue';

const props = defineProps<{ order: Order | ArchivedOrder }>();
const dialog = useDialog();
const { t } = useI18n();

const dateTime = new Intl.DateTimeFormat('ru-KZ', {
	day: '2-digit',
	month: 'long',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Asia/Almaty',
});

const deliveryAddress = computed(
	() =>
		props.order.deliveryAddress ||
		('deliveryType' in props.order
			? t(`order.deliveryType.${props.order.deliveryType}`)
			: '-'),
);

const orderNumber = computed(() =>
	'orderCode' in props.order
		? props.order.orderCode
		: props.order.sourceOrderId,
);

const openDetails = (): void => {
	dialog.open(OrderDetailsDialog, {
		width: '500px',
		height: '500px',
		title: `№ ${orderNumber.value}`,
		data: { order: props.order },
	});
};
</script>

<template>
	<Island
		content-class="flex min-h-48 flex-col gap-3 p-3.5 sm:min-h-56 sm:gap-5 sm:p-6"
	>
		<div class="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
			<div class="space-y-1">
				<p class="text-sm uppercase text-muted-foreground">
					{{ order.store?.name }}
				</p>
				<p class="my-2 text-lg font-semibold sm:text-xl">№ {{ orderNumber }}</p>
				<p class="text-md text-muted-foreground">
					{{ dateTime.format(new Date(order.createdAt)) }}
				</p>
			</div>
			<OrderStatus :order="order" />
		</div>

		<div class="grid gap-3 md:grid-cols-2">
			<div class="flex min-w-0 items-start gap-3">
				<UserRound class="mt-0.5 size-5 shrink-0 text-muted-foreground" />
				<div class="min-w-0">
					<p class="text-sm text-muted-foreground">
						{{ $t('order.customer') }}
					</p>
					<p class="truncate font-medium">
						{{ order.customerName || '-' }}
					</p>
				</div>
			</div>

			<div class="flex min-w-0 items-start gap-3">
				<MapPin class="mt-0.5 size-5 shrink-0 text-muted-foreground" />
				<div class="min-w-0">
					<p class="text-sm text-muted-foreground">
						{{ $t('order.delivery') }}
					</p>
					<p class="line-clamp-2 font-medium">{{ deliveryAddress }}</p>
				</div>
			</div>
		</div>

		<div
			class="mt-auto flex flex-wrap items-end justify-between gap-3 border-t pt-3 sm:gap-4 sm:pt-4"
		>
			<div>
				<p class="text-sm text-muted-foreground">{{ $t('order.total') }}</p>
				<p class="text-xl font-semibold sm:text-2xl">
					<Price :value="order.totalAmount" />
				</p>
			</div>
			<Button
				size="sm"
				variant="filled"
				color="secondary"
				label="order.composition"
				@click="openDetails"
			>
				<template #leading>
					<ReceiptText />
				</template>
			</Button>
		</div>
	</Island>
</template>
