<script setup lang="ts">
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import type { Product } from '~/composables/useProducts';
import ProductConfigDialog from './ProductConfigDialog.vue';

const props = defineProps<{
	product: Product;
	onSaved?: () => Promise<void> | void;
}>();
const emit = defineEmits<{ updated: [product: Product] }>();
const products = useProducts();
const dialog = useDialog();
const toast = useToast();
const loader = useGlobalLoader();

const openConfig = () => {
	dialog.open(ProductConfigDialog, {
		width: '500px',
		height: 'auto',
		title: 'product.changePriceRange',
		data: {
			product: props.product,
			onSaved: props.onSaved,
		},
	});
};

const confirmToggle = () => {
	if (props.product.status === 'draft') {
		openConfig();
		return;
	}

	const isEnabled = props.product.status === 'enable';
	dialog.open(ConfirmDialog, {
		width: '460px',
		height: '260px',
		data: {
			title: isEnabled
				? 'product.disableConfirm.title'
				: 'product.enableConfirm.title',
			description: isEnabled
				? 'product.disableConfirm.description'
				: 'product.enableConfirm.description',
			cancelLabel: 'common.cancel',
			submitLabel: isEnabled ? 'actions.disable' : 'actions.enable',
			submitColor: isEnabled ? 'destructive' : 'primary',
			onSubmit: async () => {
				try {
					loader.show();
					const nextStatus = isEnabled ? 'disable' : 'enable';
					const updated = await products.updateProduct(
						props.product.masterSku,
						{ status: nextStatus, cityId: props.product.cityId },
					);
					emit('updated', updated);
					await props.onSaved?.();
					toast.open(
						nextStatus === 'enable' ? 'product.enabled' : 'product.disabled',
						'success',
					);
				} finally {
					loader.hide();
				}
			},
		},
	});
};
</script>

<template>
	<Island content-class="flex flex-row items-center justify-between gap-4 p-4">
		<div class="min-w-0">
			<p class="font-medium">{{ $t('product.dumpingControl') }}</p>
			<p class="mt-1 text-sm leading-5 text-muted-foreground">
				{{
					$t(
						product.status === 'enable'
							? 'product.dumpingEnabledHint'
							: 'product.dumpingDisabledHint',
					)
				}}
			</p>
		</div>
		<Switch
			:model-value="product.status === 'enable'"
			:aria-label="$t('product.dumpingControl')"
			@update:model-value="confirmToggle"
		/>
	</Island>
</template>
