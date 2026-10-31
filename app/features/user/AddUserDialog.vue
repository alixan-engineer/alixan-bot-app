<script setup lang="ts">
import { Check, Copy } from '@lucide/vue';
import type { User } from '~/interfaces/user.interface';

type CreatedUser = User & { password: string };

const props = defineProps<{
	data?: { onCreated?: () => Promise<void> | void };
	close: () => void;
}>();

const name = ref('');
const phone = ref('');
const password = ref('');
const loading = ref(false);
const created = ref<CreatedUser | null>(null);
const copied = ref(false);

const createUser = async () => {
	loading.value = true;
	try {
		created.value = await useApiFetch<CreatedUser>('users', {
			method: 'POST',
			body: {
				name: name.value.trim(),
				phone: phone.value.trim(),
				password: password.value,
			},
		});
		copied.value = false;
		await props.data?.onCreated?.();
	} finally {
		loading.value = false;
	}
};

const copyCredentials = async () => {
	if (!created.value) return;
	await navigator.clipboard.writeText(
		`Логин: ${created.value.phone}\nПароль: ${created.value.password}`,
	);
	copied.value = true;
};
</script>

<template>
	<div class="size-full p-6">
		<form
			v-if="!created"
			class="flex size-full flex-col"
			@submit.prevent="createUser"
		>
			<InfoBox class="mb-8">
				Введите имя и номер пользователя, которого хотите добавить.
			</InfoBox>
			<Input v-model="name" label="Имя" required :min="2" minlength="2" />
			<PhoneInput v-model="phone" required />
			<PasswordInput
				v-model="password"
				label="Придумайте пароль"
				required
				:min="8"
			/>
			<div class="flex-1" />
			<div class="grid grid-cols-2 gap-2">
				<Button color="secondary" label="common.cancel" @click="close" />
				<Button type="submit" color="primary" :disabled="loading">
					Добавить
				</Button>
			</div>
		</form>

		<div v-else class="flex size-full flex-col gap-4">
			<div>
				<p class="font-semibold">Данные нового пользователя</p>
				<p class="mt-2 text-sm text-muted-foreground">
					Пароль показывается только сейчас. Скопируйте его перед закрытием.
				</p>
			</div>
			<div
				class="rounded-xl border border-primary/30 bg-primary/5 p-4 font-mono text-sm"
			>
				<p>Логин: {{ created.phone }}</p>
				<p class="mt-1">Пароль: {{ created.password }}</p>
			</div>
			<Button variant="outlined" @click="copyCredentials">
				<template #leading><component :is="copied ? Check : Copy" /></template>
				{{ copied ? 'Скопировано' : 'Копировать логин и пароль' }}
			</Button>
			<div class="flex-1" />
			<Button color="primary" label="common.close" @click="close" />
		</div>
	</div>
</template>
