<script setup lang="ts">
import { Image } from '@lucide/vue';
import type { ArchivedOrder } from '~/composables/useOrderArchive';
import type { Order } from '~/composables/useOrders';

defineProps<{
	data?: { order?: Order | ArchivedOrder };
	close: () => void;
}>();

const getProductCode = (sku: string): string => sku.split('_')[0] ?? sku;
</script>

<template>
	<div v-if="data?.order" class="size-full flex flex-col">
		<div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
			<div class="divide-y overflow-hidden rounded-xl border">
				<div
					v-for="item in data.order.items"
					:key="`${data.order.dedupeKey}:${item.sku || item.title}`"
					class="flex gap-4 p-4"
				>
					<img
						v-if="item.imageUrl"
						:src="item.imageUrl"
						:alt="item.title"
						loading="lazy"
						class="size-16 shrink-0 rounded-lg object-cover"
					/>
					<div
						v-else
						class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground"
					>
						<Image class="size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="line-clamp-2 font-medium leading-5">{{ item.title }}</p>
						<p v-if="item.sku" class="mt-1 text-sm text-muted-foreground">
							Код товара: {{ getProductCode(item.sku) }}
						</p>
						<div class="mt-3 flex items-center justify-between gap-3">
							<p class="text-sm text-muted-foreground">
								{{ item.quantity }} {{ $t('order.pieces') }}
							</p>
							<p class="font-semibold">
								<Price :value="item.totalPrice" />
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-between gap-4 border-t p-4">
			<div>
				<p class="text-sm text-muted-foreground">{{ $t('order.total') }}</p>
				<p class="text-xl font-semibold">
					<Price :value="data.order.totalAmount" />
				</p>
			</div>
			<Button
				variant="filled"
				color="secondary"
				label="common.close"
				@click="close"
			/>
		</div>
	</div>
</template>
