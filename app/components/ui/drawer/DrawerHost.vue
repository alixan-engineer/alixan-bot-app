<script setup lang="ts">
const drawer = useDrawer();

const open = computed({
	get: () => Boolean(drawer.state.value),
	set: value => {
		if (!value) {
			drawer.close();
		}
	},
});
</script>

<template>
	<ClientOnly>
		<Drawer
			v-model="open"
			:width="drawer.state.value?.options.width"
			:height="drawer.state.value?.options.height"
			:title="drawer.state.value?.options.title"
			:position="drawer.state.value?.options.position"
		>
			<template v-if="drawer.state.value">
				<component
					:is="drawer.state.value.component"
					:data="drawer.state.value.options.data"
					:close="drawer.close"
				/>
			</template>
		</Drawer>
	</ClientOnly>
</template>
