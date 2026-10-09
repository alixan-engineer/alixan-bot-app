import { StoreKeys } from '~/constants/store-keys';

export const useFavoriteProducts = () => {
	const favoriteKeys = useState<string[]>('favorite-products', () => []);
	const initialized = useState<boolean>('favorite-products-initialized', () => false);

	const initialize = (): void => {
		if (initialized.value || !import.meta.client) {
			return;
		}

		try {
			const stored = JSON.parse(
				localStorage.getItem(StoreKeys.FavoriteProducts) ?? '[]',
			);
			favoriteKeys.value = Array.isArray(stored)
				? stored.filter((key): key is string => typeof key === 'string')
				: [];
		} catch {
			favoriteKeys.value = [];
		}

		initialized.value = true;
	};

	const isFavorite = (key: string): boolean => favoriteKeys.value.includes(key);

	const toggle = (key: string): void => {
		initialize();
		favoriteKeys.value = isFavorite(key)
			? favoriteKeys.value.filter(item => item !== key)
			: [...favoriteKeys.value, key];
		localStorage.setItem(
			StoreKeys.FavoriteProducts,
			JSON.stringify(favoriteKeys.value),
		);
	};

	return {
		favoriteKeys: readonly(favoriteKeys),
		initialize,
		isFavorite,
		toggle,
	};
};
