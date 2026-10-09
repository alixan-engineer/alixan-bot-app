import { StoreKeys } from '~/constants/store-keys';

type RefreshResponse = {
	accessToken: string;
	refreshToken: string;
};

let refreshRequest: Promise<boolean> | null = null;

const getApiBaseUrl = () => {
	if (import.meta.client) {
		const url = new URL(window.location.origin);
		const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(
			url.hostname,
		);

		if (!isLocalhost) {
			return 'https://kaspibot-api.alixan.kz/api';
		}

		url.port = '5102';
		return `${url.origin}/api`;
	}

	return 'http://api:5102/api';
};

const refreshAccessToken = async (apiBaseUrl: string): Promise<boolean> => {
	if (refreshRequest) {
		return await refreshRequest;
	}

	refreshRequest = (async () => {
		const refreshToken = localStorage.getItem(StoreKeys.RefreshToken);

		if (!refreshToken) {
			return false;
		}

		try {
			const data = await $fetch<RefreshResponse>(`${apiBaseUrl}/auth/refresh`, {
				method: 'POST',
				body: { refreshToken },
			});
			localStorage.setItem(StoreKeys.AccessToken, data.accessToken);
			localStorage.setItem(StoreKeys.RefreshToken, data.refreshToken);
			return true;
		} catch {
			localStorage.removeItem(StoreKeys.AccessToken);
			localStorage.removeItem(StoreKeys.RefreshToken);
			return false;
		}
	})();

	try {
		return await refreshRequest;
	} finally {
		refreshRequest = null;
	}
};

export const useApiFetch = async <T>(
	url: string,
	params?: Record<string, any>,
) => {
	const toast = useToast();
	const localePath = useLocalePath();
	const apiBaseUrl = getApiBaseUrl();
	const redirectToSignIn = async () => {
		localStorage.removeItem(StoreKeys.AccessToken);
		localStorage.removeItem(StoreKeys.RefreshToken);
		await navigateTo(localePath('/sign-in'));
	};

	const request = () => {
		const accessToken = localStorage.getItem(StoreKeys.AccessToken);

		return $fetch<T>(`${apiBaseUrl}/${url}`, {
			...params,
			headers: {
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
				...(params?.headers ?? {}),
			},
		});
	};

	try {
		return await request();
	} catch (error: any) {
		const status = error?.response?.status || error?.status;
		const rawMessage = error?.response?._data?.message;
		const message = Array.isArray(rawMessage)
			? rawMessage.join(', ')
			: rawMessage || 'Ошибка';

		if (status === 401 && url !== 'auth/refresh') {
			const refreshed = await refreshAccessToken(apiBaseUrl);

			if (refreshed) {
				return await request();
			}

			await redirectToSignIn();
		}

		switch (status) {
			case 401:
				toast.open(message, 'error');
				break;
			case 400:
			case 403:
				toast.open(message, 'error');
				break;
			case 500:
			case 503:
				toast.open(message, 'error');
				break;
		}

		throw error;
	}
};
