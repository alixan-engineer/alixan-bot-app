<script setup lang="ts">
defineProps<{
	close: () => void;
}>();
</script>

<template>
	<div class="p-5 space-y-6">
		<h1 class="text-xl font-semibold">
			{{ $t('onboarding.emailLoginInstruction.title') }}
		</h1>

		<ol class="list-decimal list-inside space-y-3">
			<li>{{ $t('onboarding.emailLoginInstruction.steps.openUsers') }}</li>
			<li>
				{{ $t('onboarding.emailLoginInstruction.steps.fillForm') }}<br />
				{{ $t('onboarding.emailLoginInstruction.form.name') }}<br />
				{{ $t('onboarding.emailLoginInstruction.form.email') }}<br />
				{{ $t('onboarding.emailLoginInstruction.form.phone') }}<br />
				{{ $t('onboarding.emailLoginInstruction.form.city') }}<br />
				{{ $t('onboarding.emailLoginInstruction.form.permissions') }}<br />
				{{ $t('onboarding.emailLoginInstruction.form.save') }}
			</li>
			<li>{{ $t('onboarding.emailLoginInstruction.steps.usePassword') }}</li>
			<li>{{ $t('onboarding.emailLoginInstruction.steps.complete') }}</li>
		</ol>
	</div>
</template>
