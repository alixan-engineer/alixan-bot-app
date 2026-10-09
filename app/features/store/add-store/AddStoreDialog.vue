<script setup lang="ts">
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

const phone = ref('');
const code = ref('');
const merchantIds = ref<string[]>([]);
const setup = ref<Setup>();
const busy = ref(false);
const error = ref('');
const stores = useStores();
let timer: ReturnType<typeof setTimeout> | undefined;
let mounted = true;

const request = async (action: string, body: Record<string, unknown> = {}) => {
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
		error.value = setup.value.error ?? '';
	} catch {
		error.value =
			'Запрос не выполнен. Проверьте сообщение об ошибке и повторите.';
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

const next = () => {
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
		<div class="flex-1 p-6 space-y-6 overflow-y-auto">
			<InfoBox>
				Введите номер владельца магазина и подтвердите вход кодом из SMS.
				Название и города складов загрузятся из Kaspi.
			</InfoBox>
			<PhoneInput v-if="!setup" v-model="phone" :disabled="busy" required />
			<label v-if="setup?.state === 'sms'" class="block">
				Код из SMS Kaspi
				<input
					v-model="code"
					inputmode="numeric"
					autocomplete="one-time-code"
					maxlength="6"
					class="mt-2 w-full rounded-lg border p-3"
					@keyup.enter="next"
				/>
			</label>
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
			<p v-if="error" role="alert" class="text-destructive">{{ error }}</p>
		</div>
		<div class="flex gap-3 border-t p-4">
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
					(setup?.state === 'merchants' && !merchantIds.length)
				"
				@click="next"
			>
				{{
					busy
						? 'Подождите…'
						: !setup
						? 'Получить SMS'
						: setup.state === 'merchants'
						? `Подключить (${merchantIds.length})`
						: 'Подтвердить'
				}}
			</Button>
		</div>
	</div>
</template>
