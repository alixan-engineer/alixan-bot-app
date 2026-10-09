<script setup lang="ts">
const dialog = useDialog();
</script>

<template>
	<ClientOnly>
		<Dialog
			v-for="item in dialog.state.value"
			:key="item.id"
			:model-value="true"
			:width="item.options.width"
			:height="item.options.height"
			:title="item.options.title"
			@update:model-value="value => !value && dialog.close(item.id)"
		>
			<component
				:is="item.component"
				:data="item.options.data"
				:close="() => dialog.close(item.id)"
			/>
		</Dialog>
	</ClientOnly>
</template>
