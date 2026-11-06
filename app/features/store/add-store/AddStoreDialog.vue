<script setup lang="ts">
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';
const props = defineProps<{ close: () => void }>();

type ConnectionResult = {
	merchantId: string;
	name: string;
	state: 'queued' | 'connecting' | 'done' | 'error';
	error?: string;
	storeId?: string;
};

type Setup = {
	id: string;
	expiresAt: number;
	state: 'sms' | 'merchants' | 'connecting' | 'done' | 'error';
	merchants: Array<{ id: string; name: string }>;
	error?: string;
	results?: ConnectionResult[];
};

const steps = [
	{ id: 'phone', label: 'store.onboarding.phone' },
	{ id: 'sms', label: 'store.onboarding.sms' },
	{ id: 'merchants', label: 'store.onboarding.merchants' },
];
const selectedStep = computed(() => {
	if (!setup.value) return steps[0];
	return setup.value.state === 'sms' ? steps[1] : steps[2];
});

const phone = ref('');
const code = ref('');
const merchantIds = ref<string[]>([]);
const setup = ref<Setup>();
const busy = ref(false);
const error = ref('');
const stores = useStores();
const dialog = useDialog();
let lastAlertError = '';
const showError = (message: string, inDialog: boolean) => {
	if (!mounted || !message) return;
	if (!inDialog) {
		error.value = message;
		return;
	}
	if (message === lastAlertError) return;
	lastAlertError = message;
	dialog.open(AlertDialog, {
		width: '360px',
		height: '320px',
		data: {
			title: 'common.error',
			description: message,
			buttonLabel: 'common.ok',
			buttonColor: 'primary',
			mediaComponent: 'Lottie',
			mediaProps: { name: 'error', loop: false, width: '80px', height: '80px' },
		},
	});
};
let timer: ReturnType<typeof setTimeout> | undefined;
let mounted = true;

const request = async (action: string, body: Record<string, unknown> = {}) => {
	if (busy.value || !mounted) return;
	clearTimeout(timer);
	const useAlert = !setup.value || setup.value.state === 'sms';
	if (action !== 'status') lastAlertError = '';
	error.value = '';
	busy.value = true;
	try {
		const previousState = setup.value?.state;
		setup.value = await useApiFetch<Setup>(`stores/onboarding/${action}`, {
			method: 'POST',
			body: { id: setup.value?.id, ...body },
		});
		if (setup.value.state === 'merchants' && previousState !== 'merchants') {
			merchantIds.value =
				setup.value.merchants.length === 1
					? [setup.value.merchants[0]!.id]
					: [];
		}
		if (setup.value.state === 'connecting' && mounted)
			timer = setTimeout(() => {
				void request('status');
			}, 2000);
		if (setup.value.state === 'done') await stores.getStores();
		if (setup.value.error) showError(setup.value.error, useAlert);
	} catch (cause) {
		const apiError = cause as { data?: { message?: string | string[] } };
		const message = apiError?.data?.message;
		showError(
			(Array.isArray(message) ? message.join(', ') : message) || 'common.requestFailed',
			useAlert,
		);
		// Recover an ambiguous response by reading state, never by resending SMS or creating a user again.
		if (mounted && setup.value && Date.now() < setup.value.expiresAt) {
			timer = setTimeout(() => {
				void request('status');
			}, 5000);
		}
	} finally {
		busy.value = false;
	}
};

const backToPhone = async () => {
	if (busy.value || setup.value?.state !== 'sms') return;
	clearTimeout(timer);
	busy.value = true;
	lastAlertError = '';
	try {
		await useApiFetch('stores/onboarding/cancel', {
			method: 'POST',
			body: { id: setup.value.id },
		});
		if (!mounted) return;
		setup.value = undefined;
		code.value = '';
		merchantIds.value = [];
		error.value = '';
	} catch (cause) {
		const message = (cause as { data?: { message?: string | string[] } })?.data?.message;
		showError(
			(Array.isArray(message) ? message.join(', ') : message) || 'common.requestFailed',
			true,
		);
	} finally {
		busy.value = false;
	}
};

const next = () => {
	if (busy.value) return;
	if (!setup.value && !/^\d{10}$/.test(phone.value)) return;
	if (setup.value?.state === 'sms' && !/^\d{6}$/.test(code.value)) return;
	if (!setup.value) return request('start', { phone: `+7${phone.value}` });
	if (setup.value.state === 'sms')
		return request('sms', { code: code.value }).finally(() => {
			code.value = '';
		});
	if (setup.value.state === 'merchants')
		return request('connect', { merchantIds: merchantIds.value });
	return request('status');
};

