<script setup lang="ts">
const drawer = useDrawer();
</script>

<template>
	<ClientOnly>
		<Drawer
			v-for="(item, index) in drawer.stack.value"
			:key="item.id"
			:model-value="true"
			:active="index === drawer.stack.value.length - 1"
			:z-index="9000 + index"
			:width="item.options.width"
			:height="item.options.height"
			:title="item.options.title"
			:position="item.options.position"
			@update:model-value="(value) => !value && drawer.close(item.id)"
		>
			<component
				:is="item.component"
				:data="item.options.data"
				:close="() => drawer.close(item.id)"
			/>
		</Drawer>
	</ClientOnly>
</template>
