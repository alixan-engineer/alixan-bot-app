<script setup lang="ts">
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';
import { StoreKeys } from '~/constants/store-keys';
import type {
	SignInPayload,
	SignInResponse,
} from '~/interfaces/auth.interface';

definePageMeta({
	layout: 'auth',
});

usePageMeta({
	title: 'seo.pages.signIn.title',
	description: 'seo.pages.signIn.description',
});

const phone = ref<string>('');
const password = ref<string>('');

const dialog = useDialog();
const localePath = useLocalePath();
const { t } = useI18n();

const openAlert = () => {
	dialog.open(AlertDialog, {
		width: '360px',
		height: '280px',
		data: {
			title: t('auth.formRequired.title'),
			description: t('auth.formRequired.description'),
			buttonLabel: t('common.ok'),
			buttonColor: 'destructive',
			mediaComponent: 'Lottie',
			mediaProps: {
				name: 'error',
				loop: false,
				width: '80px',
				height: '80px',
			},
		},
	});
};
const signIn = async (payload: SignInPayload) => {
	if (!phone.value || !password.value) {
		openAlert();
		return;
	}

	const { show, hide } = useGlobalLoader();
	const userStore = useUser();

	try {
		show();
		const data = await useApiFetch<SignInResponse>('auth/sign-in', {
			method: 'POST',
			body: payload,
		});
		localStorage.setItem(StoreKeys.AccessToken, data.accessToken);
		localStorage.setItem(StoreKeys.RefreshToken, data.refreshToken);
		userStore.setUser(data.user);
		navigateTo(localePath('/'));
	} finally {
		hide();
	}
};
</script>

<template>
	<form class="contents" @submit.prevent="signIn({ phone, password })">
		<div class="text-center">
			<h1
				class="text-2xl font-bold tracking-tight sm:text-3xl sm:tracking-normal"
			>
				{{ $t('auth.signIn') }}
			</h1>
			<p class="mt-2 text-sm text-muted-foreground sm:mt-4 sm:text-base">
				{{ $t('auth.signInDescription') }}
			</p>
		</div>

		<div class="space-y-3">
			<PhoneInput v-model="phone" required />
			<PasswordInput v-model="password" required :min="8" :max="32" />
		</div>

		<Button
			type="submit"
			color="primary"
			size="lg"
			:label="$t('auth.submitSignIn')"
		/>
	</form>
</template>
