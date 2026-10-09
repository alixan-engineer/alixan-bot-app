<script setup lang="ts">
import type { Store } from '~/composables/useStores';

defineProps<{ store: Store }>();
</script>

<template>
	<article
		class="flex min-h-16 items-center gap-2.5 rounded-xl border p-3 sm:min-h-18 sm:gap-3 sm:p-4"
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
		<StoreActions :store="store" />
	</article>
</template>
