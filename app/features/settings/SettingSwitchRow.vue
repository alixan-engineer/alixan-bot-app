<script setup lang="ts">
type ToggleSetting =
	| 'autoRaiseEnabled'
	| 'smartNearMinEnabled'
	| 'autoDispatchExpressOrders';
const props = defineProps<{
	field: ToggleSetting;
	title: string;
	description: string;
}>();
const settings = useBotSettings();
const saving = ref(false);
const failed = ref(false);
const toast = useToast();
const enabled = computed(() => settings.settings?.[props.field] ?? true);
const save = async (value: boolean) => {
	if (saving.value) return;
	saving.value = true;
	failed.value = false;
	try {
		await settings.updateSettings({ [props.field]: value });
		toast.open('settings.saved', 'success');
	} catch {
		failed.value = true;
	} finally {
		saving.value = false;
	}
};
</script>

<template>
	<ListTile :title="title" :description="description" :aria-busy="saving">
		<p v-if="failed" role="alert" class="mt-2 text-sm text-destructive">
			{{ $t('settings.saveError') }}
		</p>
		<template #trailing>
			<Switch
				:model-value="enabled"
				:disabled="saving || settings.loading || !settings.settings"
				:aria-label="$t(title)"
				class="relative after:absolute after:-inset-2.5"
				@update:model-value="save"
			/>
		</template>
	</ListTile>
</template>
