<script setup lang="ts">
import type { ArchivedOrder } from '~/composables/useOrderArchive';
import type { Order } from '~/composables/useOrders';

const props = defineProps<{ order: Order | ArchivedOrder }>();

const statusView = computed(() => {
	if ('orderCode' in props.order) {
		if (props.order.status === 'COMPLETED') {
			return { text: 'archive.status.completed', status: 'success' as const };
		}

		if (props.order.status === 'RETURNED') {
			return { text: 'archive.status.returned', status: 'warning' as const };
		}

		return { text: 'archive.status.cancelled', status: 'error' as const };
	}

	const status = props.order.telegramStatus;
	if (!status) {
		return { text: 'order.status.notChecked', status: 'warning' as const };
	}

	if (status === 'cleared' || status === 'courier_assigned') {
		return {
			text: `order.telegramStatus.${status}`,
			status: 'success' as const,
		};
	}

	if (
		status === 'courier_search' ||
		status === 'ready' ||
		status === 'in_progress'
	) {
		return {
			text: `order.telegramStatus.${status}`,
			status: 'warning' as const,
		};
	}

	return { text: `order.telegramStatus.${status}`, status: 'success' as const };
});
</script>

<template>
	<Status :text="$t(statusView.text)" :status="statusView.status" />
</template>
