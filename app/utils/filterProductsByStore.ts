import type { Product } from '~/composables/useProducts';

export const filterProductsByStore = (products: Product[], storeIds: string | readonly string[]): Product[] => {
	const ids = typeof storeIds === 'string' ? (storeIds ? [storeIds] : []) : storeIds;
	if (!ids.length) return products;
	const selected = new Set(ids);
	return products.flatMap(product => {
		const stores = product.stores.filter(store => selected.has(store.storeId));
		return stores.length ? [{ ...product, stores }] : [];
	});
};
