<script setup lang="ts">
import type { Store } from '~/composables/useStores';

defineProps<{ store: Store }>();
</script>

<template>
	<article
		class="flex flex-wrap min-h-16 items-center gap-2.5 rounded-xl border p-3 sm:min-h-18 sm:gap-3 sm:p-4"
	>
		<StoreIndicator :status="store.status" />
		<div class="min-w-0 flex-1">
			<p class="truncate text-lg font-semibold">
				{{ store.name || store.email }}
			</p>
			<p class="text-sm text-muted-foreground">{{ store.cities?.map(city => city.name).join(', ') }}</p>
			<p v-if="store.authError" class="truncate text-sm text-destructive">
				{{ store.authError }}
			</p>
		</div>
		<Status
			v-if="store.isMain"
			status="success"
			:text="$t('store.mainStore')"
		/>
		<Button
			v-if="store.storeId"
			variant="outlined"
			size="sm"
			class="max-sm:order-last max-sm:w-full"
			:to="{ path: '/products', query: { storeId: store._id } }"
		>
			{{ $t('catalogUi.storeProducts') }}
		</Button>
		<StoreActions :store="store" />
	</article>
</template>
