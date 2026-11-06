<script setup lang="ts">
const props = defineProps<{
	data: { field: 'priceStep' | 'orderSendStartHour'; value: number };
	close: () => void;
}>();
const settings = useBotSettings();
const toast = useToast();
const value = ref<string | number | null>(props.data.value);
const saving = ref(false);
const error = ref('');
const isPrice = props.data.field === 'priceStep';
const save = async () => {
	if (saving.value) return;
	const number = Number(value.value);
	if (
		!Number.isFinite(number) ||
		(isPrice ? number <= 0 : ![4, 5, 6, 7].includes(number))
	) {
		error.value = isPrice ? 'settings.priceStepError' : 'validation.required';
		return;
	}
	saving.value = true;
	error.value = '';
	try {
		await settings.updateSettings({ [props.data.field]: number });
		toast.open('settings.saved', 'success');
		props.close();
	} catch {
		error.value = 'settings.saveError';
	} finally {
		saving.value = false;
	}
};
</script>

<template>
	<form class="flex max-h-[70dvh] flex-col" @submit.prevent="save">
		<div class="min-h-0 space-y-5 overflow-y-auto p-4 sm:p-6">
			<p class="text-sm leading-6 text-muted-foreground">
				{{
					$t(
						isPrice
							? 'settings.priceStepHint'
							: 'orderBot.sendStartHourDescription',
					)
				}}
			</p>
			<Input
				v-if="isPrice"
				v-model="value"
				type="number"
				inputmode="decimal"
				label="settings.priceStep"
				:disabled="saving"
			/>
			<fieldset
				v-else
				:disabled="saving"
				class="overflow-hidden rounded-xl border"
			>
				<legend class="sr-only">{{ $t('orderBot.sendStartHour') }}</legend>
				<label
					v-for="hour in [4, 5, 6, 7]"
					:key="hour"
					class="flex min-h-14 cursor-pointer items-center justify-between gap-4 border-b px-4 last:border-b-0 has-checked:bg-secondary"
				>
					<span>{{ String(hour).padStart(2, '0') }}:00</span>
					<input
						v-model="value"
						type="radio"
						name="send-hour"
						:value="hour"
						class="size-5 accent-primary"
					/>
				</label>
			</fieldset>
			<p v-if="error" role="alert" class="text-sm text-destructive">
				{{ $t(error) }}
			</p>
		</div>
		<div class="grid shrink-0 grid-cols-2 gap-3 border-t p-4">
			<Button
				variant="filled"
				color="secondary"
				label="common.cancel"
				:disabled="saving"
				@click="close"
			/>
			<Button
				type="submit"
				variant="filled"
				color="primary"
				label="common.save"
				:disabled="saving"
			/>
		</div>
	</form>
</template>
