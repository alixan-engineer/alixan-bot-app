<script setup lang="ts">
import { ExternalLink, MoveRight } from '@lucide/vue';
import type {
	KaspiOffer,
	PriceChangeLog,
	Product,
} from '~/composables/useProducts';
import ProductConfigDialog from './ProductConfigDialog.vue';

const props = defineProps<{
	data?: {
		masterSku?: string;
		cityId?: string;
		onSaved?: () => Promise<void> | void;
	};
	close: () => void;
}>();

const products = useProducts();
const dialog = useDialog();
const loading = ref(false);
const tab = ref(0);
const selectedCity = ref(props.data?.cityId ?? products.cityId);
const cityOptions = computed(() =>
	(product.value?.cities ?? products.cities).map(city => ({
		label: city.name,
		value: city.id,
	})),
);
let requestId = 0;
const product = ref<Product | null>(null);
const logs = ref<PriceChangeLog[]>([]);
const offers = ref<KaspiOffer[]>([]);
const offersLoading = ref(false);

const kaspiUrl = computed(() =>
	product.value?.shopLink
		? `https://kaspi.kz/shop${product.value.shopLink}`
		: '',
);

const ownMerchantIds = computed(
	() => new Set((product.value?.stores ?? []).map(store => store.merchantUid)),
);

const isOwnOffer = (offer: KaspiOffer) =>
	offer.isOwn === true || ownMerchantIds.value.has(offer.sellerId);

const loadProduct = async () => {
	if (!props.data?.masterSku) return;
	const id = ++requestId;
	const city = selectedCity.value;
	const masterSku = props.data.masterSku;
	loading.value = true;
	offersLoading.value = true;
	offers.value = [];
	logs.value = [];
	const offersTask = products
		.getOffers(masterSku, city)
		.then(result => {
			if (id === requestId) offers.value = result;
		})
		.catch(() => {
			/* useApiFetch displays the error. */
		})
		.finally(() => {
			if (id === requestId) offersLoading.value = false;
		});
	try {
		const [nextProduct, nextLogs] = await Promise.all([
			products.getProduct(masterSku, city),
			products.getLogs({ masterSku, cityId: city }),
		]);
		if (id !== requestId) return;
		product.value = nextProduct;
		logs.value = nextLogs;
	} catch {
		if (id === requestId) product.value = null;
	} finally {
		if (id === requestId) loading.value = false;
	}
	await offersTask;
};
watch(selectedCity, () => {
	void loadProduct();
});
onBeforeUnmount(() => {
	requestId += 1;
});

const onProductSaved = async () => {
	await loadProduct();
	await props.data?.onSaved?.();
};

const openPriceRange = () => {
	if (!product.value) return;
	dialog.open(ProductConfigDialog, {
		width: '500px',
		height: 'auto',
		title: 'product.changePriceRange',
		data: {
			product: product.value,
			onSaved: onProductSaved,
		},
	});
};

const logStatusView = (log: PriceChangeLog) => {
	if (log.status === 'pending')
		return { text: 'product.logStatus.pending', status: 'warning' as const };
	if (log.status === 'success')
		return { text: 'product.logStatus.success', status: 'success' as const };
	if (log.status === 'failed')
		return { text: 'product.logStatus.failed', status: 'error' as const };
	return { text: 'product.logStatus.skipped', status: 'warning' as const };
};

onMounted(loadProduct);
</script>