onBeforeUnmount(() => {
	mounted = false;
	clearTimeout(timer);
	if (setup.value && setup.value.state !== 'connecting')
		void useApiFetch('stores/onboarding/cancel', {
			method: 'POST',
			body: { id: setup.value.id },
		}).catch(() => {});
});
</script>

<template>
	<div class="size-full flex flex-col">
		<Stepper :steps="steps" :selected="selectedStep" class="shrink-0 px-4" />
		<div class="min-h-0 flex-1 p-6 space-y-6 overflow-y-auto">
			<InfoBox v-if="!setup">
				Введите номер владельца магазина
			</InfoBox>
			<PhoneInput v-if="!setup" v-model="phone" :disabled="busy" autofocus />
			<template v-if="setup?.state === 'sms'">
				<InfoBox>Введите код из SMS</InfoBox>
				<fieldset :disabled="busy" class="min-w-0">
					<legend class="sr-only">Введите код из SMS</legend>
					<OtpInput v-model="code" autofocus :length="6" class="mx-auto w-full" @keyup.enter="next" />
				</fieldset>
			</template>
			<template v-if="setup?.state === 'merchants'">
				<fieldset class="space-y-3">
					<legend class="mb-3">
						По указанному номеру доступно магазинов:
						{{ setup.merchants.length }}. Выберите, какие подключить к боту.
					</legend>
					<label
						v-for="merchant in setup.merchants"
						:key="merchant.id"
						class="flex items-center gap-3 rounded-lg border p-3 cursor-pointer"
					>
						<input
							v-model="merchantIds"
							type="checkbox"
							:value="merchant.id"
							:disabled="busy"
							class="size-4 accent-primary"
						/>
						<span
							>{{ merchant.name }}
							<span class="text-sm text-muted-foreground"
								>({{ merchant.id }})</span
							></span
						>
					</label>
				</fieldset>
				<p class="text-sm text-muted-foreground">
					Выбрано: {{ merchantIds.length }} из {{ setup.merchants.length }}.
				</p>
				<InfoBox>
					В Kaspi будет добавлен пользователь Alixan Bot со всеми правами для
					работы бота. Пароль и код из письма бот получит автоматически.
				</InfoBox>
			</template>
			<InfoBox v-if="setup?.state === 'connecting'">
				Подключаем выбранные магазины по очереди. Получение писем и вход могут
				занять несколько минут для каждого магазина.
			</InfoBox>
			<InfoBox v-if="setup?.state === 'done'">
				Подключение завершено. Подключено:
				{{ setup.results?.filter(item => item.state === 'done').length ?? 0 }}
				из {{ setup.results?.length ?? 0 }}.
			</InfoBox>
			<ul v-if="setup?.results?.length" class="space-y-3" aria-live="polite">
				<li
					v-for="result in setup.results"
					:key="result.merchantId"
					class="rounded-lg border p-3"
				>
					<p>
						{{ result.name }}
						<span class="text-sm text-muted-foreground"
							>({{ result.merchantId }})</span
						>
					</p>
					<p
						:class="
							result.state === 'error'
								? 'text-destructive'
								: 'text-muted-foreground'
						"
						class="mt-1 text-sm"
					>
						{{
							result.state === 'done'
								? 'Подключён'
								: result.state === 'connecting'
								? 'Подключаем…'
								: result.state === 'queued'
								? 'Ожидает подключения'
								: result.error ?? 'Не удалось подключить'
						}}
					</p>
				</li>
			</ul>
			<p v-if="error && setup && setup.state !== 'sms'" role="alert" class="text-destructive">{{ $t(error) }}</p>
		</div>
		<div class="flex shrink-0 gap-3 border-t p-4">
			<Button
				v-if="setup?.state === 'sms'"
				class="flex-1"
				variant="filled"
				color="secondary"
				label="common.back"
				:disabled="busy"
				@click="backToPhone"
			/>
			<Button
				v-if="setup?.state === 'done' || setup?.state === 'error'"
				class="flex-1"
				color="primary"
				@click="close"
			>
				Готово
			</Button>
			<Button
				v-else
				class="flex-1"
				color="primary"
				:disabled="
					busy ||
					(!setup && !/^\d{10}$/.test(phone)) ||
					setup?.state === 'connecting' ||
					(setup?.state === 'sms' && !/^\d{6}$/.test(code)) ||
					(setup?.state === 'merchants' && !merchantIds.length)
				"
				@click="next"
			>
				{{
					busy
						? 'Подождите…'
						: !setup
						? 'Получить SMS'
						: setup.state === 'connecting'
						? 'Подключаем…'
						: setup.state === 'merchants'
						? `Подключить (${merchantIds.length})`
						: 'Подтвердить'
				}}
			</Button>
		</div>
	</div>
</template>
