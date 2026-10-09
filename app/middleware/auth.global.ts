import { StoreKeys } from '~/constants/store-keys';

export default defineNuxtRouteMiddleware((to) => {
	const localePath = useLocalePath();
	const hasSession = Boolean(
		localStorage.getItem(StoreKeys.AccessToken) ||
			localStorage.getItem(StoreKeys.RefreshToken),
	);
	const route = to.path.replace(/^\/(ru|kk|en)(?=\/|$)/, '') || '/';
	const isSignIn = route === '/sign-in';

	if (!hasSession && !isSignIn) {
		return navigateTo(localePath('/sign-in'));
	}

	if (hasSession && isSignIn) {
		return navigateTo(localePath('/'));
	}
});