<template>
	<Spinner v-if="loading" />

	<div v-else-if="product" class="overflow-y-auto scrollbar-none">
		<div class="h-72 mx-3 rounded-3xl overflow-hidden">
			<img
				v-if="product.images?.[0]"
				:src="product.images[0]"
				class="w-full object-cover"
				:alt="product.masterTitle || product.masterSku"
				loading="lazy"
			/>
		</div>

		<div class="p-4">
			<h2 class="line-clamp-2 text-lg font-semibold leading-6 sm:text-xl">
				{{ product.masterTitle || product.masterSku }}
			</h2>
		</div>
		<div class="px-4">
			<Select
				v-model="selectedCity"
				:options="cityOptions"
				label="catalogUi.city"
				:aria-label="$t('catalogUi.city')"
			/>
		</div>

		<Tabs
			v-model="tab"
			full
			class="px-4"
			:tabs="[
				'product.tabs.sellers',
				'product.tabs.dumping',
				'product.tabs.history',
			]"
		/>

		<div class="p-4 pb-6">
			<div v-if="tab === 0" class="space-y-4">
				<div class="space-y-3">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p class="text-lg font-semibold">
								{{ $t('product.kaspiSellerPrices') }}
							</p>
							<p class="text-sm text-muted-foreground">
								{{ $t('product.offersFound', { count: offers.length }) }}
							</p>
						</div>
						<Button
							size="sm"
							variant="filled"
							color="secondary"
							label="product.openInKaspi"
							:href="kaspiUrl || undefined"
							target="_blank"
						>
							<template #trailing>
								<ExternalLink class="size-4" />
							</template>
						</Button>
					</div>

					<div
						v-if="offersLoading"
						class="flex min-h-32 items-center justify-center"
					>
						<Spinner />
					</div>
					<div
						v-else-if="offers.length"
						class="overflow-hidden rounded-xl border"
					>
						<div
							v-for="(offer, index) in offers"
							:key="offer.sellerId"
							class="flex min-h-18 items-center justify-between gap-4 px-4 py-3"
							:class="index < offers.length - 1 ? 'border-b' : ''"
						>
							<div class="min-w-0">
								<p class="truncate font-medium">
									<span
										:class="
											isOwnOffer(offer)
												? 'rounded bg-amber-200 px-1.5 py-0.5 text-amber-950'
												: ''
										"
									>
										{{ offer.sellerName || offer.sellerId }}
									</span>
								</p>
								<p class="text-sm text-muted-foreground">
									ID: {{ offer.sellerId }}
								</p>
							</div>
							<p class="shrink-0 text-lg font-semibold">
								<Price :value="offer.price" />
							</p>
						</div>
					</div>
					<Empty
						v-else
						title="product.offersEmpty.title"
						description="product.offersEmpty.description"
					/>
				</div>
			</div>

			<div v-else-if="tab === 1" class="space-y-3">
				<div
					class="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
				>
					<div>
						<p class="font-medium">{{ $t('product.priceRange') }}</p>
						<p
							v-if="product.minPrice && product.maxPrice"
							class="text-base text-muted-foreground"
						>
							<Price :value="product.minPrice" />
							-
							<Price :value="product.maxPrice" />
						</p>
						<p v-else class="text-base text-muted-foreground">
							{{ $t('product.priceRangeEmpty') }}
						</p>
					</div>
					<Button
						size="sm"
						variant="filled"
						color="secondary"
						label="product.changePrice"
						@click="openPriceRange"
					/>
				</div>
				<ProductDumpingToggleButton
					class="w-full"
					:product="product"
					:on-saved="onProductSaved"
					@updated="product = $event"
				/>
			</div>

			<div v-else class="space-y-3">
				<div v-for="log in logs" :key="log._id" class="rounded-xl border p-4">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div>
							<div class="flex items-center gap-2">
								<Price :value="log.oldPrice" class="text-xm font-medium" />
								<MoveRight class="size-4 text-muted-foreground" />
								<Price :value="log.newPrice" class="text-xm font-medium" />
							</div>
							<p class="text-sm text-muted-foreground">
								{{ formatTime(log.updatedAt || log.createdAt) }} |
								{{ $t('product.reason') }}: {{ log.reason }}
							</p>
							<p v-if="log.error" class="text-sm text-destructive">
								{{ log.error }}
							</p>
						</div>
						<Status
							:text="$t(logStatusView(log).text)"
							:status="logStatusView(log).status"
						/>
					</div>
				</div>
				<Empty
					v-if="!logs.length"
					title="product.logsEmpty.title"
					description="product.logsEmpty.description"
				/>
			</div>
		</div>
	</div>

	<Empty
		v-else
		title="product.empty.title"
		description="product.empty.description"
	/>
</template>
